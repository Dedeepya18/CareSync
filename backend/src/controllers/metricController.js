const HealthMetric = require('../models/HealthMetric');
const Alert = require('../models/Alert');
const EmergencyDetectionService = require('../services/emergencyDetectionService');
const TrendIntelligenceService = require('../services/trendIntelligenceService');

// @desc    Record new health metrics
// @route   POST /api/health-metrics
// @access  Private (Patient, Doctor)
exports.addMetric = async (req, res, next) => {
  try {
    const {
      systolicBP,
      diastolicBP,
      heartRate,
      spO2,
      bloodGlucose,
      bloodGlucoseType,
      temperature,
      weight,
      sleepHours,
      sleepQuality,
      notes,
      source,
      recordedAt,
    } = req.body;

    const patientId = req.body.patientId || req.user.id;

    const metric = await HealthMetric.create({
      patient: patientId,
      systolicBP: systolicBP ? Number(systolicBP) : null,
      diastolicBP: diastolicBP ? Number(diastolicBP) : null,
      heartRate: heartRate ? Number(heartRate) : null,
      spO2: spO2 ? Number(spO2) : null,
      bloodGlucose: bloodGlucose ? Number(bloodGlucose) : null,
      bloodGlucoseType: bloodGlucoseType || '',
      temperature: temperature ? Number(temperature) : null,
      weight: weight ? Number(weight) : null,
      sleepHours: sleepHours !== undefined && sleepHours !== '' ? Number(sleepHours) : null,
      sleepQuality: sleepQuality || '',
      notes: notes || '',
      source: source || 'manual',
      recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
    });

    // 1. Check for immediate critical emergency thresholds
    const emergencyEval = EmergencyDetectionService.evaluateVitals(metric);
    if (emergencyEval.isEmergency) {
      await Alert.create({
        patient: patientId,
        type: 'emergency_advisory',
        severity: 'critical',
        title: 'Critical Vital Threshold Alert',
        message: emergencyEval.flags.map(f => `${f.parameter}: ${f.warning}`).join(' | '),
        reason: emergencyEval.flags.map(f => f.advisory).join(' '),
        metric: emergencyEval.flags[0].parameter,
        metricsAnalyzed: { flags: emergencyEval.flags },
      });
    }

    // 2. Trigger intelligent trend analysis asynchronously
    TrendIntelligenceService.analyzePatientTrends(patientId).catch(err => {
      console.warn('Async trend intelligence notice:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Health metric recorded successfully.',
      metric,
      emergencyNotice: emergencyEval.isEmergency ? emergencyEval : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get health metrics with range filters
// @route   GET /api/health-metrics
// @access  Private (Patient, Doctor with consent)
exports.getMetrics = async (req, res, next) => {
  try {
    const patientId = req.query.patientId || req.user.id;
    const { range, limit = 100 } = req.query;

    const query = { patient: patientId };

    if (range) {
      const days = parseInt(range, 10);
      if (!isNaN(days) && days > 0) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query.recordedAt = { $gte: startDate };
      }
    }

    const metrics = await HealthMetric.find(query)
      .sort({ recordedAt: 1 }) // Chronological order for charts
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: metrics.length,
      metrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated metrics summary
// @route   GET /api/health-metrics/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    const patientId = req.query.patientId || req.user.id;
    const metrics = await HealthMetric.find({ patient: patientId }).sort({ recordedAt: -1 }).limit(30);

    if (metrics.length === 0) {
      return res.status(200).json({
        success: true,
        summary: null,
      });
    }

    const latest = metrics[0];
    const avg = (field) => {
      const valid = metrics.filter(m => m[field] !== null && m[field] !== undefined);
      if (!valid.length) return null;
      return Number((valid.reduce((acc, m) => acc + m[field], 0) / valid.length).toFixed(1));
    };

    res.status(200).json({
      success: true,
      summary: {
        latest,
        averages: {
          systolicBP: avg('systolicBP'),
          diastolicBP: avg('diastolicBP'),
          heartRate: avg('heartRate'),
          spO2: avg('spO2'),
          bloodGlucose: avg('bloodGlucose'),
          sleepHours: avg('sleepHours'),
          weight: avg('weight'),
        },
        readingsCount: metrics.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete health metric entry
// @route   DELETE /api/health-metrics/:id
// @access  Private
exports.deleteMetric = async (req, res, next) => {
  try {
    const metric = await HealthMetric.findOne({
      _id: req.params.id,
      patient: req.user.id,
    });

    if (!metric) {
      return res.status(404).json({
        success: false,
        message: 'Metric record not found or unauthorized.',
      });
    }

    await metric.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Metric entry deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

