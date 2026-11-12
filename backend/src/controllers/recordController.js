const fs = require('fs');
const path = require('path');
const MedicalRecord = require('../models/MedicalRecord');
const Consent = require('../models/Consent');

// @desc    Upload a medical record/document
// @route   POST /api/records/upload
// @access  Private (Patient)
exports.uploadRecord = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file provided for upload.',
      });
    }

    const { title, documentType, description, tags, issuingDoctorOrClinic } = req.body;

    if (!title) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Document title is required.',
      });
    }

    let parsedTags = [];
    if (tags) {
      parsedTags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    }

    const relativePath = `/uploads/${path.basename(req.file.path)}`;

    const record = await MedicalRecord.create({
      patient: req.user.id,
      title: title.trim(),
      documentType: documentType || 'lab_report',
      originalFilename: req.file.originalname,
      filePath: relativePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      description: description || '',
      tags: parsedTags,
      issuingDoctorOrClinic: issuingDoctorOrClinic || '',
    });

    res.status(201).json({
      success: true,
      message: 'Medical document uploaded and cataloged successfully.',
      record,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get medical records list
// @route   GET /api/records
// @access  Private (Patient, Doctor with consent)
exports.getRecords = async (req, res, next) => {
  try {
    const patientId = req.query.patientId || req.user.id;
    const { type, search } = req.query;

    // Check doctor access permissions if doctor is requesting another user's records
    if (req.user.role === 'doctor' && req.user.id !== patientId) {
      const consent = await Consent.findOne({
        patient: patientId,
        doctor: req.user.id,
        status: 'active',
      });

      if (!consent || !consent.permissions.shareMedicalRecords) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Patient has not consented to share medical records with your account.',
        });
      }
    }

    const query = { patient: patientId };
    if (type) query.documentType = type;
    if (search) query.title = { $regex: search, $options: 'i' };

    const records = await MedicalRecord.find(query).sort({ uploadDate: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download / Stream a medical document
// @route   GET /api/records/:id/download
// @access  Private (Owner or Doctor with consent)
exports.downloadRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found.',
      });
    }

    // Authorization check
    const isOwner = record.patient.toString() === req.user.id.toString();
    let hasConsent = false;

    if (!isOwner && req.user.role === 'doctor') {
      const consent = await Consent.findOne({
        patient: record.patient,
        doctor: req.user.id,
        status: 'active',
      });
      hasConsent = !!(consent && consent.permissions.shareMedicalRecords);
    }

    if (!isOwner && !hasConsent && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this patient document.',
      });
    }

    const filename = path.basename(record.filePath);
    const fullPath = path.join(__dirname, '../../uploads', filename);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: 'File physical asset missing from server storage.',
      });
    }

    res.download(fullPath, record.originalFilename);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medical record
// @route   DELETE /api/records/:id
// @access  Private (Owner only)
exports.deleteRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findOne({
      _id: req.params.id,
      patient: req.user.id,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found or unauthorized.',
      });
    }

    // Remove file from disk
    const filename = path.basename(record.filePath);
    const fullPath = path.join(__dirname, '../../uploads', filename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.warn('File unlinking error:', err.message);
      }
    }

    await record.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Medical record and file successfully deleted.',
    });
  } catch (error) {
    next(error);
  }
};

