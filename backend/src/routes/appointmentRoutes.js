const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', appointmentController.getAppointments);
router.post('/', authorizeRoles('receptionist', 'admin', 'doctor'), appointmentController.createAppointment);
router.patch('/:id/status', authorizeRoles('receptionist', 'doctor', 'nurse', 'admin'), appointmentController.updateAppointmentStatus);

module.exports = router;
