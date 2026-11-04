const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

router.use(verifyToken);

// Departments listing
router.get('/departments', adminController.getDepartments);

// Staff listing (Receptionist and Doctor can list doctors to schedule appointments)
router.get('/staff', authorizeRoles('admin', 'receptionist', 'doctor', 'nurse'), adminController.getStaff);

// Staff account creation & lifecycle: Strictly ADMIN ONLY
router.post('/staff', authorizeRoles('admin'), adminController.createStaff);
router.patch('/users/:id/status', authorizeRoles('admin'), adminController.toggleUserStatus);

// Audit logs: Strictly ADMIN ONLY
router.get('/audit-logs', authorizeRoles('admin'), adminController.getAuditLogs);

// System dashboard metrics
router.get('/stats', authorizeRoles('admin', 'doctor'), adminController.getDashboardStats);

module.exports = router;
