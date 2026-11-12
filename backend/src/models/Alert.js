const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'trend_warning',
        'threshold_breach',
        'medication_adherence',
        'preventive_checkup',
        'emergency_advisory',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'warning',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true, // Explainable reason for final CSE presentation
    },
    metric: {
      type: String,
      default: 'general',
    },
    metricsAnalyzed: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDismissed: {
      type: Boolean,
      default: false,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

alertSchema.index({ patient: 1, isDismissed: 1, generatedAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);

