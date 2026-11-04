const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);

router.get('/', medicineController.getMedicines);
router.get('/interactions', medicineController.getDrugInteractions);
router.post('/check-safety', medicineController.checkSafety);

module.exports = router;
