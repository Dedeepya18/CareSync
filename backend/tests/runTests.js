const testTrendIntelligence = require('./trendIntelligence.test');
const testWellnessScoreLogic = require('./wellnessScore.test');
const testAuthAndSecurity = require('./api.test');

async function runAllTests() {
  console.log('========================================================');
  console.log('🔬 CareSync Comprehensive Automated Test Runner');
  console.log('========================================================\n');

  const startTime = Date.now();
  let passed = 0;
  let failed = 0;

  try {
    await testAuthAndSecurity();
    passed++;
  } catch (err) {
    console.error('❌ Auth & Security Tests Failed:', err);
    failed++;
  }

  try {
    await testWellnessScoreLogic();
    passed++;
  } catch (err) {
    console.error('❌ Wellness Score Tests Failed:', err);
    failed++;
  }

  try {
    await testTrendIntelligence();
    passed++;
  } catch (err) {
    console.error('❌ Trend Intelligence Tests Failed:', err);
    failed++;
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('========================================================');
  console.log(`📋 Test Results: ${passed} Passed, ${failed} Failed (${duration}s)`);
  if (failed === 0) {
    console.log('🎉 ALL CARESYNC UNIT & INTEGRATION TESTS PASSED!');
  }
  console.log('========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();

