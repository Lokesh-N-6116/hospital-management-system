/**
 * Prescription Controller
 * Handles prescription authoring, database transactions, soft-deletions,
 * and automated clinical safety verification.
 */
const pool = require('../config/db');
const DrugSafetyService = require('../services/drugSafetyService');
const { recordAuditLog } = require('../middlewares/auth');

async function getPrescriptions(req, res) {
    try {
        const { patientId, doctorId, activeOnly } = req.query;

        let sql = `
            SELECT p.*,
                   p_patient.mrn, p_patient.first_name AS patient_first_name, p_patient.last_name AS patient_last_name,
                   CONCAT(s.first_name, ' ', s.last_name) AS doctor_name, s.specialization
            FROM prescriptions p
            JOIN patients p_patient ON p.patient_id = p_patient.patient_id
            JOIN staff_profiles s ON p.doctor_id = s.staff_id
            WHERE 1=1
        `;
        const params = [];

        if (patientId) {
            sql += ` AND p.patient_id = ?`;
            params.push(parseInt(patientId, 10));
        }

        if (doctorId) {
            sql += ` AND p.doctor_id = ?`;
            params.push(parseInt(doctorId, 10));
        }

        if (activeOnly === 'true') {
            sql += ` AND p.is_active = TRUE`;
        }

        sql += ` ORDER BY p.prescription_date DESC LIMIT 50`;

        const [prescriptions] = await pool.query(sql, params);

        // Fetch medicine items for each prescription
        for (const p of prescriptions) {
            const [items] = await pool.query(
                `SELECT pm.*, m.name, m.generic_name, m.category, m.dosage_form, m.strength
                 FROM prescription_medicines pm
                 JOIN medicines m ON pm.medicine_id = m.medicine_id
                 WHERE pm.prescription_id = ?`,
                [p.prescription_id]
            );
            p.items = items;
        }

        return res.json({
            success: true,
            count: prescriptions.length,
            prescriptions
        });
    } catch (error) {
        console.error('[PrescriptionController.getPrescriptions] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve prescriptions.' });
    }
}

async function createPrescription(req, res) {
    const connection = await pool.getConnection();
    try {
        const {
            patientId,
            recordId,
            instructions,
            medicines, // Array of: { medicineId, dosage, frequency, duration, instructions }
            forceOverride // Boolean flag if doctor acknowledged safety warning
        } = req.body;

        if (!patientId || !medicines || medicines.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID and at least one medication item are required.'
            });
        }

        const doctorId = req.user.staffId;
        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Doctor staff profile is required to author a prescription.'
            });
        }

        // 1. Run Drug Safety Audit
        const medicineIds = medicines.map(m => m.medicineId);
        const safetyAudit = await DrugSafetyService.fullSafetyAudit(patientId, medicineIds);

        // If severe risks exist and doctor did not explicitly confirm override
        if (!safetyAudit.isSafe && !forceOverride) {
            return res.status(409).json({
                success: false,
                isSafetyAlert: true,
                message: 'Drug safety conflicts detected with patient profile or co-prescribed medications.',
                interactions: safetyAudit.interactions,
                allergyAlerts: safetyAudit.allergyAlerts
            });
        }

        // 2. Perform ACID Transaction in MySQL
        await connection.beginTransaction();

        // Insert Master Prescription
        const [prescResult] = await connection.query(
            `INSERT INTO prescriptions (patient_id, doctor_id, record_id, instructions, is_active)
             VALUES (?, ?, ?, ?, TRUE)`,
            [patientId, doctorId, recordId || null, instructions || null]
        );

        const prescriptionId = prescResult.insertId;

        // Insert Line Items
        for (const item of medicines) {
            await connection.query(
                `INSERT INTO prescription_medicines (prescription_id, medicine_id, dosage, frequency, duration, instructions)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    prescriptionId,
                    item.medicineId,
                    item.dosage,
                    item.frequency,
                    item.duration,
                    item.instructions || null
                ]
            );
        }

        await connection.commit();

        recordAuditLog(
            req.user.userId,
            'CREATE_PRESCRIPTION',
            'prescriptions',
            prescriptionId,
            req.ip,
            `Doctor authored prescription #${prescriptionId} with ${medicines.length} medications. Override: ${!!forceOverride}`
        );

        return res.status(201).json({
            success: true,
            message: 'Prescription successfully created and committed.',
            prescriptionId,
            safetyWarningsOverridden: !safetyAudit.isSafe
        });
    } catch (error) {
        await connection.rollback();
        console.error('[PrescriptionController.createPrescription] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create prescription. Transaction rolled back.' });
    } finally {
        connection.release();
    }
}

async function deactivatePrescription(req, res) {
    try {
        const prescriptionId = parseInt(req.params.id, 10);
        const { reason } = req.body;

        // Soft deletion: marks is_active = FALSE without destroying historical data
        const [result] = await pool.query(
            'UPDATE prescriptions SET is_active = FALSE WHERE prescription_id = ?',
            [prescriptionId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Prescription not found.' });
        }

        recordAuditLog(
            req.user.userId,
            'DEACTIVATE_PRESCRIPTION',
            'prescriptions',
            prescriptionId,
            req.ip,
            `Deactivated prescription #${prescriptionId}. Reason: ${reason || 'N/A'}`
        );

        return res.json({
            success: true,
            message: 'Prescription has been discontinued/deactivated.'
        });
    } catch (error) {
        console.error('[PrescriptionController.deactivatePrescription] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to deactivate prescription.' });
    }
}

module.exports = {
    getPrescriptions,
    createPrescription,
    deactivatePrescription
};
