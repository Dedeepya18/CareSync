const Alert = require('../models/Alert');
const TrendIntelligenceService = require('../services/trendIntelligenceService');

// @desc    Get patient alerts with explainable reasons
// @route   GET /api/alerts
// @access  Private (Patient, Doctor with consent)
exports.getAlerts = async (req, res, next) => {
  try {
    const patientId = req.query.patientId || req.user.id;
    const { includeDismissed } = req.query;

    const query = { patient: patientId };
    if (includeDismissed !== 'true') {
      query.isDismissed = false;
    }

    const alerts = await Alert.find(query).sort({ generatedAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark alert as read
// @route   PUT /api/alerts/:id/read
// @access  Private (Patient)
exports.markAsRead = async (req, res, next) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, patient: req.user.id });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found.',
      });
    }

    alert.isRead = true;
    await alert.save();

    res.status(200).json({
      success: true,
      alert,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Dismiss alert
// @route   PUT /api/alerts/:id/dismiss
// @access  Private (Patient)
exports.dismissAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOne({ _id: req.params.id, patient: req.user.id });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found.',
      });
    }

    alert.isDismissed = true;
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Alert dismissed.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually run trend analysis
// @route   POST /api/alerts/run-analysis
// @access  Private (Patient, Doctor)
exports.runAnalysis = async (req, res, next) => {
  try {
    const patientId = req.body.patientId || req.user.id;
    const result = await TrendIntelligenceService.analyzePatientTrends(patientId);

    const alerts = await Alert.find({ patient: patientId, isDismissed: false }).sort({ generatedAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Trend intelligence analysis completed.',
      result,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

