const express = require('express');
const router = express.Router();
const consentController = require('../controllers/consentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.post('/', protect, authorize('patient'), consentController.createConsent);
router.get('/', protect, authorize('patient'), consentController.getConsents);
router.put('/:id/revoke', protect, authorize('patient'), consentController.revokeConsent);
router.put('/:id/permissions', protect, authorize('patient'), consentController.updatePermissions);

module.exports = router;

