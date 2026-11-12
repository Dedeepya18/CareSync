const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    documentType: {
      type: String,
      enum: [
        'prescription',
        'lab_report',
        'medical_certificate',
        'scan_report',
        'discharge_summary',
        'vaccination_card',
        'other',
      ],
      default: 'lab_report',
    },
    originalFilename: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    issuingDoctorOrClinic: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

medicalRecordSchema.index({ patient: 1, uploadDate: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);

