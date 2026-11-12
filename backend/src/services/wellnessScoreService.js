const HealthMetric = require('../models/HealthMetric');
const Medication = require('../models/Medication');
const MedicationLog = require('../models/MedicationLog');
const Symptom = require('../models/Symptom');

/**
 * CareSync Wellness Score Calculation Service
 * Non-diagnostic composite wellness rating based on holistic health parameters.
 */
class WellnessScoreService {
  /**
   * Calculate 30-day comprehensive wellness score for a patient
   * @param {string} patientId 
   */
  static async calculateScore(patientId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [metrics, medications, logs, symptoms] = await Promise.all([
      HealthMetric.find({ patient: patientId, recordedAt: { $gte: thirtyDaysAgo } }).sort({ recordedAt: -1 }),
      Medication.find({ patient: patientId, isActive: true }),
      MedicationLog.find({ patient: patientId, actionTime: { $gte: thirtyDaysAgo } }),
      Symptom.find({ patient: patientId, status: { $in: ['active', 'worsening'] } }),
    ]);

    // Breakdown components (Max total = 100)
    let sleepScore = 15; // default reasonable base
    let hrScore = 16;
    let bpScore = 16;
    let adherenceScore = 20; // full if no meds
    let symptomScore = 10;
    let vitalsScore = 10;

    const recommendations = [];

    // 1. Evaluate Sleep (Max 20 pts)
    const sleepRecords = metrics.filter(m => m.sleepHours !== null && m.sleepHours !== undefined);
    if (sleepRecords.length > 0) {
      const avgSleep = sleepRecords.reduce((acc, m) => acc + m.sleepHours, 0) / sleepRecords.length;
      if (avgSleep >= 7 && avgSleep <= 9) {
        sleepScore = 20;
      } else if (avgSleep >= 6 && avgSleep < 7) {
        sleepScore = 16;
        recommendations.push('Aim for 7–8 hours of restorative sleep to enhance cognitive and metabolic recovery.');
      } else if (avgSleep >= 5 && avgSleep < 6) {
        sleepScore = 12;
        recommendations.push('Your average sleep duration is below 6 hours. Consider establishing a consistent wind-down routine.');
      } else {
        sleepScore = 8;
        recommendations.push('Significant sleep deficit observed (<5 hrs). Prioritize rest and limit screen exposure before bedtime.');
      }
    }

    // 2. Evaluate Heart Rate (Max 20 pts)
    const hrRecords = metrics.filter(m => m.heartRate);
    if (hrRecords.length > 0) {
      const avgHR = hrRecords.reduce((acc, m) => acc + m.heartRate, 0) / hrRecords.length;
      if (avgHR >= 60 && avgHR <= 78) {
        hrScore = 20;
      } else if (avgHR > 78 && avgHR <= 88) {
        hrScore = 16;
        recommendations.push('Incorporate light daily aerobic movement (e.g., 25-minute brisk walk) to optimize resting heart rate.');
      } else if (avgHR > 88 && avgHR <= 100) {
        hrScore = 12;
        recommendations.push('Resting heart rate is moderately elevated. Stay well-hydrated and practice stress-reduction techniques.');
      } else {
        hrScore = 8;
        recommendations.push('Resting heart rate is outside optimal range. Monitor throughout the day and discuss with a clinician.');
      }
    }

    // 3. Evaluate Blood Pressure (Max 20 pts)
    const bpRecords = metrics.filter(m => m.systolicBP && m.diastolicBP);
    if (bpRecords.length > 0) {
      const avgSystolic = bpRecords.reduce((acc, m) => acc + m.systolicBP, 0) / bpRecords.length;
      const avgDiastolic = bpRecords.reduce((acc, m) => acc + m.diastolicBP, 0) / bpRecords.length;

      if (avgSystolic < 120 && avgDiastolic < 80) {
        bpScore = 20;
      } else if (avgSystolic <= 129 && avgDiastolic < 80) {
        bpScore = 17;
        recommendations.push('Blood pressure is in the elevated range. Consider reducing dietary sodium and monitoring weekly.');
      } else if (avgSystolic <= 139 || (avgDiastolic >= 80 && avgDiastolic <= 89)) {
        bpScore = 12;
        recommendations.push('Blood pressure averages in Stage 1 hypertension range. Regular physical activity and hydration are encouraged.');
      } else {
        bpScore = 7;
        recommendations.push('Recent blood pressure readings are notably elevated. Share your log with your physician for professional review.');
      }
    }

    // 4. Medication Adherence (Max 20 pts)
    let adherenceRate = 100;
    if (medications.length > 0 && logs.length > 0) {
      const takenCount = logs.filter(l => l.status === 'taken').length;
      adherenceRate = Math.round((takenCount / logs.length) * 100);

      if (adherenceRate >= 90) {
        adherenceScore = 20;
      } else if (adherenceRate >= 75) {
        adherenceScore = 15;
        recommendations.push(`Medication adherence is ${adherenceRate}%. Set daily smartphone reminders to prevent missed doses.`);
      } else if (adherenceRate >= 60) {
        adherenceScore = 10;
        recommendations.push(`Medication adherence is ${adherenceRate}%. Discuss any dosing challenges or side effects with your doctor.`);
      } else {
        adherenceScore = 5;
        recommendations.push('Critical medication adherence deficit. Consult your prescribing physician regarding your treatment routine.');
      }
    }

    // 5. Symptom Burden (Max 10 pts)
    if (symptoms.length === 0) {
      symptomScore = 10;
    } else {
      const maxSeverity = Math.max(...symptoms.map(s => s.severity));
      if (maxSeverity <= 3) {
        symptomScore = 8;
      } else if (maxSeverity <= 6) {
        symptomScore = 5;
        recommendations.push('Active moderate symptoms logged. Monitor frequency and document any aggravating triggers.');
      } else {
        symptomScore = 2;
        recommendations.push('Active high-severity symptoms logged. Please consult your physician or visit a clinic if they worsen.');
      }
    }

    // 6. Oxygen & Vitals Stability (Max 10 pts)
    const spo2Records = metrics.filter(m => m.spO2);
    if (spo2Records.length > 0) {
      const avgSpO2 = spo2Records.reduce((acc, m) => acc + m.spO2, 0) / spo2Records.length;
      if (avgSpO2 >= 96) {
        vitalsScore = 10;
      } else if (avgSpO2 >= 94) {
        vitalsScore = 7;
      } else {
        vitalsScore = 3;
        recommendations.push('Oxygen saturation has hovered below 95%. Practice deep diaphragmatic breathing and seek clinical guidance.');
      }
    }

    const totalScore = Math.min(100, Math.max(10, Math.round(sleepScore + hrScore + bpScore + adherenceScore + symptomScore + vitalsScore)));

    let rating = 'Needs Attention';
    let color = '#ef4444';
    if (totalScore >= 85) {
      rating = 'Optimal Wellness';
      color = '#10b981';
    } else if (totalScore >= 70) {
      rating = 'Good Health Stability';
      color = '#0d9488';
    } else if (totalScore >= 55) {
      rating = 'Moderate / Monitoring Advised';
      color = '#f59e0b';
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job maintaining your preventive health habits! Continue your balanced routine.');
    }

    return {
      score: totalScore,
      rating,
      color,
      breakdown: {
        sleep: { score: sleepScore, max: 20 },
        heartRate: { score: hrScore, max: 20 },
        bloodPressure: { score: bpScore, max: 20 },
        medicationAdherence: { score: adherenceScore, max: 20, rate: adherenceRate },
        symptoms: { score: symptomScore, max: 10, activeCount: symptoms.length },
        vitalsStability: { score: vitalsScore, max: 10 },
      },
      recommendations: recommendations.slice(0, 4),
      disclaimer: 'Non-Diagnostic Wellness Indicator: This score evaluates lifestyle and physiological metric consistency. It is not a diagnostic tool or medical evaluation.',
      calculatedAt: new Date(),
    };
  }
}

module.exports = WellnessScoreService;

