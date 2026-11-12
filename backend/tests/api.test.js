const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function testAuthAndSecurity() {
  console.log('🧪 Testing Authentication, Password Hashing & JWT Security...');

  // 1. Test Password Hashing with bcrypt
  const plainPassword = 'SecureStudentPassword2026!';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);

  assert.notStrictEqual(plainPassword, hashedPassword, 'Password must be securely hashed');
  const isCorrect = await bcrypt.compare(plainPassword, hashedPassword);
  assert.strictEqual(isCorrect, true, 'Bcrypt compare should confirm valid password');

  const isWrong = await bcrypt.compare('WrongPassword!', hashedPassword);
  assert.strictEqual(isWrong, false, 'Bcrypt compare must reject invalid password');
  console.log('   ✅ Bcrypt Password Hashing & Verification: Passed.');

  // 2. Test JWT Signing and Payload Verification
  const secretKey = 'test_jwt_secret_key_caresync';
  const userId = 'usr_66b123456789';
  const token = jwt.sign({ id: userId, role: 'patient' }, secretKey, { expiresIn: '1h' });

  assert(token.length > 20, 'JWT token should be non-empty string');
  const decoded = jwt.verify(token, secretKey);
  assert.strictEqual(decoded.id, userId, 'Decoded user ID must match payload');
  assert.strictEqual(decoded.role, 'patient', 'Decoded role must match payload');
  console.log('   ✅ JWT Generation & Cryptographic Verification: Passed.');

  // 3. Test Invalid JWT Signature Rejection
  let tamperedCaught = false;
  try {
    jwt.verify(token, 'wrong_secret_key');
  } catch (err) {
    tamperedCaught = true;
  }
  assert.strictEqual(tamperedCaught, true, 'JWT verification with incorrect key must throw error');
  console.log('   ✅ Tampered JWT Signature Rejection: Passed.');

  console.log('✅ Authentication & Security Tests Passed!\n');
}

module.exports = testAuthAndSecurity;

