const express = require('express');
const router = express.Router();
const metricController = require('../controllers/metricController');
const { protect } = require('../middleware/auth');

router.post('/', protect, metricController.addMetric);
router.get('/', protect, metricController.getMetrics);
router.get('/summary', protect, metricController.getSummary);
router.delete('/:id', protect, metricController.deleteMetric);

module.exports = router;

