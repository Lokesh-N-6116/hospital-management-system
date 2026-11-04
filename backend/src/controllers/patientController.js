/**
 * Patient Controller
 * Handles patient registration, demographics updates, comprehensive clinical history,
 * and allergy documentation.
 */
const pool = require('../config/db');
const { recordAuditLog } = require('../middlewares/auth');

async function getPatients(req, res) {
    try {
        const { search, bloodGroup, limit = 50, offset = 0 } = req.query;

        let sql = `
            SELECT p.*,
                   (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = p.patient_id) AS total_appointments,
                   (SELECT COUNT(*) FROM allergies al WHERE al.patient_id = p.patient_id) AS total_allergies
            FROM patients p
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            sql += ` AND (p.mrn LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR p.phone LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term, term, term);
        }

        if (bloodGroup) {
            sql += ` AND p.blood_group = ?`;
            params.push(bloodGroup);
        }

        sql += ` ORDER BY p.patient_id DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit, 10), parseInt(offset, 10));

        const [patients] = await pool.query(sql, params);

        return res.json({
            success: true,
            count: patients.length,
            patients
        });
    } catch (error) {
        console.error('[PatientController.getPatients] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve patients.' });
    }
}

async function getPatientById(req, res) {
    try {
        const patientId = parseInt(req.params.id, 10);
        if (isNaN(patientId)) {
            return res.status(400).json({ success: false, message: 'Invalid patient ID.' });
        }

        // 1. Demographics
        const [patients] = await pool.query('SELECT * FROM patients WHERE patient_id = ?', [patientId]);
        if (patients.length === 0) {
            return res.status(404).json({ success: false, message: 'Patient not found.' });
        }
        const patient = patients[0];

        // 2. Allergies
        const [allergies] = await pool.query(
            'SELECT * FROM allergies WHERE patient_id = ? ORDER BY severity DESC, created_at DESC',
            [patientId]
        );

        // 3. Vitals History
        const [vitals] = await pool.query(
            `SELECT v.*, CONCAT(s.first_name, ' ', s.last_name) AS recorded_by_nurse_name
             FROM patient_vitals v
             JOIN staff_profiles s ON v.recorded_by_nurse_id = s.staff_id
             WHERE v.patient_id = ?
             ORDER BY v.recorded_at DESC LIMIT 10`,
            [patientId]
        );

        // 4. Appointments
        const [appointments] = await pool.query(
            `SELECT a.*, 
                    CONCAT(s.first_name, ' ', s.last_name) AS doctor_name,
                    s.specialization,
                    d.name AS department_name
             FROM appointments a
             JOIN staff_profiles s ON a.doctor_id = s.staff_id
             LEFT JOIN departments d ON s.department_id = d.department_id
             WHERE a.patient_id = ?
             ORDER BY a.appointment_datetime DESC`,
            [patientId]
        );

        // 5. Medical Records (Diagnoses)
        const [records] = await pool.query(
            `SELECT r.*, CONCAT(s.first_name, ' ', s.last_name) AS doctor_name
             FROM medical_records r
             JOIN staff_profiles s ON r.doctor_id = s.staff_id
             WHERE r.patient_id = ?
             ORDER BY r.record_date DESC`,
            [patientId]
        );

        // 6. Prescriptions with detailed medicine line items
        const [prescriptions] = await pool.query(
            `SELECT p.*, CONCAT(s.first_name, ' ', s.last_name) AS doctor_name
             FROM prescriptions p
             JOIN staff_profiles s ON p.doctor_id = s.staff_id
             WHERE p.patient_id = ?
             ORDER BY p.prescription_date DESC`,
            [patientId]
        );

        for (const presc of prescriptions) {
            const [items] = await pool.query(
                `SELECT pm.*, m.name, m.generic_name, m.category, m.dosage_form, m.strength
                 FROM prescription_medicines pm
                 JOIN medicines m ON pm.medicine_id = m.medicine_id
                 WHERE pm.prescription_id = ?`,
                [presc.prescription_id]
            );
            presc.items = items;
        }

        // 7. Medical Reports / Files
        const [reports] = await pool.query(
            `SELECT rep.*, u.username AS uploaded_by_username
             FROM medical_reports rep
             JOIN users u ON rep.uploaded_by_user_id = u.user_id
             WHERE rep.patient_id = ?
             ORDER BY rep.report_date DESC`,
            [patientId]
        );

        return res.json({
            success: true,
            patient,
            allergies,
            vitals,
            appointments,
            records,
            prescriptions,
            reports
        });
    } catch (error) {
        console.error('[PatientController.getPatientById] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve patient profile.' });
    }
}

async function createPatient(req, res) {
    try {
        const {
            firstName,
            lastName,
            dateOfBirth,
            gender,
            bloodGroup,
            phone,
            email,
            address,
            emergencyContactName,
            emergencyContactPhone
        } = req.body;

        if (!firstName || !lastName || !dateOfBirth || !gender || !phone) {
            return res.status(400).json({
                success: false,
                message: 'First name, last name, date of birth, gender, and phone number are required.'
            });
        }

        // Generate unique MRN (PAT-YYYY-XXXX)
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        const mrn = `PAT-${year}-${rand}`;

        const [result] = await pool.query(
            `INSERT INTO patients (mrn, first_name, last_name, date_of_birth, gender, blood_group,
                                   phone, email, address, emergency_contact_name, emergency_contact_phone)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                mrn,
                firstName,
                lastName,
                dateOfBirth,
                gender,
                bloodGroup || null,
                phone,
                email || null,
                address || null,
                emergencyContactName || null,
                emergencyContactPhone || null
            ]
        );

        recordAuditLog(
            req.user.userId,
            'CREATE_PATIENT',
            'patients',
            result.insertId,
            req.ip,
            `Registered patient: ${firstName} ${lastName} (MRN: ${mrn})`
        );

        return res.status(201).json({
            success: true,
            message: 'Patient registered successfully.',
            patientId: result.insertId,
            mrn
        });
    } catch (error) {
        console.error('[PatientController.createPatient] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to register patient.' });
    }
}

