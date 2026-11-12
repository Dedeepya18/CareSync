const Symptom = require('../models/Symptom');
const Alert = require('../models/Alert');

// @desc    Record a new symptom
// @route   POST /api/symptoms
// @access  Private (Patient)
exports.addSymptom = async (req, res, next) => {
  try {
    const { symptomName, severity, duration, onsetDate, bodyLocation, notes, triggers } = req.body;

    if (!symptomName || !severity || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Symptom name, severity (1-10), and duration are required.',
      });
    }

    const patientId = req.user.id;

    const symptom = await Symptom.create({
      patient: patientId,
      symptomName: symptomName.trim(),
      severity: Number(severity),
      duration: duration.trim(),
      onsetDate: onsetDate ? new Date(onsetDate) : new Date(),
      bodyLocation: bodyLocation || 'General',
      notes: notes || '',
      triggers: Array.isArray(triggers) ? triggers : [],
    });

    // Check if severe (>= 8)
    if (symptom.severity >= 8) {
      await Alert.create({
        patient: patientId,
        type: 'threshold_breach',
        severity: 'critical',
        title: `High Severity Symptom: ${symptom.symptomName}`,
        message: `You reported a severity of ${symptom.severity}/10 for ${symptom.symptomName}.`,
        reason: 'Symptoms rated 8 or higher signify significant discomfort or functional limitation. Please seek prompt clinical care or emergency consultation if breathing, chest pain, or consciousness is impacted.',
        metric: 'symptom',
        metricsAnalyzed: { symptomName: symptom.symptomName, severity: symptom.severity },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Symptom logged successfully.',
      symptom,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get symptoms history and recurring patterns
// @route   GET /api/symptoms
// @access  Private (Patient, Doctor with consent)
exports.getSymptoms = async (req, res, next) => {
  try {
    const patientId = req.query.patientId || req.user.id;
    const symptoms = await Symptom.find({ patient: patientId }).sort({ onsetDate: -1 });

    // Pattern recognition (Count recurring symptoms)
    const frequencyMap = {};
    symptoms.forEach(s => {
      const key = s.symptomName.toLowerCase().trim();
      frequencyMap[key] = (frequencyMap[key] || 0) + 1;
    });

    const recurringPatterns = Object.entries(frequencyMap)
      .filter(([_, count]) => count >= 2)
      .map(([name, count]) => ({
        symptomName: name,
        occurrences: count,
        note: `Logged ${count} times recently. (Non-diagnostic pattern observation)`,
      }));

    res.status(200).json({
      success: true,
      count: symptoms.length,
      symptoms,
      recurringPatterns,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update symptom status or severity
// @route   PUT /api/symptoms/:id
// @access  Private
exports.updateSymptom = async (req, res, next) => {
  try {
    const { status, severity, notes } = req.body;
    const symptom = await Symptom.findOne({ _id: req.params.id, patient: req.user.id });

    if (!symptom) {
      return res.status(404).json({
        success: false,
        message: 'Symptom record not found.',
      });
    }

    if (status) symptom.status = status;
    if (severity) symptom.severity = Number(severity);
    if (notes !== undefined) symptom.notes = notes;

    await symptom.save();

    res.status(200).json({
      success: true,
      message: 'Symptom updated successfully.',
      symptom,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete symptom
// @route   DELETE /api/symptoms/:id
// @access  Private
exports.deleteSymptom = async (req, res, next) => {
  try {
    const symptom = await Symptom.findOne({ _id: req.params.id, patient: req.user.id });

    if (!symptom) {
      return res.status(404).json({
        success: false,
        message: 'Symptom record not found.',
      });
    }

    await symptom.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Symptom entry deleted.',
    });
  } catch (error) {
    next(error);
  }
};

