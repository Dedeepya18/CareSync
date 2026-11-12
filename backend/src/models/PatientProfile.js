const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say', ''],
      default: '',
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown', ''],
      default: 'Unknown',
    },
    heightCm: {
      type: Number,
      min: 30,
      max: 300,
      default: null,
    },
    weightKg: {
      type: Number,
      min: 2,
      max: 400,
      default: null,
    },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    allergies: {
      type: [String],
      default: [],
    },
    chronicConditions: {
      type: [String],
      default: [],
    },
    pastSurgeries: {
      type: [String],
      default: [],
    },
    lifestyleHabits: {
      smoking: {
        type: String,
        enum: ['never', 'former', 'occasional', 'regular', 'not_specified'],
        default: 'not_specified',
      },
      alcohol: {
        type: String,
        enum: ['never', 'socially', 'moderate', 'heavy', 'not_specified'],
        default: 'not_specified',
      },
      exerciseFrequency: {
        type: String,
        enum: ['sedentary', '1-2 days/week', '3-4 days/week', '5+ days/week', 'not_specified'],
        default: 'not_specified',
      },
      dietType: {
        type: String,
        enum: ['balanced', 'vegetarian', 'vegan', 'keto', 'low_sodium', 'other', 'not_specified'],
        default: 'not_specified',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PatientProfile', patientProfileSchema);

