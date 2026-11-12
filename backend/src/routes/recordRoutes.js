const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, upload.single('file'), recordController.uploadRecord);
router.get('/', protect, recordController.getRecords);
router.get('/:id/download', protect, recordController.downloadRecord);
router.delete('/:id', protect, recordController.deleteRecord);

module.exports = router;

