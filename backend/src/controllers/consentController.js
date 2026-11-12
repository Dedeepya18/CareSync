const Consent = require('../models/Consent');
const User = require('../models/User');

// @desc    Grant consent to a doctor
// @route   POST /api/consent
// @access  Private (Patient)
exports.createConsent = async (req, res, next) => {
  try {
    const { doctorId, permissions, notes, durationMonths = 12 } = req.body;

    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID is required.',
      });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    // Check if consent already exists
    let consent = await Consent.findOne({
      patient: req.user.id,
      doctor: doctorId,
    });

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + Number(durationMonths));

    const defaultPerms = {
      shareVitals: true,
      shareMedications: true,
      shareSymptoms: true,
      shareMedicalRecords: true,
      shareDoctorNotes: true,
    };

    if (consent) {
      consent.status = 'active';
      consent.permissions = { ...defaultPerms, ...(permissions || {}) };
      consent.grantedAt = new Date();
      consent.revokedAt = null;
      consent.expiresAt = expiresAt;
      if (notes) consent.notes = notes;
      await consent.save();
    } else {
      consent = await Consent.create({
        patient: req.user.id,
        doctor: doctorId,
        status: 'active',
        permissions: { ...defaultPerms, ...(permissions || {}) },
        grantedAt: new Date(),
        expiresAt,
        notes: notes || 'Authorized data access for clinical monitoring.',
      });
    }

    res.status(201).json({
      success: true,
      message: `Access consent granted to Dr. ${doctor.name}.`,
      consent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient consents history
// @route   GET /api/consent
// @access  Private (Patient)
exports.getConsents = async (req, res, next) => {
  try {
    const consents = await Consent.find({ patient: req.user.id })
      .populate('doctor', 'name email phone avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: consents.length,
      consents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Revoke consent
// @route   PUT /api/consent/:id/revoke
// @access  Private (Patient)
exports.revokeConsent = async (req, res, next) => {
  try {
    const consent = await Consent.findOne({ _id: req.params.id, patient: req.user.id });

    if (!consent) {
      return res.status(404).json({
        success: false,
        message: 'Consent record not found.',
      });
    }

    consent.status = 'revoked';
    consent.revokedAt = new Date();
    await consent.save();

    res.status(200).json({
      success: true,
      message: 'Access consent revoked successfully. Doctor can no longer access this data.',
      consent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update consent permissions
// @route   PUT /api/consent/:id/permissions
// @access  Private (Patient)
exports.updatePermissions = async (req, res, next) => {
  try {
    const { permissions } = req.body;
    const consent = await Consent.findOne({ _id: req.params.id, patient: req.user.id });

    if (!consent) {
      return res.status(404).json({
        success: false,
        message: 'Consent record not found.',
      });
    }

    consent.permissions = { ...consent.permissions.toObject(), ...permissions };
    await consent.save();

    res.status(200).json({
      success: true,
      message: 'Data sharing permissions updated.',
      consent,
    });
  } catch (error) {
    next(error);
  }
};

