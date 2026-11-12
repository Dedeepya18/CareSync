const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/profile', protect, patientController.getProfile);
router.put('/profile', protect, authorize('patient'), patientController.updateProfile);
router.get('/dashboard', protect, authorize('patient'), patientController.getDashboard);
router.get('/doctors', protect, patientController.getDoctorsList);

module.exports = router;

