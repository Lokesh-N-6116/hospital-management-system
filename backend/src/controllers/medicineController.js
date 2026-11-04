/**
 * Medicine & Drug Safety Controller
 * Provides pharmaceutical catalog search, interaction references,
 * and real-time drug conflict check endpoints.
 */
const pool = require('../config/db');
const DrugSafetyService = require('../services/drugSafetyService');

async function getMedicines(req, res) {
    try {
        const { search, category } = req.query;

        let sql = 'SELECT * FROM medicines WHERE 1=1';
        const params = [];

        if (search) {
            sql += ' AND (name LIKE ? OR generic_name LIKE ? OR category LIKE ?)';
            const term = `%${search}%`;
            params.push(term, term, term);
        }

        if (category) {
            sql += ' AND category = ?';
            params.push(category);
        }

        sql += ' ORDER BY name ASC';

        const [medicines] = await pool.query(sql, params);

        return res.json({
            success: true,
            count: medicines.length,
            medicines
        });
    } catch (error) {
        console.error('[MedicineController.getMedicines] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve medicine catalog.' });
    }
}

async function getDrugInteractions(req, res) {
    try {
        const sql = `
            SELECT di.*,
                   m1.name AS medicine_1_name, m1.generic_name AS medicine_1_generic,
                   m2.name AS medicine_2_name, m2.generic_name AS medicine_2_generic
            FROM drug_interactions di
            JOIN medicines m1 ON di.medicine_id_1 = m1.medicine_id
            JOIN medicines m2 ON di.medicine_id_2 = m2.medicine_id
            ORDER BY di.severity DESC
        `;
        const [interactions] = await pool.query(sql);

        return res.json({
            success: true,
            count: interactions.length,
            interactions
        });
    } catch (error) {
        console.error('[MedicineController.getDrugInteractions] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve drug interactions.' });
    }
}

async function checkSafety(req, res) {
    try {
        const { patientId, medicineIds } = req.body;

        if (!medicineIds || !Array.isArray(medicineIds) || medicineIds.length === 0) {
            return res.json({
                success: true,
                isSafe: true,
                hasSevereRisks: false,
                interactions: [],
                allergyAlerts: []
            });
        }

        const report = await DrugSafetyService.fullSafetyAudit(patientId, medicineIds);

        return res.json({
            success: true,
            ...report
        });
    } catch (error) {
        console.error('[MedicineController.checkSafety] Error:', error);
        return res.status(500).json({ success: false, message: 'Failed to evaluate drug safety.' });
    }
}

module.exports = {
    getMedicines,
    getDrugInteractions,
    checkSafety
};
