/**
 * Drug Safety & Clinical Decision Support Service
 * Performs real-time drug-drug interaction detection and allergy conflict cross-checking.
 */
const pool = require('../config/db');

class DrugSafetyService {
    /**
     * Checks for pairwise drug interactions among a list of medicine IDs.
     * @param {Array<number>} medicineIds
     * @returns {Promise<Array>} List of detected interactions with severity and recommendations
     */
    static async checkInteractions(medicineIds) {
        if (!medicineIds || medicineIds.length < 2) {
            return [];
        }

        // Clean and ensure unique integer IDs
        const uniqueIds = Array.from(new Set(medicineIds.map(id => parseInt(id, 10)))).filter(id => !isNaN(id));
        if (uniqueIds.length < 2) {
            return [];
        }

        // Generate all ordered pairs (id1 < id2)
        const pairs = [];
        for (let i = 0; i < uniqueIds.length; i++) {
            for (let j = i + 1; j < uniqueIds.length; j++) {
                const id1 = Math.min(uniqueIds[i], uniqueIds[j]);
                const id2 = Math.max(uniqueIds[i], uniqueIds[j]);
                pairs.push([id1, id2]);
            }
        }

        if (pairs.length === 0) return [];

        // Build parameterized SQL query for all pairs
        // e.g. WHERE (medicine_id_1 = ? AND medicine_id_2 = ?) OR (...)
        const clauses = pairs.map(() => '(di.medicine_id_1 = ? AND di.medicine_id_2 = ?)').join(' OR ');
        const flattenedParams = pairs.flat();

        const sql = `
            SELECT 
                di.interaction_id,
                di.medicine_id_1,
                di.medicine_id_2,
                di.severity,
                di.description,
                di.recommendation,
                m1.name AS medicine_1_name,
                m1.generic_name AS medicine_1_generic,
                m2.name AS medicine_2_name,
                m2.generic_name AS medicine_2_generic
            FROM drug_interactions di
            JOIN medicines m1 ON di.medicine_id_1 = m1.medicine_id
            JOIN medicines m2 ON di.medicine_id_2 = m2.medicine_id
            WHERE ${clauses}
        `;

        const [interactions] = await pool.query(sql, flattenedParams);
        return interactions;
    }

    /**
     * Checks if any prescribed medicine conflicts with known patient allergies.
     * @param {number} patientId
     * @param {Array<number>} medicineIds
     * @returns {Promise<Array>} List of allergy collision alerts
     */
    static async checkAllergies(patientId, medicineIds) {
        if (!patientId || !medicineIds || medicineIds.length === 0) {
            return [];
        }

        // 1. Fetch patient's recorded allergies
        const [allergies] = await pool.query(
            'SELECT allergy_id, allergen, reaction, severity, notes FROM allergies WHERE patient_id = ?',
            [patientId]
        );

        if (allergies.length === 0) {
            return [];
        }

        // 2. Fetch medicines details
        const placeholders = medicineIds.map(() => '?').join(',');
        const [medicines] = await pool.query(
            `SELECT medicine_id, name, generic_name, category, description FROM medicines WHERE medicine_id IN (${placeholders})`,
            medicineIds
        );

        const allergyAlerts = [];

        // 3. Cross-reference allergen string against medicine name, generic name, category, and description
        for (const allergy of allergies) {
            const allergenLower = allergy.allergen.toLowerCase().trim();

            for (const med of medicines) {
                const medSearchText = `${med.name} ${med.generic_name} ${med.category} ${med.description || ''}`.toLowerCase();
                
                // Direct match or substring overlap (e.g., 'Penicillin' in 'Antibiotic (Penicillin class)' or 'Amoxicillin')
                const isMatch = medSearchText.includes(allergenLower) || 
                    (allergenLower === 'penicillin' && (medSearchText.includes('amoxicillin') || medSearchText.includes('ampicillin'))) ||
                    (allergenLower === 'aspirin' && medSearchText.includes('nsaid'));

                if (isMatch) {
                    allergyAlerts.push({
                        patientId,
                        allergyId: allergy.allergy_id,
                        allergen: allergy.allergen,
                        severity: allergy.severity,
                        reaction: allergy.reaction,
                        medicineId: med.medicine_id,
                        medicineName: med.name,
                        genericName: med.generic_name,
                        message: `WARNING: Patient has a recorded ${allergy.severity} allergy to '${allergy.allergen}', which conflicts with '${med.name}' (${med.generic_name}).`
                    });
                }
            }
        }

        return allergyAlerts;
    }

    /**
     * Comprehensive safety audit combining drug interactions & allergy warnings
     */
    static async fullSafetyAudit(patientId, medicineIds) {
        const [interactions, allergyAlerts] = await Promise.all([
            this.checkInteractions(medicineIds),
            this.checkAllergies(patientId, medicineIds)
        ]);

        const hasSevereInteractions = interactions.some(i => i.severity === 'major' || i.severity === 'contraindicated');
        const hasSevereAllergies = allergyAlerts.some(a => a.severity === 'severe');

        return {
            isSafe: interactions.length === 0 && allergyAlerts.length === 0,
            hasSevereRisks: hasSevereInteractions || hasSevereAllergies,
            interactions,
            allergyAlerts
        };
    }
}

module.exports = DrugSafetyService;
