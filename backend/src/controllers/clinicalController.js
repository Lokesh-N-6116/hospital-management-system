/**
 * Clinical Controller
 * Handles diagnostic documentation, clinical consultation notes, and medical reports.
 * Authored primarily by Doctors.
 */
const pool = require('../config/db');
const { recordAuditLog } = require('../middlewares/auth');

async function createMedicalRecord(req, res) {
    try {
        const {
            patientId,
            appointmentId,
            diagnosisTitle,
            symptoms,
            physicalExamination,
            treatmentPlan
        } = req.body;

        if (!patientId || !diagnosisTitle) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID and Diagnosis Title are required.'
            });
        }

        const doctorId = req.user.staffId;
        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Doctor staff profile is required to author a clinical record.'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO medical_records 
             (patient_id, doctor_id, appointment_id, diagnosis_title, symptoms, physical_examination, treatment_plan)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                patientId,
                doctorId,
                appointmentId || null,
                diagnosisTitle,
                symptoms || null,
                physicalExamination || null,
                treatmentPlan || null
            ]
        );

        // If tied to an appointment, mark appointment status as 'in_consultation' or 'completed'
        if (appointmentId) {
            await pool.query(
                "UPDATE appointments SET status = 'in_consultation' WHERE appointment_id = ? AND status = 'checked_in'",
                [appointmentId]
            );
        }

        recordAuditLog(
            req.user.userId,
            'CREATE_MEDICAL_RECORD',
            'medical_records',
            result.insertId,
            req.ip,
            `Documented diagnosis: '${diagnosisTitle}' for patient ID: ${patientId}`
        );

        return res.status(201).json({
            success: true,
            message: 'Clinical diagnostic record created successfully.',
            recordId: result.insertId
        });
    } catch (error) {
        console.error('[ClinicalController.createMedicalRecord] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create medical record.' });
    }
}

async function getRecordsByPatient(req, res) {
    try {
        const patientId = parseInt(req.params.patientId, 10);

        const [records] = await pool.query(
            `SELECT r.*, CONCAT(s.first_name, ' ', s.last_name) AS doctor_name, s.specialization
             FROM medical_records r
             JOIN staff_profiles s ON r.doctor_id = s.staff_id
             WHERE r.patient_id = ?
             ORDER BY r.record_date DESC`,
            [patientId]
        );

        return res.json({
            success: true,
            count: records.length,
            records
        });
    } catch (error) {
        console.error('[ClinicalController.getRecordsByPatient] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve medical records.' });
    }
}

async function uploadMedicalReport(req, res) {
    try {
        const {
            patientId,
            recordId,
            reportTitle,
            reportType,
            fileUrl,
            reportDate,
            summaryNotes
        } = req.body;

        if (!patientId || !reportTitle || !reportType || !fileUrl) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID, report title, report type, and file URL are required.'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO medical_reports 
             (patient_id, uploaded_by_user_id, record_id, report_title, report_type, file_url, report_date, summary_notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patientId,
                req.user.userId,
                recordId || null,
                reportTitle,
                reportType,
                fileUrl,
                reportDate || new Date().toISOString().split('T')[0],
                summaryNotes || null
            ]
        );

        recordAuditLog(
            req.user.userId,
            'UPLOAD_REPORT',
            'medical_reports',
            result.insertId,
            req.ip,
            `Uploaded report: '${reportTitle}' (${reportType}) for patient ID: ${patientId}`
        );

        return res.status(201).json({
            success: true,
            message: 'Medical report recorded successfully.',
            reportId: result.insertId
        });
    } catch (error) {
        console.error('[ClinicalController.uploadMedicalReport] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to record medical report.' });
    }
}

module.exports = {
    createMedicalRecord,
    getRecordsByPatient,
    uploadMedicalReport
};
