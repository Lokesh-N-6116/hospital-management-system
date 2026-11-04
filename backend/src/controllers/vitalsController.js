/**
 * Patient Vitals Controller
 * Primary clinical responsibility for Nurses.
 * Logs hemodynamic and physiological parameters (BP, Pulse, Temp, SpO2).
 */
const pool = require('../config/db');
const { recordAuditLog } = require('../middlewares/auth');

async function getPatientVitals(req, res) {
    try {
        const patientId = parseInt(req.params.patientId, 10);

        const [vitals] = await pool.query(
            `SELECT v.*, CONCAT(s.first_name, ' ', s.last_name) AS recorded_by_nurse_name
             FROM patient_vitals v
             JOIN staff_profiles s ON v.recorded_by_nurse_id = s.staff_id
             WHERE v.patient_id = ?
             ORDER BY v.recorded_at DESC`,
            [patientId]
        );

        return res.json({
            success: true,
            count: vitals.length,
            vitals
        });
    } catch (error) {
        console.error('[VitalsController.getPatientVitals] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve patient vitals.' });
    }
}

async function recordVitals(req, res) {
    try {
        const {
            patientId,
            appointmentId,
            systolicBp,
            diastolicBp,
            heartRate,
            temperatureCelsius,
            respiratoryRate,
            oxygenSaturation,
            notes
        } = req.body;

        if (!patientId) {
            return res.status(400).json({ success: false, message: 'Patient ID is required.' });
        }

        // Must have staff profile ID
        const recordedByNurseId = req.user.staffId;
        if (!recordedByNurseId) {
            return res.status(400).json({ success: false, message: 'Staff profile required to record vitals.' });
        }

        const [result] = await pool.query(
            `INSERT INTO patient_vitals 
             (patient_id, appointment_id, recorded_by_nurse_id, systolic_bp, diastolic_bp, 
              heart_rate, temperature_celsius, respiratory_rate, oxygen_saturation, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patientId,
                appointmentId || null,
                recordedByNurseId,
                systolicBp || null,
                diastolicBp || null,
                heartRate || null,
                temperatureCelsius || null,
                respiratoryRate || null,
                oxygenSaturation || null,
                notes || null
            ]
        );

        // Clinical warning assessment
        let clinicalWarning = null;
        if (systolicBp >= 160 || diastolicBp >= 100) {
            clinicalWarning = 'HYPERTENSIVE CRISIS ALERT: High blood pressure detected.';
        } else if (oxygenSaturation && oxygenSaturation < 92) {
            clinicalWarning = 'HYPOXIA ALERT: Low oxygen saturation level (<92%).';
        }

        recordAuditLog(
            req.user.userId,
            'RECORD_VITALS',
            'patient_vitals',
            result.insertId,
            req.ip,
            `Recorded vitals for patient ID: ${patientId}. BP: ${systolicBp}/${diastolicBp}, HR: ${heartRate}, SpO2: ${oxygenSaturation}%`
        );

        return res.status(201).json({
            success: true,
            message: 'Patient vitals successfully recorded.',
            vitalsId: result.insertId,
            warning: clinicalWarning
        });
    } catch (error) {
        console.error('[VitalsController.recordVitals] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to record vitals.' });
    }
}

module.exports = {
    getPatientVitals,
    recordVitals
};
