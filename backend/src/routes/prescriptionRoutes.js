const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

router.use(verifyToken);

// Read prescriptions: Doctors and Nurses can view
router.get('/', authorizeRoles('doctor', 'nurse', 'admin'), prescriptionController.getPrescriptions);

// Prescribe medication: Strictly DOCTOR ONLY
router.post('/', authorizeRoles('doctor'), prescriptionController.createPrescription);

// Deactivate prescription: Strictly DOCTOR ONLY (Nurses cannot modify or delete)
router.patch('/:id/deactivate', authorizeRoles('doctor'), prescriptionController.deactivatePrescription);

module.exports = router;
