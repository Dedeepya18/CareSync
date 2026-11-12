const Alert = require('../models/Alert');
const HealthMetric = require('../models/HealthMetric');

/**
 * CareSync Health Trend Intelligence Engine
 * Explainable, rule-based algorithmic analysis of health metric patterns.
 * Identifies trends over time rather than just single-point threshold violations.
 */
class TrendIntelligenceService {
  /**
   * Analyze recent health metrics for a patient and detect notable trends
   * @param {string} patientId 
   * @param {number} daysWindow 
   */
  static async analyzePatientTrends(patientId, daysWindow = 14) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - daysWindow);

    // Fetch chronological metrics (oldest to newest for trend analysis)
    const metrics = await HealthMetric.find({
      patient: patientId,
      recordedAt: { $gte: sinceDate },
    }).sort({ recordedAt: 1 });

    if (!metrics || metrics.length < 3) {
      return {
        trendsDetected: 0,
        alertsGenerated: [],
        message: 'Insufficient historical readings for trend intelligence (minimum 3 records required).',
      };
    }

    const generatedAlerts = [];

    // 1. Analyze Blood Pressure Trend (Systolic & Diastolic)
    const bpAlert = await this.evaluateBloodPressureTrend(patientId, metrics);
    if (bpAlert) generatedAlerts.push(bpAlert);

    // 2. Analyze Resting Heart Rate Trend
    const hrAlert = await this.evaluateHeartRateTrend(patientId, metrics);
    if (hrAlert) generatedAlerts.push(hrAlert);

    // 3. Analyze Oxygen Saturation (SpO2) Trajectory
    const spo2Alert = await this.evaluateSpO2Trend(patientId, metrics);
    if (spo2Alert) generatedAlerts.push(spo2Alert);

    // 4. Analyze Blood Glucose Trend
    const glucoseAlert = await this.evaluateBloodGlucoseTrend(patientId, metrics);
    if (glucoseAlert) generatedAlerts.push(glucoseAlert);

    // 5. Analyze Sleep Deficit & Heart Rate Correlation
    const sleepAlert = await this.evaluateSleepPattern(patientId, metrics);
    if (sleepAlert) generatedAlerts.push(sleepAlert);

    return {
      trendsDetected: generatedAlerts.length,
      alertsGenerated: generatedAlerts,
      metricsCount: metrics.length,
    };
  }

  /**
   * Evaluate Blood Pressure trend
   * Compares earlier baseline average vs recent readings
   */
  static async evaluateBloodPressureTrend(patientId, metrics) {
    const bpRecords = metrics.filter(m => m.systolicBP && m.diastolicBP);
    if (bpRecords.length < 4) return null;

    const mid = Math.floor(bpRecords.length / 2);
    const baseline = bpRecords.slice(0, mid);
    const recent = bpRecords.slice(mid);

    const avgBaselineSystolic = baseline.reduce((acc, m) => acc + m.systolicBP, 0) / baseline.length;
    const avgRecentSystolic = recent.reduce((acc, m) => acc + m.systolicBP, 0) / recent.length;

    const avgBaselineDiastolic = baseline.reduce((acc, m) => acc + m.diastolicBP, 0) / baseline.length;
    const avgRecentDiastolic = recent.reduce((acc, m) => acc + m.diastolicBP, 0) / recent.length;

    const systolicDeltaPercent = ((avgRecentSystolic - avgBaselineSystolic) / avgBaselineSystolic) * 100;

    // Upward trend condition: > 8% increase in systolic average
    if (systolicDeltaPercent >= 8 && avgRecentSystolic > 125) {
      return await this.createAlertIfNotRecent(patientId, {
        type: 'trend_warning',
        severity: avgRecentSystolic >= 140 ? 'critical' : 'warning',
        metric: 'systolicBP',
        title: 'Unusual Blood Pressure Upward Trend',
        message: 'Your recent blood pressure readings show a steady upward pattern compared to your earlier baseline.',
        reason: `Your average systolic reading increased by approximately ${systolicDeltaPercent.toFixed(1)}% (from ${avgBaselineSystolic.toFixed(0)} mmHg to ${avgRecentSystolic.toFixed(0)} mmHg) across recent readings. Diastolic average is ${avgRecentDiastolic.toFixed(0)} mmHg.`,
        metricsAnalyzed: {
          baselineSystolic: Math.round(avgBaselineSystolic),
          recentSystolic: Math.round(avgRecentSystolic),
          deltaPercent: Math.round(systolicDeltaPercent),
        },
      });
    }

    return null;
  }

  /**
   * Evaluate Heart Rate trend
   */
  static async evaluateHeartRateTrend(patientId, metrics) {
    const hrRecords = metrics.filter(m => m.heartRate);
    if (hrRecords.length < 4) return null;

    const mid = Math.floor(hrRecords.length / 2);
    const baseline = hrRecords.slice(0, mid);
    const recent = hrRecords.slice(mid);

    const avgBaselineHR = baseline.reduce((acc, m) => acc + m.heartRate, 0) / baseline.length;
    const avgRecentHR = recent.reduce((acc, m) => acc + m.heartRate, 0) / recent.length;
    const hrDeltaPercent = ((avgRecentHR - avgBaselineHR) / avgBaselineHR) * 100;

    if (hrDeltaPercent >= 12 && avgRecentHR > 82) {
      return await this.createAlertIfNotRecent(patientId, {
        type: 'trend_warning',
        severity: avgRecentHR >= 100 ? 'critical' : 'warning',
        metric: 'heartRate',
        title: 'Gradual Heart-Rate Increase Detected',
        message: 'Your recent resting heart-rate readings show an upward trend over recent days.',
        reason: `Your average resting heart rate has increased by approximately ${hrDeltaPercent.toFixed(1)}% (from ${avgBaselineHR.toFixed(0)} bpm to ${avgRecentHR.toFixed(0)} bpm). Consider monitoring your readings and consulting a healthcare professional if this persists.`,
        metricsAnalyzed: {
          baselineHR: Math.round(avgBaselineHR),
          recentHR: Math.round(avgRecentHR),
          deltaPercent: Math.round(hrDeltaPercent),
        },
      });
    }

    return null;
  }

  /**
   * Evaluate SpO2 Oxygen Saturation trend
   */
  static async evaluateSpO2Trend(patientId, metrics) {
    const spo2Records = metrics.filter(m => m.spO2);
    if (spo2Records.length < 3) return null;

    const recentRecords = spo2Records.slice(-3);
    const avgRecentSpO2 = recentRecords.reduce((acc, m) => acc + m.spO2, 0) / recentRecords.length;

    if (avgRecentSpO2 < 95) {
      return await this.createAlertIfNotRecent(patientId, {
        type: 'trend_warning',
        severity: avgRecentSpO2 < 92 ? 'critical' : 'warning',
        metric: 'spO2',
        title: 'Mild SpO2 Saturation Decline',
        message: 'Your recent blood oxygen saturation readings have dipped below optimal range (>= 95%).',
        reason: `Your last ${recentRecords.length} readings averaged ${avgRecentSpO2.toFixed(1)}% SpO2. Normal healthy resting levels typically range between 95% and 100%.`,
        metricsAnalyzed: {
          recentAverageSpO2: Number(avgRecentSpO2.toFixed(1)),
        },
      });
    }

    return null;
  }

  /**
   * Evaluate Blood Glucose trend
   */
  static async evaluateBloodGlucoseTrend(patientId, metrics) {
    const glucoseRecords = metrics.filter(m => m.bloodGlucose);
    if (glucoseRecords.length < 3) return null;

    const recentGlucose = glucoseRecords.slice(-3);
    const avgRecent = recentGlucose.reduce((acc, m) => acc + m.bloodGlucose, 0) / recentGlucose.length;

    if (avgRecent > 140) {
      return await this.createAlertIfNotRecent(patientId, {
        type: 'trend_warning',
        severity: avgRecent > 180 ? 'critical' : 'warning',
        metric: 'bloodGlucose',
        title: 'Elevated Blood Glucose Readings',
        message: 'Your recent blood glucose measurements show persistent elevated levels.',
        reason: `Your recent readings averaged ${avgRecent.toFixed(0)} mg/dL, which is above standard desirable fasting/pre-meal targets (< 100-130 mg/dL).`,
        metricsAnalyzed: {
          recentAvgGlucose: Math.round(avgRecent),
        },
      });
    }

    return null;
  }

  /**
   * Evaluate Sleep Pattern & Vital Correlation
   */
  static async evaluateSleepPattern(patientId, metrics) {
    const sleepRecords = metrics.filter(m => m.sleepHours !== null && m.sleepHours !== undefined);
    if (sleepRecords.length < 4) return null;

    const recentSleep = sleepRecords.slice(-4);
    const avgSleep = recentSleep.reduce((acc, m) => acc + m.sleepHours, 0) / recentSleep.length;

    if (avgSleep < 5.5) {
      return await this.createAlertIfNotRecent(patientId, {
        type: 'preventive_checkup',
        severity: 'info',
        metric: 'sleepHours',
        title: 'Persistent Sleep Deficit Pattern',
        message: 'Your recorded sleep duration has been consistently low over the past several days.',
        reason: `Your average sleep duration over the last ${recentSleep.length} logs was ${avgSleep.toFixed(1)} hours/night. Chronic sleep deficit can impact blood pressure regulation, immune function, and cardiovascular wellness.`,
        metricsAnalyzed: {
          avgSleepDuration: Number(avgSleep.toFixed(1)),
        },
      });
    }

    return null;
  }

  /**
   * Avoid spamming duplicate alerts if generated in last 24 hours
   */
  static async createAlertIfNotRecent(patientId, alertData) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const existingAlert = await Alert.findOne({
      patient: patientId,
      metric: alertData.metric,
      type: alertData.type,
      generatedAt: { $gte: oneDayAgo },
    });

    if (existingAlert) {
      return existingAlert;
    }

    return await Alert.create({
      patient: patientId,
      ...alertData,
      generatedAt: new Date(),
    });
  }
}

module.exports = TrendIntelligenceService;

