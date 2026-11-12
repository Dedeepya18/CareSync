const express = require('express');
const router = express.Router();
const medicationController = require('../controllers/medicationController');
const { protect } = require('../middleware/auth');

router.post('/', protect, medicationController.addMedication);
router.get('/', protect, medicationController.getMedications);
router.put('/:id', protect, medicationController.updateMedication);
router.delete('/:id', protect, medicationController.deleteMedication);
router.post('/:id/log', protect, medicationController.logMedicationAction);
router.get('/adherence', protect, medicationController.getAdherenceStats);

module.exports = router;

