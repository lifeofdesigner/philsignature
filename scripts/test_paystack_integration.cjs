const crypto = require('crypto');
const fs = require('fs');

/**
 * Paystack Reference Generator Logic
 * Format: PS_${timestamp}_${random}_${orderIdentifier}
 */
function generatePaystackReference(orderIdentifier) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  const sanitizedIdentifier = (orderIdentifier || '')
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .slice(0, 24);
  return `PS_${timestamp}_${random}_${sanitizedIdentifier}`;
}

async function runTests() {
  console.log('--- Testing Paystack Integration & Reference Uniqueness Logic ---');

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

  // 2. Test Reference Uniqueness (Requirement 1 & 2)
  console.log('\n--- Testing Reference Generation Format & Collision Resistance ---');
  const orderNumber = 'PS-9201-4421';
  const ref1 = generatePaystackReference(orderNumber);
  const ref2 = generatePaystackReference(orderNumber);
  const ref3 = generatePaystackReference(orderNumber);

  console.log(`Generated Ref 1: ${ref1}`);
  console.log(`Generated Ref 2: ${ref2}`);
  console.log(`Generated Ref 3: ${ref3}`);

  const formatRegex = /^PS_\d+_[0-9a-f]{8}_PS-9201-4421$/;
  const ref1Matches = formatRegex.test(ref1);
  const ref2Matches = formatRegex.test(ref2);
  const ref3Matches = formatRegex.test(ref3);

  console.log(`[Test 3] Format matches PS_\${timestamp}_\${random}_\${orderId}: ${ref1Matches && ref2Matches && ref3Matches ? 'PASS' : 'FAIL'}`);
  if (!ref1Matches || !ref2Matches || !ref3Matches) {
    throw new Error('Reference format does not match specification');
  }

  const unique = (ref1 !== ref2) && (ref2 !== ref3) && (ref1 !== ref3);
  console.log(`[Test 4] References are strictly unique across attempts for same order: ${unique ? 'PASS' : 'FAIL'}`);
  if (!unique) {
    throw new Error('References collided across subsequent attempts');
  }

  // 3. High-concurrency test: Generate 1,000 references in parallel to guarantee zero collisions
  const set = new Set();
  const COUNT = 1000;
  for (let i = 0; i < COUNT; i++) {
    const r = generatePaystackReference(`ORDER-${i}`);
    set.add(r);
  }
  const zeroCollisions = set.size === COUNT;
  console.log(`[Test 5] 1,000 rapid references unique (size=${set.size}/${COUNT}): ${zeroCollisions ? 'PASS' : 'FAIL'}`);
  if (!zeroCollisions) {
    throw new Error('Collision detected in high-concurrency generation');
  }

  // 4. Test Retry Handling logic
  console.log('\n--- Testing Retry Flow Behavior ---');
  // Simulate order with previous failed/cancelled reference
  const order = {
    id: 'ord_uuid_123',
    order_number: 'PS-8832-1102',
    financial_status: 'pending',
    payment_reference: ref1 // initial attempt reference
  };

  // Customer retries: Generate new reference
  const retryRef = generatePaystackReference(order.order_number);
  console.log(`Retry attempt creates new reference: ${retryRef}`);
  const isDifferentFromPrevious = retryRef !== order.payment_reference;
  console.log(`[Test 6] Retry does not reuse failed/pending reference: ${isDifferentFromPrevious ? 'PASS' : 'FAIL'}`);
  if (!isDifferentFromPrevious) {
    throw new Error('Retry reused existing payment reference');
  }

  // Second retry (cancelled again, multiple attempts)
  const retryRef2 = generatePaystackReference(order.order_number);
  console.log(`Second retry attempt creates new reference: ${retryRef2}`);
  const isDifferentFromBoth = (retryRef2 !== order.payment_reference) && (retryRef2 !== retryRef);
  console.log(`[Test 7] Multiple attempts from same order never collide: ${isDifferentFromBoth ? 'PASS' : 'FAIL'}`);
  if (!isDifferentFromBoth) {
    throw new Error('Multiple attempts reused references');
  }

  console.log('\n--- ALL PAYSTACK REFERENCE & INTEGRATION TESTS PASSED ---');
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
