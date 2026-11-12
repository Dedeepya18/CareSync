const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true,
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required (e.g. 50mg, 1 tablet)'],
      trim: true,
    },
    frequency: {
      type: String,
      enum: ['Once daily', 'Twice daily', 'Three times daily', 'Four times daily', 'As needed', 'Every other day', 'Weekly'],
      default: 'Once daily',
    },
    route: {
      type: String,
      enum: ['Oral', 'Sublingual', 'Inhalation', 'Injection', 'Topical', 'Other'],
      default: 'Oral',
    },
    purpose: {
      type: String,
      default: '',
    },
    instructions: {
      type: String,
      default: 'Take with water after meals',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: null,
    },
    reminderTimes: {
      type: [String], // e.g. ["08:00", "20:00"]
      default: ['08:00'],
    },
    prescriberName: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

medicationSchema.index({ patient: 1, isActive: 1 });

module.exports = mongoose.model('Medication', medicationSchema);

