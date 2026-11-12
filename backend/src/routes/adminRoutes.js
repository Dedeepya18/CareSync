const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/dashboard', protect, authorize('admin'), adminController.getDashboard);
router.get('/users', protect, authorize('admin'), adminController.getUsers);
router.put('/users/:id/status', protect, authorize('admin'), adminController.toggleUserStatus);

module.exports = router;

