const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/patient/:patientId', vitalsController.getPatientVitals);
router.post('/', authorizeRoles('nurse', 'doctor', 'admin'), vitalsController.recordVitals);

module.exports = router;
