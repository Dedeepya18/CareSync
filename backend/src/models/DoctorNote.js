const mongoose = require('mongoose');

const doctorNoteSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    observation: {
      type: String,
      required: [true, 'Clinical observation is required'],
    },
    generalGuidance: {
      type: String,
      required: [true, 'Guidance/lifestyle recommendation is required'],
    },
    recommendedTests: {
      type: [String],
      default: [],
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    isSharedWithPatient: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

doctorNoteSchema.index({ patient: 1, createdAt: -1 });
doctorNoteSchema.index({ doctor: 1, createdAt: -1 });

module.exports = mongoose.model('DoctorNote', doctorNoteSchema);

