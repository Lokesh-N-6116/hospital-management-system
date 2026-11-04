/**
 * Authentication and Role-Based Access Control (RBAC) Middleware
 * Enforces security strictly at the backend level.
 */
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * 1. verifyToken
 * Validates the JWT Bearer token sent in the HTTP Authorization header.
 * If valid, fetches the latest user status and staff profile, attaching it to req.user.
 */
async function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. No valid Bearer token provided in header.'
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user status and staff profile from DB to ensure account is not deactivated
        const [rows] = await pool.query(
            `SELECT u.user_id, u.username, u.email, u.role, u.is_active,
                    s.staff_id, s.first_name, s.last_name, s.department_id, s.specialization
             FROM users u
             LEFT JOIN staff_profiles s ON u.user_id = s.user_id
             WHERE u.user_id = ?`,
            [decoded.userId]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'User account not found.' });
        }

        const user = rows[0];
        if (!user.is_active) {
            return res.status(403).json({ success: false, message: 'This user account has been deactivated.' });
        }

        req.user = {
            userId: user.user_id,
            username: user.username,
            email: user.email,
            role: user.role,
            staffId: user.staff_id,
            firstName: user.first_name,
            lastName: user.last_name,
            fullName: user.first_name ? `${user.first_name} ${user.last_name}` : user.username,
            departmentId: user.department_id,
            specialization: user.specialization
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid or malformed authentication token.' });
    }
}

/**
 * 2. authorizeRoles
 * Accepts one or more role strings, e.g. authorizeRoles('doctor', 'admin')
 * Ensures the logged-in user possesses one of the authorized roles.
 */
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Your role '${req.user.role}' is not authorized to perform this operation. Required: [${allowedRoles.join(', ')}]`
            });
        }

        next();
    };
}

/**
 * 3. recordAuditLog
 * Non-blocking helper to log audit events into the database
 */
async function recordAuditLog(userId, action, targetTable, targetId, ip, details) {
    try {
        await pool.query(
            `INSERT INTO audit_logs (user_id, action, target_table, target_id, ip_address, details)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, action, targetTable, targetId, ip || '127.0.0.1', details || null]
        );
    } catch (err) {
        console.error('[AuditLog] Error recording audit event:', err.message);
    }
}

module.exports = {
    verifyToken,
    authorizeRoles,
    recordAuditLog
};
