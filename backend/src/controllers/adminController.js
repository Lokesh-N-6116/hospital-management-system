/**
 * Administrator Controller
 * Staff account lifecycle, role delegation, audit trail inspection,
 * and high-level system analytics.
 */
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { recordAuditLog } = require('../middlewares/auth');

async function getStaff(req, res) {
    try {
        const { role, departmentId } = req.query;

        let sql = `
            SELECT s.*, u.username, u.email, u.role, u.is_active, u.created_at AS account_created_at,
                   d.name AS department_name
            FROM staff_profiles s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN departments d ON s.department_id = d.department_id
            WHERE 1=1
        `;
        const params = [];

        if (role) {
            sql += ' AND u.role = ?';
            params.push(role);
        }

        if (departmentId) {
            sql += ' AND s.department_id = ?';
            params.push(parseInt(departmentId, 10));
        }

        sql += ' ORDER BY s.staff_id ASC';

        const [staff] = await pool.query(sql, params);

        return res.json({
            success: true,
            count: staff.length,
            staff
        });
    } catch (error) {
        console.error('[AdminController.getStaff] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve staff profiles.' });
    }
}

async function createStaff(req, res) {
    const connection = await pool.getConnection();
    try {
        const {
            username,
            email,
            password,
            role,
            firstName,
            lastName,
            phone,
            departmentId,
            licenseNumber,
            specialization
        } = req.body;

        if (!username || !email || !password || !role || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, password, role, first name, and last name are required.'
            });
        }

        const validRoles = ['admin', 'doctor', 'nurse', 'receptionist'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Must be one of: [${validRoles.join(', ')}]`
            });
        }

        // Check if username or email already exists
        const [existing] = await connection.query(
            'SELECT user_id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'A user with this username or email already exists.'
            });
        }

        await connection.beginTransaction();

        // 1. Hash password with bcrypt
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 2. Insert into users
        const [userResult] = await connection.query(
            'INSERT INTO users (username, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, TRUE)',
            [username, email, passwordHash, role]
        );
        const userId = userResult.insertId;

        // 3. Insert into staff_profiles
        const [staffResult] = await connection.query(
            `INSERT INTO staff_profiles 
             (user_id, department_id, first_name, last_name, phone, license_number, specialization, staff_type)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                departmentId || null,
                firstName,
                lastName,
                phone || null,
                licenseNumber || null,
                specialization || null,
                role
            ]
        );

        await connection.commit();

        recordAuditLog(
            req.user.userId,
            'CREATE_STAFF_ACCOUNT',
            'users',
            userId,
            req.ip,
            `Created staff account for ${firstName} ${lastName} with role '${role}'`
        );

        return res.status(201).json({
            success: true,
            message: 'Staff account successfully created.',
            userId,
            staffId: staffResult.insertId
        });
    } catch (error) {
        await connection.rollback();
        console.error('[AdminController.createStaff] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create staff account.' });
    } finally {
        connection.release();
    }
}

async function toggleUserStatus(req, res) {
    try {
        const userId = parseInt(req.params.id, 10);
        const { isActive } = req.body;

        // Prevent admin from deactivating their own account
        if (userId === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: 'Security protection: You cannot deactivate your own administrative account.'
            });
        }

        const [result] = await pool.query(
            'UPDATE users SET is_active = ? WHERE user_id = ?',
            [isActive, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        recordAuditLog(
            req.user.userId,
            isActive ? 'ACTIVATE_USER' : 'DEACTIVATE_USER',
            'users',
            userId,
            req.ip,
            `Set is_active = ${isActive} for user ID: ${userId}`
        );

        return res.json({
            success: true,
            message: `User status successfully updated to ${isActive ? 'Active' : 'Inactive'}.`
        });
    } catch (error) {
        console.error('[AdminController.toggleUserStatus] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update user status.' });
    }
}

async function getAuditLogs(req, res) {
    try {
        const { limit = 100, action } = req.query;

        let sql = `
            SELECT al.*, u.username, u.role
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.user_id
            WHERE 1=1
        `;
        const params = [];

        if (action) {
            sql += ' AND al.action = ?';
            params.push(action);
        }

        sql += ' ORDER BY al.created_at DESC LIMIT ?';
        params.push(parseInt(limit, 10));

        const [logs] = await pool.query(sql, params);

        return res.json({
            success: true,
            count: logs.length,
            logs
        });
    } catch (error) {
        console.error('[AdminController.getAuditLogs] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs.' });
    }
}

async function getDashboardStats(req, res) {
    try {
        const [[{ totalPatients }]] = await pool.query('SELECT COUNT(*) AS totalPatients FROM patients');
        const [[{ totalAppointments }]] = await pool.query('SELECT COUNT(*) AS totalAppointments FROM appointments');
        const [[{ todayAppointments }]] = await pool.query('SELECT COUNT(*) AS todayAppointments FROM appointments WHERE DATE(appointment_datetime) = CURDATE()');
        const [[{ totalStaff }]] = await pool.query('SELECT COUNT(*) AS totalStaff FROM staff_profiles');
        const [[{ totalPrescriptions }]] = await pool.query('SELECT COUNT(*) AS totalPrescriptions FROM prescriptions');
        const [[{ totalMedicines }]] = await pool.query('SELECT COUNT(*) AS totalMedicines FROM medicines');
        const [[{ activeDoctors }]] = await pool.query("SELECT COUNT(*) AS activeDoctors FROM users WHERE role = 'doctor' AND is_active = TRUE");

        const [recentActivity] = await pool.query(
            `SELECT al.*, u.username, u.role 
             FROM audit_logs al 
             LEFT JOIN users u ON al.user_id = u.user_id 
             ORDER BY al.created_at DESC LIMIT 8`
        );

        return res.json({
            success: true,
            stats: {
                totalPatients,
                totalAppointments,
                todayAppointments,
                totalStaff,
                totalPrescriptions,
                totalMedicines,
                activeDoctors
            },
            recentActivity
        });
    } catch (error) {
        console.error('[AdminController.getDashboardStats] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to calculate system stats.' });
    }
}

async function getDepartments(req, res) {
    try {
        const [departments] = await pool.query('SELECT * FROM departments ORDER BY name ASC');
        return res.json({ success: true, departments });
    } catch (error) {
        console.error('[AdminController.getDepartments] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve departments.' });
    }
}

module.exports = {
    getStaff,
    createStaff,
    toggleUserStatus,
    getAuditLogs,
    getDashboardStats,
    getDepartments
};
