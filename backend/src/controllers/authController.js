/**
 * Authentication Controller
 * Handles user login, password verification, JWT generation, and identity introspection.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { recordAuditLog } = require('../middlewares/auth');

async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Both username and password are required.'
            });
        }

        // Fetch user record with staff profile
        const [users] = await pool.query(
            `SELECT u.user_id, u.username, u.email, u.password_hash, u.role, u.is_active,
                    s.staff_id, s.first_name, s.last_name, s.department_id, s.specialization,
                    d.name AS department_name
             FROM users u
             LEFT JOIN staff_profiles s ON u.user_id = s.user_id
             LEFT JOIN departments d ON s.department_id = d.department_id
             WHERE u.username = ? OR u.email = ?`,
            [username, username]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials. User does not exist.'
            });
        }

        const user = users[0];

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Account deactivated. Please contact the hospital administrator.'
            });
        }

        // Verify password hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password. Please try again.'
            });
        }

        // Generate signed JWT
        const payload = {
            userId: user.user_id,
            username: user.username,
            role: user.role,
            staffId: user.staff_id
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        });

        // Record successful login audit log
        recordAuditLog(user.user_id, 'USER_LOGIN', 'users', user.user_id, req.ip, `Role: ${user.role}`);

        return res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
                userId: user.user_id,
                username: user.username,
                email: user.email,
                role: user.role,
                staffId: user.staff_id,
                firstName: user.first_name,
                lastName: user.last_name,
                fullName: user.first_name ? `${user.first_name} ${user.last_name}` : user.username,
                departmentId: user.department_id,
                departmentName: user.department_name,
                specialization: user.specialization
            }
        });
    } catch (error) {
        console.error('[AuthController.login] Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during login.'
        });
    }
}

async function getCurrentUser(req, res) {
    return res.json({
        success: true,
        user: req.user
    });
}

module.exports = {
    login,
    getCurrentUser
};
