const express = require('express');
const router = express.Router();
const clinicalController = require('../controllers/clinicalController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

router.use(verifyToken);

// Diagnosis records: Doctors only can create
router.post('/records', authorizeRoles('doctor'), clinicalController.createMedicalRecord);
router.get('/records/patient/:patientId', authorizeRoles('doctor', 'nurse', 'admin'), clinicalController.getRecordsByPatient);

// Lab and diagnostic reports
router.post('/reports', authorizeRoles('doctor', 'nurse', 'admin'), clinicalController.uploadMedicalReport);

module.exports = router;
