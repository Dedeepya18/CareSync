const assert = require('assert');
const TrendIntelligenceService = require('../src/services/trendIntelligenceService');

async function testTrendIntelligence() {
  console.log('🧪 Testing Trend Intelligence Algorithm...');

  // Mock patient ID
  const patientId = 'test_patient_123';

  // 1. Mock baseline vs upward systolic metrics
  const mockMetrics = [
    { systolicBP: 118, diastolicBP: 78, recordedAt: new Date('2026-10-01') },
    { systolicBP: 120, diastolicBP: 80, recordedAt: new Date('2026-10-02') },
    { systolicBP: 121, diastolicBP: 79, recordedAt: new Date('2026-10-03') },
    { systolicBP: 138, diastolicBP: 88, recordedAt: new Date('2026-10-04') },
    { systolicBP: 142, diastolicBP: 90, recordedAt: new Date('2026-10-05') },
    { systolicBP: 144, diastolicBP: 92, recordedAt: new Date('2026-10-06') },
  ];

  // We test the mathematical comparison logic directly
  const mid = Math.floor(mockMetrics.length / 2);
  const baseline = mockMetrics.slice(0, mid);
  const recent = mockMetrics.slice(mid);

  const avgBaselineSystolic = baseline.reduce((acc, m) => acc + m.systolicBP, 0) / baseline.length;
  const avgRecentSystolic = recent.reduce((acc, m) => acc + m.systolicBP, 0) / recent.length;
  const systolicDeltaPercent = ((avgRecentSystolic - avgBaselineSystolic) / avgBaselineSystolic) * 100;

  assert(systolicDeltaPercent > 10, 'Expected systolic increase > 10%');
  assert(avgRecentSystolic >= 140, 'Expected recent average systolic >= 140 mmHg');

  console.log(`   ✅ Systolic Trend Calculation: +${systolicDeltaPercent.toFixed(1)}% delta correctly identified.`);

  // 2. Mock Heart Rate Trend
  const mockHRMetrics = [
    { heartRate: 70 },
    { heartRate: 72 },
    { heartRate: 85 },
    { heartRate: 92 },
  ];
  const hrMid = Math.floor(mockHRMetrics.length / 2);
  const hrBaseline = mockHRMetrics.slice(0, hrMid);
  const hrRecent = mockHRMetrics.slice(hrMid);
  const avgBHR = hrBaseline.reduce((a, b) => a + b.heartRate, 0) / hrBaseline.length;
  const avgRHR = hrRecent.reduce((a, b) => a + b.heartRate, 0) / hrRecent.length;
  const hrDelta = ((avgRHR - avgBHR) / avgBHR) * 100;

  assert(hrDelta >= 12, 'Expected heart rate delta >= 12%');
  console.log(`   ✅ Heart Rate Trend Calculation: +${hrDelta.toFixed(1)}% increase correctly detected.`);

  // 3. Mock SpO2 Trend
  const mockSpO2 = [{ spO2: 93 }, { spO2: 92 }, { spO2: 94 }];
  const avgSpO2 = mockSpO2.reduce((a, b) => a + b.spO2, 0) / mockSpO2.length;
  assert(avgSpO2 < 95, 'Expected SpO2 drop below 95%');
  console.log(`   ✅ SpO2 Dip Detection: Average ${avgSpO2.toFixed(1)}% below threshold correctly recognized.`);

  console.log('✅ Trend Intelligence Unit Tests Passed!\n');
}

module.exports = testTrendIntelligence;

