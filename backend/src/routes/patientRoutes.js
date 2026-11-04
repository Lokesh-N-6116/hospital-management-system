const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

router.use(verifyToken);

// Read patient records (All staff)
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatientById);

// Create / Update patient demographics (Receptionists & Admins only)
router.post('/', authorizeRoles('receptionist', 'admin'), patientController.createPatient);
router.put('/:id', authorizeRoles('receptionist', 'admin'), patientController.updatePatient);

// Allergy documentation (Doctors & Nurses can document; Doctors & Admin can delete)
router.post('/:id/allergies', authorizeRoles('doctor', 'nurse', 'admin'), patientController.addAllergy);
router.delete('/allergies/:allergyId', authorizeRoles('doctor', 'admin'), patientController.deleteAllergy);

module.exports = router;
