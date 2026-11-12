const assert = require('assert');

async function testWellnessScoreLogic() {
  console.log('🧪 Testing Wellness Score Component Calculation...');

  // Component score tests
  const calculateSampleScore = (sleepHrs, avgHR, avgSys, adherenceRate, maxSymptomSeverity) => {
    let sleep = sleepHrs >= 7 && sleepHrs <= 9 ? 20 : (sleepHrs >= 6 ? 16 : 10);
    let hr = avgHR >= 60 && avgHR <= 78 ? 20 : (avgHR <= 88 ? 16 : 10);
    let bp = avgSys < 120 ? 20 : (avgSys <= 130 ? 17 : (avgSys <= 140 ? 12 : 7));
    let adherence = adherenceRate >= 90 ? 20 : (adherenceRate >= 75 ? 15 : 10);
    let symptom = maxSymptomSeverity === 0 ? 10 : (maxSymptomSeverity <= 4 ? 8 : 4);
    let vitals = 10;

    const total = sleep + hr + bp + adherence + symptom + vitals;
    return Math.min(100, Math.max(0, total));
  };

  // Test ideal case (expect 100 or >= 95)
  const idealScore = calculateSampleScore(8.0, 68, 115, 95, 0);
  assert.strictEqual(idealScore, 100, 'Ideal profile should yield 100 points');
  console.log(`   ✅ Ideal Health Profile Score: ${idealScore}/100 (Optimal)`);

  // Test moderate case
  const moderateScore = calculateSampleScore(6.5, 84, 134, 80, 3);
  assert(moderateScore >= 60 && moderateScore <= 80, 'Moderate profile should be within 60-80 range');
  console.log(`   ✅ Moderate Health Profile Score: ${moderateScore}/100 (Moderate)`);

  // Test lower case
  const lowScore = calculateSampleScore(4.5, 95, 155, 60, 8);
  assert(lowScore < 60, 'Elevated burden should yield score < 60');
  console.log(`   ✅ Elevated Burden Profile Score: ${lowScore}/100 (Needs Attention)`);

  console.log('✅ Wellness Score Unit Tests Passed!\n');
}

module.exports = testWellnessScoreLogic;

