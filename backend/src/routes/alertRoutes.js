const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const { protect } = require('../middleware/auth');

router.get('/', protect, alertController.getAlerts);
router.put('/:id/read', protect, alertController.markAsRead);
router.put('/:id/dismiss', protect, alertController.dismissAlert);
router.post('/run-analysis', protect, alertController.runAnalysis);

module.exports = router;