async function updatePatient(req, res) {
    try {
        const patientId = parseInt(req.params.id, 10);
        const {
            firstName,
            lastName,
            dateOfBirth,
            gender,
            bloodGroup,
            phone,
            email,
            address,
            emergencyContactName,
            emergencyContactPhone
        } = req.body;

        const [result] = await pool.query(
            `UPDATE patients 
             SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, blood_group = ?,
                 phone = ?, email = ?, address = ?, emergency_contact_name = ?, emergency_contact_phone = ?
             WHERE patient_id = ?`,
            [
                firstName,
                lastName,
                dateOfBirth,
                gender,
                bloodGroup || null,
                phone,
                email || null,
                address || null,
                emergencyContactName || null,
                emergencyContactPhone || null,
                patientId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Patient not found.' });
        }

        recordAuditLog(
            req.user.userId,
            'UPDATE_PATIENT',
            'patients',
            patientId,
            req.ip,
            `Updated demographics for patient ID: ${patientId}`
        );

        return res.json({
            success: true,
            message: 'Patient information updated successfully.'
        });
    } catch (error) {
        console.error('[PatientController.updatePatient] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update patient.' });
    }
}

async function addAllergy(req, res) {
    try {
        const patientId = parseInt(req.params.id, 10);
        const { allergen, reaction, severity, notes } = req.body;

        if (!allergen || !severity) {
            return res.status(400).json({ success: false, message: 'Allergen name and severity are required.' });
        }

        const [result] = await pool.query(
            `INSERT INTO allergies (patient_id, allergen, reaction, severity, notes)
             VALUES (?, ?, ?, ?, ?)`,
            [patientId, allergen, reaction || null, severity, notes || null]
        );

        recordAuditLog(
            req.user.userId,
            'ADD_ALLERGY',
            'allergies',
            result.insertId,
            req.ip,
            `Recorded allergy '${allergen}' (${severity}) for patient ID: ${patientId}`
        );

        return res.status(201).json({
            success: true,
            message: 'Allergy recorded successfully.',
            allergyId: result.insertId
        });
    } catch (error) {
        console.error('[PatientController.addAllergy] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to record allergy.' });
    }
}

async function deleteAllergy(req, res) {
    try {
        const allergyId = parseInt(req.params.allergyId, 10);
        const [result] = await pool.query('DELETE FROM allergies WHERE allergy_id = ?', [allergyId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Allergy record not found.' });
        }

        recordAuditLog(req.user.userId, 'DELETE_ALLERGY', 'allergies', allergyId, req.ip, `Deleted allergy ID: ${allergyId}`);

        return res.json({ success: true, message: 'Allergy record deleted.' });
    } catch (error) {
        console.error('[PatientController.deleteAllergy] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete allergy record.' });
    }
}

module.exports = {
    getPatients,
    getPatientById,
    createPatient,
    updatePatient,
    addAllergy,
    deleteAllergy
};
