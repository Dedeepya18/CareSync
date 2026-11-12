const HealthMetric = require('../models/HealthMetric');
const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const Symptom = require('../models/Symptom');
const Alert = require('../models/Alert');
const PatientProfile = require('../models/PatientProfile');

/**
 * CareSync AI Health Summary Assistant
 * Synthesizes multi-stream health metrics, symptoms, and medications into
 * an actionable, doctor-ready health briefing with intelligent discussion prompts.
 */
class AISummaryService {
  /**
   * Generate comprehensive health summary for a patient
   * @param {string} patientId 
   */
  static async generateSummary(patientId) {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const [metrics, medications, logs, symptoms, alerts, profile] = await Promise.all([
      HealthMetric.find({ patient: patientId, recordedAt: { $gte: fourteenDaysAgo } }).sort({ recordedAt: -1 }),
      Medication.find({ patient: patientId, isActive: true }),
      MedicationLog.find({ patient: patientId, actionTime: { $gte: fourteenDaysAgo } }),
      Symptom.find({ patient: patientId, onsetDate: { $gte: fourteenDaysAgo } }).sort({ onsetDate: -1 }),
      Alert.find({ patient: patientId, generatedAt: { $gte: fourteenDaysAgo } }).sort({ generatedAt: -1 }),
      PatientProfile.findOne({ user: patientId }),
    ]);

    // Check if external Gemini API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      try {
        const externalSummary = await this.callGeminiAPI(geminiApiKey, {
          metrics,
          medications,
          logs,
          symptoms,
          alerts,
          profile,
        });
        if (externalSummary) return externalSummary;
      } catch (err) {
        console.warn('Gemini API call failed, using intelligent rule-based engine fallback:', err.message);
      }
    }

    // Default: High-fidelity clinical rule-based intelligence engine
    return this.generateRuleBasedSummary({
      metrics,
      medications,
      logs,
      symptoms,
      alerts,
      profile,
    });
  }

  /**
   * Rule-Based Natural Language Health Summary Generator
   */
  static generateRuleBasedSummary(data) {
    const { metrics, medications, logs, symptoms, alerts, profile } = data;

    // 1. Vitals overview
    const systolicVals = metrics.filter(m => m.systolicBP).map(m => m.systolicBP);
    const hrVals = metrics.filter(m => m.heartRate).map(m => m.heartRate);
    const spo2Vals = metrics.filter(m => m.spO2).map(m => m.spO2);
    const sleepVals = metrics.filter(m => m.sleepHours).map(m => m.sleepHours);

    const avgSystolic = systolicVals.length ? Math.round(systolicVals.reduce((a, b) => a + b, 0) / systolicVals.length) : null;
    const avgHR = hrVals.length ? Math.round(hrVals.reduce((a, b) => a + b, 0) / hrVals.length) : null;
    const avgSpO2 = spo2Vals.length ? (spo2Vals.reduce((a, b) => a + b, 0) / spo2Vals.length).toFixed(1) : null;
    const avgSleep = sleepVals.length ? (sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length).toFixed(1) : null;

    // 2. Medication adherence calculation
    let adherenceRate = 100;
    if (logs.length > 0) {
      const taken = logs.filter(l => l.status === 'taken').length;
      adherenceRate = Math.round((taken / logs.length) * 100);
    }

    // Construct executive overview
    let executiveOverview = `Over the past 14 days, ${metrics.length} health metric logs were recorded. `;
    if (avgSystolic) executiveOverview += `Average systolic blood pressure tracked at ${avgSystolic} mmHg. `;
    if (avgHR) executiveOverview += `Resting heart rate averaged ${avgHR} bpm. `;
    if (avgSpO2) executiveOverview += `Blood oxygen saturation remained around ${avgSpO2}%. `;
    if (avgSleep) executiveOverview += `Sleep duration averaged ${avgSleep} hours per night. `;

    // 3. Observed trends
    const observedTrends = [];
    if (alerts.length > 0) {
      alerts.forEach(a => {
        observedTrends.push(`${a.title}: ${a.reason}`);
      });
    } else {
      observedTrends.push('Vitals have remained largely stable within baseline limits over the evaluated period.');
    }

    // 4. Medication compliance narrative
    let medicationAnalysis = medications.length === 0
      ? 'No active long-term medications currently registered in profile.'
      : `Patient has ${medications.length} active medication(s). Overall adherence rate over the past 14 days is ${adherenceRate}%. ` +
        (adherenceRate >= 85
          ? 'Medication compliance is strong.'
          : 'Dosing consistency has gaps that should be reviewed to optimize therapeutic benefits.');

    // 5. Symptom narrative
    const symptomHighlights = symptoms.length === 0
      ? 'No significant or recurring symptoms reported in the past 14 days.'
      : `Reported ${symptoms.length} symptom episode(s): ` +
        symptoms.slice(0, 3).map(s => `${s.symptomName} (Severity: ${s.severity}/10, Status: ${s.status})`).join('; ') + '.';

    // 6. Actionable Doctor Discussion Questions
    const discussionQuestions = [
      avgSystolic && avgSystolic >= 130
        ? `“My average blood pressure has hovered around ${avgSystolic} mmHg recently. Would lifestyle modifications or a medication adjustment be advisable?”`
        : '“Are there preventive lifestyle adjustments I should prioritize based on my recent vitals?”',
      adherenceRate < 80
        ? `“I experienced occasional challenges sticking to my medication schedule (${adherenceRate}% adherence). What strategies or timing do you recommend?”`
        : '“Are my current prescription dosages continuing to provide optimal maintenance?”',
      symptoms.length > 0
        ? `“I logged occurrences of ${symptoms[0]?.symptomName}. Are there diagnostic tests or triggers we should investigate?”`
        : '“When would you recommend my next routine blood panel or preventive screening?”',
      avgSleep && avgSleep < 6
        ? `“My sleep has averaged only ${avgSleep} hours nightly. Could this be impacting my cardiovascular stability?”`
        : '“How frequently should I track my resting vitals at home moving forward?”',
    ];

    return {
      source: 'CareSync Intelligent Rule-Based Health Engine',
      generatedAt: new Date(),
      timeWindow: 'Past 14 Days',
      executiveOverview,
      observedTrends,
      medicationAnalysis,
      symptomHighlights,
      discussionQuestions,
      disclaimer: 'LEGAL & MEDICAL DISCLAIMER: CareSync AI Health Summary is an analytical tool engineered solely to assist patient record-keeping and facilitate informed doctor-patient discussions. It is NOT a medical diagnosis, does not prescribe therapy, and must never replace direct professional clinical evaluation.',
    };
  }

  /**
   * Optional Gemini API implementation
   */
  static async callGeminiAPI(apiKey, data) {
    // Basic fetch invocation if key is configured
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are CareSync Clinical Assistant. Analyze this anonymized preventive health data for doctor discussion:
              Metrics: ${JSON.stringify(data.metrics.slice(0, 10))}
              Meds: ${JSON.stringify(data.medications)}
              Symptoms: ${JSON.stringify(data.symptoms)}
              Alerts: ${JSON.stringify(data.alerts)}
              Provide JSON with: executiveOverview (string), observedTrends (array of strings), medicationAnalysis (string), symptomHighlights (string), discussionQuestions (array of 4 strings). Strictly no diagnosis.`
            }]
          }]
        })
      });
      const resData = await response.json();
      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          source: 'CareSync AI Assistant (Gemini LLM)',
          generatedAt: new Date(),
          timeWindow: 'Past 14 Days',
          executiveOverview: parsed.executiveOverview,
          observedTrends: parsed.observedTrends,
          medicationAnalysis: parsed.medicationAnalysis,
          symptomHighlights: parsed.symptomHighlights,
          discussionQuestions: parsed.discussionQuestions,
          disclaimer: 'LEGAL & MEDICAL DISCLAIMER: CareSync AI Health Summary is an analytical tool engineered solely to assist patient record-keeping and facilitate informed doctor-patient discussions. It is NOT a medical diagnosis, does not prescribe therapy, and must never replace direct professional clinical evaluation.',
        };
      }
    } catch (err) {
      return null;
    }
    return null;
  }
}

module.exports = AISummaryService;

