const mongoose = require('mongoose');

const medicationLogSchema = new mongoose.Schema(
  {
    medication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medication',
      required: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scheduledDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    scheduledTime: {
      type: String, // HH:mm
      required: true,
    },
    status: {
      type: String,
      enum: ['taken', 'missed', 'skipped'],
      required: true,
    },
    actionTime: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

medicationLogSchema.index({ patient: 1, scheduledDate: -1 });
medicationLogSchema.index({ medication: 1, scheduledDate: 1, scheduledTime: 1 });

module.exports = mongoose.model('MedicationLog', medicationLogSchema);

