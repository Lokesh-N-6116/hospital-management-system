/**
 * Appointment Controller
 * Handles booking, schedule concurrency checks, status updates, and calendar listings.
 */
const pool = require('../config/db');
const { recordAuditLog } = require('../middlewares/auth');

async function getAppointments(req, res) {
    try {
        const { date, doctorId, patientId, status } = req.query;

        let sql = `
            SELECT a.*,
                   p.mrn, p.first_name AS patient_first_name, p.last_name AS patient_last_name, p.phone AS patient_phone,
                   CONCAT(s.first_name, ' ', s.last_name) AS doctor_name, s.specialization,
                   d.name AS department_name
            FROM appointments a
            JOIN patients p ON a.patient_id = p.patient_id
            JOIN staff_profiles s ON a.doctor_id = s.staff_id
            LEFT JOIN departments d ON s.department_id = d.department_id
            WHERE 1=1
        `;
        const params = [];

        if (date) {
            sql += ` AND DATE(a.appointment_datetime) = ?`;
            params.push(date);
        }

        if (doctorId) {
            sql += ` AND a.doctor_id = ?`;
            params.push(parseInt(doctorId, 10));
        }

        if (patientId) {
            sql += ` AND a.patient_id = ?`;
            params.push(parseInt(patientId, 10));
        }

        if (status) {
            sql += ` AND a.status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY a.appointment_datetime ASC`;

        const [appointments] = await pool.query(sql, params);

        return res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error('[AppointmentController.getAppointments] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve appointments.' });
    }
}

async function createAppointment(req, res) {
    try {
        const { patientId, doctorId, appointmentDatetime, reason } = req.body;

        if (!patientId || !doctorId || !appointmentDatetime) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID, Doctor ID, and Appointment Date/Time are required.'
            });
        }

        // Concurrency Check: Prevent double-booking the doctor at the exact same time slot (+/- 15 mins)
        const [conflict] = await pool.query(
            `SELECT appointment_id FROM appointments 
             WHERE doctor_id = ? 
               AND status NOT IN ('cancelled', 'completed')
               AND appointment_datetime BETWEEN DATE_SUB(?, INTERVAL 14 MINUTE) AND DATE_ADD(?, INTERVAL 14 MINUTE)`,
            [doctorId, appointmentDatetime, appointmentDatetime]
        );

        if (conflict.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Scheduling Conflict: Doctor already has an active appointment around this time slot. Please choose another time.'
            });
        }

        // Staff scheduling ID (defaults to current user's staff profile)
        const scheduledByStaffId = req.user.staffId || 1;

        const [result] = await pool.query(
            `INSERT INTO appointments (patient_id, doctor_id, scheduled_by_staff_id, appointment_datetime, reason, status)
             VALUES (?, ?, ?, ?, ?, 'scheduled')`,
            [patientId, doctorId, scheduledByStaffId, appointmentDatetime, reason || null]
        );

        recordAuditLog(
            req.user.userId,
            'SCHEDULE_APPOINTMENT',
            'appointments',
            result.insertId,
            req.ip,
            `Booked appointment for patient ID: ${patientId} with doctor ID: ${doctorId} at ${appointmentDatetime}`
        );

        return res.status(201).json({
            success: true,
            message: 'Appointment successfully scheduled.',
            appointmentId: result.insertId
        });
    } catch (error) {
        console.error('[AppointmentController.createAppointment] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to schedule appointment.' });
    }
}

async function updateAppointmentStatus(req, res) {
    try {
        const appointmentId = parseInt(req.params.id, 10);
        const { status } = req.body;

        const validStatuses = ['scheduled', 'checked_in', 'in_consultation', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: [${validStatuses.join(', ')}]`
            });
        }

        const [result] = await pool.query(
            'UPDATE appointments SET status = ? WHERE appointment_id = ?',
            [status, appointmentId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Appointment not found.' });
        }

        recordAuditLog(
            req.user.userId,
            'UPDATE_APPOINTMENT_STATUS',
            'appointments',
            appointmentId,
            req.ip,
            `Updated status to '${status}'`
        );

        return res.json({
            success: true,
            message: `Appointment status updated to '${status}'.`
        });
    } catch (error) {
        console.error('[AppointmentController.updateAppointmentStatus] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update appointment status.' });
    }
}

module.exports = {
    getAppointments,
    createAppointment,
    updateAppointmentStatus
};
