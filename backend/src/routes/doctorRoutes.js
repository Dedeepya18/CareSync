const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/dashboard', protect, authorize('doctor'), doctorController.getDashboard);
router.get('/patients', protect, authorize('doctor'), doctorController.getConsentedPatients);
router.get('/patients/:patientId', protect, authorize('doctor'), doctorController.getPatientDetails);
router.post('/notes', protect, authorize('doctor'), doctorController.addDoctorNote);
router.get('/profile', protect, authorize('doctor'), doctorController.getProfile);
router.put('/profile', protect, authorize('doctor'), doctorController.updateProfile);

module.exports = router;

