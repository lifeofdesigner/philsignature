const crypto = require('crypto');
const fs = require('fs');

async function runTests() {
  console.log('--- Testing Paystack Integration Logic ---');

  // 1. Test HMAC SHA512 Signature verification
  const secretKey = 'sk_test_mock_secret_key_12345';
  const samplePayload = JSON.stringify({
    event: 'charge.success',
    data: {
      id: 987654321,
      reference: 'PS-TEST-REF-001',
      amount: 15000000,
      status: 'success',
      paid_at: new Date().toISOString(),
      channel: 'card',
      customer: { email: 'customer@test.com' }
    }
  });

  const validSignature = crypto.createHmac('sha512', secretKey).update(Buffer.from(samplePayload)).digest('hex');
  const invalidSignature = 'invalid_hex_signature_' + '0'.repeat(100);

  // Validate timing-safe check
  function verifySig(sig, rawBody, secret) {
    if (!sig || typeof sig !== 'string') return false;
    const expected = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    if (sig.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'));
  }

  const passValid = verifySig(validSignature, Buffer.from(samplePayload), secretKey);
  const passInvalid = !verifySig(invalidSignature, Buffer.from(samplePayload), secretKey);

  console.log(`[Test 1] Valid signature accepted: ${passValid ? 'PASS' : 'FAIL'}`);
  console.log(`[Test 2] Invalid signature rejected: ${passInvalid ? 'PASS' : 'FAIL'}`);

  if (!passValid || !passInvalid) {
    throw new Error('HMAC SHA512 signature test failed');
  }

  console.log('--- All Paystack unit checks passed ---');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
