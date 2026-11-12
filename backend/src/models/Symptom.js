const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    symptomName: {
      type: String,
      required: [true, 'Symptom name is required'],
      trim: true,
    },
    severity: {
      type: Number,
      required: [true, 'Severity rating (1-10) is required'],
      min: 1,
      max: 10,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required (e.g. 2 hours, 3 days)'],
      trim: true,
    },
    onsetDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    bodyLocation: {
      type: String,
      default: 'General',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'improving', 'worsening', 'resolved'],
      default: 'active',
    },
    triggers: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

symptomSchema.index({ patient: 1, onsetDate: -1 });

module.exports = mongoose.model('Symptom', symptomSchema);

