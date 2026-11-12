const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'revoked', 'expired'],
      default: 'active',
      index: true,
    },
    permissions: {
      shareVitals: { type: Boolean, default: true },
      shareMedications: { type: Boolean, default: true },
      shareSymptoms: { type: Boolean, default: true },
      shareMedicalRecords: { type: Boolean, default: true },
      shareDoctorNotes: { type: Boolean, default: true },
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
    },
    notes: {
      type: String,
      default: 'Authorized access for preventive monitoring and medical guidance.',
    },
  },
  {
    timestamps: true,
  }
);

consentSchema.index({ patient: 1, doctor: 1 });

module.exports = mongoose.model('Consent', consentSchema);

