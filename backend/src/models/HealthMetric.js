const mongoose = require('mongoose');

const healthMetricSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recordedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    systolicBP: {
      type: Number,
      min: [50, 'Systolic BP too low'],
      max: [280, 'Systolic BP too high'],
      default: null,
    },
    diastolicBP: {
      type: Number,
      min: [30, 'Diastolic BP too low'],
      max: [180, 'Diastolic BP too high'],
      default: null,
    },
    heartRate: {
      type: Number,
      min: [30, 'Heart rate too low'],
      max: [250, 'Heart rate too high'],
      default: null,
    },
    spO2: {
      type: Number,
      min: [50, 'SpO2 too low'],
      max: [100, 'SpO2 cannot exceed 100%'],
      default: null,
    },
    bloodGlucose: {
      type: Number,
      min: [20, 'Blood glucose too low'],
      max: [700, 'Blood glucose too high'],
      default: null,
    },
    bloodGlucoseType: {
      type: String,
      enum: ['fasting', 'post_prandial', 'random', 'bedtime', ''],
      default: '',
    },
    temperature: {
      type: Number,
      min: [30, 'Temperature too low'],
      max: [45, 'Temperature too high'],
      default: null,
    },
    weight: {
      type: Number,
      min: [10, 'Weight too low'],
      max: [350, 'Weight too high'],
      default: null,
    },
    sleepHours: {
      type: Number,
      min: [0, 'Sleep hours cannot be negative'],
      max: [24, 'Sleep hours cannot exceed 24'],
      default: null,
    },
    sleepQuality: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent', ''],
      default: '',
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    source: {
      type: String,
      enum: ['manual', 'smart_device', 'doctor_recorded'],
      default: 'manual',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying a patient's metrics by date range efficiently
healthMetricSchema.index({ patient: 1, recordedAt: -1 });

module.exports = mongoose.model('HealthMetric', healthMetricSchema);

