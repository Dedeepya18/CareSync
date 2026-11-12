/**
 * CareSync Emergency Detection & Triage Advisory Service
 * Evaluates immediate physiological threshold alerts.
 * Strictly non-diagnostic; directs user to urgent medical care.
 */
class EmergencyDetectionService {
  /**
   * Evaluate vital metrics for critical emergency signs
   * @param {Object} metric 
   */
  static evaluateVitals(metric) {
    const flags = [];

    // Systolic / Diastolic Hypertensive Emergency
    if (metric.systolicBP >= 180 || metric.diastolicBP >= 120) {
      flags.push({
        parameter: 'Blood Pressure',
        value: `${metric.systolicBP}/${metric.diastolicBP} mmHg`,
        warning: 'Critically high blood pressure reading detected (Hypertensive Crisis range).',
        advisory: 'If accompanied by chest pain, shortness of breath, blurry vision, or numbness, seek emergency medical care immediately.',
      });
    }

    // Critical Hypoxemia
    if (metric.spO2 && metric.spO2 <= 88) {
      flags.push({
        parameter: 'Blood Oxygen (SpO2)',
        value: `${metric.spO2}%`,
        warning: 'Severe oxygen saturation drop detected (<89%).',
        advisory: 'Critically low oxygen levels require urgent clinical evaluation or emergency room attention.',
      });
    }

    // Dangerous Heart Rates
    if (metric.heartRate && (metric.heartRate >= 160 || metric.heartRate <= 40)) {
      flags.push({
        parameter: 'Heart Rate',
        value: `${metric.heartRate} bpm`,
        warning: 'Extreme heart rate detected outside normal physiological bounds.',
        advisory: 'If you feel dizzy, faint, lightheaded, or short of breath, contact emergency medical services right away.',
      });
    }

    // Extreme Blood Glucose
    if (metric.bloodGlucose && (metric.bloodGlucose < 50 || metric.bloodGlucose > 400)) {
      flags.push({
        parameter: 'Blood Glucose',
        value: `${metric.bloodGlucose} mg/dL`,
        warning: metric.bloodGlucose < 50 ? 'Severe hypoglycemia detected.' : 'Extreme hyperglycemia detected.',
        advisory: 'Immediate corrective action or emergency clinical intervention is strongly advised.',
      });
    }

    // Severe Hyperthermia
    if (metric.temperature && metric.temperature >= 40.0) {
      flags.push({
        parameter: 'Body Temperature',
        value: `${metric.temperature}°C`,
        warning: 'High-grade fever detected (>= 40°C / 104°F).',
        advisory: 'Seek prompt medical evaluation, especially if accompanied by confusion, stiff neck, or seizures.',
      });
    }

    const isEmergency = flags.length > 0;

    return {
      isEmergency,
      severity: isEmergency ? 'critical' : 'normal',
      flags,
      emergencyContacts: [
        { label: 'Emergency Ambulance', number: '911 (US) / 112 (EU/Global) / 102/108 (India)' },
        { label: 'Poison Control / Crisis Helpline', number: '1-800-222-1222' },
      ],
      disclaimer: 'CareSync is an informational health monitoring platform, not an emergency dispatch or hospital service. In life-threatening emergencies, dial your local emergency services directly.',
    };
  }
}

module.exports = EmergencyDetectionService;

