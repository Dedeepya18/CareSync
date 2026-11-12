const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.get('/health-summary', protect, aiController.getHealthSummary);

module.exports = router;

