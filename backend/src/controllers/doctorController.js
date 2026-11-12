const DoctorProfile = require('../models/DoctorProfile');
const Consent = require('../models/Consent');
const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const HealthMetric = require('../models/HealthMetric');
const Symptom = require('../models/Symptom');
const Medication = require('../models/Medication');
const MedicalRecord = require('../models/MedicalRecord');
const Alert = require('../models/Alert');
const DoctorNote = require('../models/DoctorNote');

// @desc    Get doctor dashboard overview
// @route   GET /api/doctor/dashboard
// @access  Private (Doctor)
exports.getDashboard = async (req, res, next) => {
  try {
    const doctorId = req.user.id;

    // Active consents
    const activeConsents = await Consent.find({
      doctor: doctorId,
      status: 'active',
    }).populate('patient', 'name email phone avatar');

    const patientIds = activeConsents.map(c => c.patient._id);

    // Recent alerts across consented patients
    const abnormalAlerts = await Alert.find({
      patient: { $in: patientIds },
      isDismissed: false,
    })
      .populate('patient', 'name email avatar')
      .sort({ generatedAt: -1 })
      .limit(10);

    // Recent notes written by doctor
    const recentNotes = await DoctorNote.find({ doctor: doctorId })
      .populate('patient', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        activePatientCount: activeConsents.length,
        abnormalTrendsCount: abnormalAlerts.length,
        totalNotesGiven: await DoctorNote.countDocuments({ doctor: doctorId }),
      },
      activePatients: activeConsents,
      abnormalAlerts,
      recentNotes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of consented patients
// @route   GET /api/doctor/patients
// @access  Private (Doctor)
exports.getConsentedPatients = async (req, res, next) => {
  try {
    const doctorId = req.user.id;

    const consents = await Consent.find({
      doctor: doctorId,
      status: 'active',
    }).populate('patient', 'name email phone avatar lastLogin');

    const patientCards = await Promise.all(
      consents.map(async (c) => {
        const patientId = c.patient._id;
        const [latestMetric, activeAlertsCount, activeMedsCount] = await Promise.all([
          HealthMetric.findOne({ patient: patientId }).sort({ recordedAt: -1 }),
          Alert.countDocuments({ patient: patientId, isDismissed: false }),
          Medication.countDocuments({ patient: patientId, isActive: true }),
        ]);

        return {
          consentId: c._id,
          permissions: c.permissions,
          grantedAt: c.grantedAt,
          patient: c.patient,
          latestMetric,
          activeAlertsCount,
          activeMedsCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: patientCards.length,
      patients: patientCards,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed patient data with consent checking
// @route   GET /api/doctor/patients/:patientId
// @access  Private (Doctor)
exports.getPatientDetails = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user.id;

    // Verify active consent
    const consent = await Consent.findOne({
      doctor: doctorId,
      patient: patientId,
      status: 'active',
    });

    if (!consent) {
      return res.status(403).json({
        success: false,
        message: 'No active consent found for this patient. Access denied.',
      });
    }

    const [patientUser, patientProfile] = await Promise.all([
      User.findById(patientId).select('-password'),
      PatientProfile.findOne({ user: patientId }),
    ]);

    const result = {
      patient: patientUser,
      profile: patientProfile,
      permissions: consent.permissions,
    };

    if (consent.permissions.shareVitals) {
      result.metrics = await HealthMetric.find({ patient: patientId }).sort({ recordedAt: -1 }).limit(60);
      result.alerts = await Alert.find({ patient: patientId }).sort({ generatedAt: -1 }).limit(10);
    }

    if (consent.permissions.shareMedications) {
      result.medications = await Medication.find({ patient: patientId }).sort({ isActive: -1 });
    }

    if (consent.permissions.shareSymptoms) {
      result.symptoms = await Symptom.find({ patient: patientId }).sort({ onsetDate: -1 });
    }

    if (consent.permissions.shareMedicalRecords) {
      result.records = await MedicalRecord.find({ patient: patientId }).sort({ uploadDate: -1 });
    }

    result.notes = await DoctorNote.find({ patient: patientId, doctor: doctorId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add clinical observation note
// @route   POST /api/doctor/notes
// @access  Private (Doctor)
exports.addDoctorNote = async (req, res, next) => {
  try {
    const { patientId, title, observation, generalGuidance, recommendedTests, followUpDate } = req.body;

    if (!patientId || !title || !observation || !generalGuidance) {
      return res.status(400).json({
        success: false,
        message: 'Patient ID, title, observation, and guidance are required.',
      });
    }

    const note = await DoctorNote.create({
      doctor: req.user.id,
      patient: patientId,
      title: title.trim(),
      observation: observation.trim(),
      generalGuidance: generalGuidance.trim(),
      recommendedTests: Array.isArray(recommendedTests) ? recommendedTests : [],
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      isSharedWithPatient: true,
    });

    res.status(201).json({
      success: true,
      message: 'Clinical observation note recorded.',
      note,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor profile
// @route   GET /api/doctor/profile
// @access  Private (Doctor)
exports.getProfile = async (req, res, next) => {
  try {
    let profile = await DoctorProfile.findOne({ user: req.user.id }).populate('user', 'name email phone avatar');
    if (!profile) {
      profile = await DoctorProfile.create({
        user: req.user.id,
        specialization: 'General Medicine',
        licenseNumber: `MED-${Math.floor(100000 + Math.random() * 900000)}`,
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctor/profile
// @access  Private (Doctor)
exports.updateProfile = async (req, res, next) => {
  try {
    const { specialization, hospitalAffiliation, experienceYears, qualifications, bio } = req.body;
    let profile = await DoctorProfile.findOne({ user: req.user.id });

    if (specialization) profile.specialization = specialization;
    if (hospitalAffiliation) profile.hospitalAffiliation = hospitalAffiliation;
    if (experienceYears !== undefined) profile.experienceYears = Number(experienceYears);
    if (qualifications) profile.qualifications = Array.isArray(qualifications) ? qualifications : [qualifications];
    if (bio !== undefined) profile.bio = bio;

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully.',
      profile,
    });
  } catch (error) {
    next(error);
  }
};

