const PatientProfile = require('../models/PatientProfile');
const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const HealthMetric = require('../models/HealthMetric');
const Symptom = require('../models/Symptom');
const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const Alert = require('../models/Alert');
const MedicalRecord = require('../models/MedicalRecord');
const WellnessScoreService = require('../services/wellnessScoreService');
const TrendIntelligenceService = require('../services/trendIntelligenceService');

// @desc    Get patient health profile
// @route   GET /api/patients/profile
// @access  Private (Patient, Doctor with consent, Admin)
exports.getProfile = async (req, res, next) => {
  try {
    const targetUserId = req.query.patientId || req.user.id;
    let profile = await PatientProfile.findOne({ user: targetUserId }).populate('user', 'name email phone avatar');

    if (!profile) {
      profile = await PatientProfile.create({ user: targetUserId });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient health profile
// @route   PUT /api/patients/profile
// @access  Private (Patient only)
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      dateOfBirth,
      gender,
      bloodGroup,
      heightCm,
      weightKg,
      emergencyContact,
      allergies,
      chronicConditions,
      pastSurgeries,
      lifestyleHabits,
    } = req.body;

    let profile = await PatientProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = new PatientProfile({ user: req.user.id });
    }

    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;
    if (gender !== undefined) profile.gender = gender;
    if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
    if (heightCm !== undefined) profile.heightCm = heightCm;
    if (weightKg !== undefined) profile.weightKg = weightKg;
    if (emergencyContact !== undefined) profile.emergencyContact = emergencyContact;
    if (allergies !== undefined) profile.allergies = allergies;
    if (chronicConditions !== undefined) profile.chronicConditions = chronicConditions;
    if (pastSurgeries !== undefined) profile.pastSurgeries = pastSurgeries;
    if (lifestyleHabits !== undefined) profile.lifestyleHabits = lifestyleHabits;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Health profile updated successfully.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get consolidated patient dashboard
// @route   GET /api/patients/dashboard
// @access  Private (Patient)
exports.getDashboard = async (req, res, next) => {
  try {
    const patientId = req.user.id;

    // Trigger trend analysis in background to keep alerts fresh
    TrendIntelligenceService.analyzePatientTrends(patientId).catch(err => {
      console.warn('Dashboard trend analysis background notice:', err.message);
    });

    const [
      wellnessScore,
      latestMetrics,
      activeAlerts,
      medications,
      recentSymptoms,
      recentRecords,
    ] = await Promise.all([
      WellnessScoreService.calculateScore(patientId),
      HealthMetric.find({ patient: patientId }).sort({ recordedAt: -1 }).limit(7),
      Alert.find({ patient: patientId, isDismissed: false }).sort({ generatedAt: -1 }).limit(5),
      Medication.find({ patient: patientId, isActive: true }),
      Symptom.find({ patient: patientId }).sort({ onsetDate: -1 }).limit(5),
      MedicalRecord.find({ patient: patientId }).sort({ uploadDate: -1 }).limit(4),
    ]);

    // Check today's medication logs
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = await MedicationLog.find({
      patient: patientId,
      scheduledDate: todayStr,
    });

    const medicationSchedule = medications.map(med => {
      const log = todayLogs.find(l => l.medication.toString() === med._id.toString());
      return {
        id: med._id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        reminderTimes: med.reminderTimes,
        statusToday: log ? log.status : 'pending',
        logId: log ? log._id : null,
      };
    });

    res.status(200).json({
      success: true,
      dashboard: {
        wellnessScore,
        latestVitals: latestMetrics[0] || null,
        recentVitalsHistory: latestMetrics,
        activeAlerts,
        medicationSchedule,
        recentSymptoms,
        recentRecords,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of verified doctors available for data sharing
// @route   GET /api/patients/doctors
// @access  Private (Patient)
exports.getDoctorsList = async (req, res, next) => {
  try {
    const doctors = await DoctorProfile.find({ isVerified: true })
      .populate('user', 'name email phone avatar')
      .lean();

    const formatted = doctors.map(doc => ({
      doctorId: doc.user._id,
      name: doc.user.name,
      email: doc.user.email,
      avatar: doc.user.avatar,
      specialization: doc.specialization,
      hospitalAffiliation: doc.hospitalAffiliation,
      experienceYears: doc.experienceYears,
      qualifications: doc.qualifications,
      bio: doc.bio,
    }));

    res.status(200).json({
      success: true,
      doctors: formatted,
    });
  } catch (error) {
    next(error);
  }
};

