const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptomController');
const { protect } = require('../middleware/auth');

router.post('/', protect, symptomController.addSymptom);
router.get('/', protect, symptomController.getSymptoms);
router.put('/:id', protect, symptomController.updateSymptom);
router.delete('/:id', protect, symptomController.deleteSymptom);

module.exports = router;

