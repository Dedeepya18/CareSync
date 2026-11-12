const AISummaryService = require('../services/aiSummaryService');

// @desc    Generate AI Health Summary Assistant report
// @route   GET /api/ai/health-summary
// @access  Private (Patient, Doctor with consent)
exports.getHealthSummary = async (req, res, next) => {
  try {
    const patientId = req.query.patientId || req.user.id;
    const summary = await AISummaryService.generateSummary(patientId);

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

