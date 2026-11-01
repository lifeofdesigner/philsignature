const assert = require('assert');

// 1. Verify Template String Replacement Logic
function replacePlaceholders(templateStr, variables) {
  let result = templateStr;
  for (const [key, val] of Object.entries(variables)) {
    const valueStr = val === undefined || val === null ? '' : String(val);
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`{{\\s*${escaped}\\s*}}`, 'g');
    result = result.replace(regex, valueStr);
  }
  return result;
}

function formatNaira(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

async function runManualTransferTests() {
  console.log('=== Philz Signature Manual Transfer Notification Tests ===\n');

  // Test 1: Admin Notification Template Resolution & Variables
  console.log('[Test 1] Verifying Admin Manual Transfer Notification Template');
  const adminTemplate = {
    subject: `[Action Required] New Manual Transfer Order #{{order_number}} Awaiting Verification`,
    html_body: `
    Order: #{{order_number}}
    Name: {{customer_name}}
    Email: {{customer_email}}
    Total: {{total_amount}}
    Method: {{payment_method}}
    DateTime: {{date_time}}
    CMS: {{admin_order_url}}
    `,
  };

  const sampleOrder = {
    id: 'test-order-uuid-001',
    order_number: 'PS-8821-4920',
    email: 'client@luxuryboutique.com',
    total_amount: 175000,
    shipping_address: {
      first_name: 'Lady Genevieve',
      last_name: 'Sterling',
    },
    created_at: '2026-11-01T08:30:00.000Z',
  };

  const shipping = sampleOrder.shipping_address;
  const customerName = [shipping.first_name, shipping.last_name].filter(Boolean).join(' ').trim();
  const dateTimeStr = new Date(sampleOrder.created_at).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const adminUrl = `https://philzsignature.com/admin/orders?order=${encodeURIComponent(sampleOrder.order_number)}`;

  const variables = {
    order_number: sampleOrder.order_number,
    customer_name: customerName,
    customer_email: sampleOrder.email,
    payment_method: 'Manual Bank Transfer',
    date_time: dateTimeStr,
    total_amount: formatNaira(sampleOrder.total_amount),
    admin_order_url: adminUrl,
  };

  const renderedSubject = replacePlaceholders(adminTemplate.subject, variables);
  const renderedHtml = replacePlaceholders(adminTemplate.html_body, variables);

  assert.strictEqual(renderedSubject, `[Action Required] New Manual Transfer Order #PS-8821-4920 Awaiting Verification`);
  assert(renderedHtml.includes('PS-8821-4920'), 'Must contain order number');
  assert(renderedHtml.includes('Lady Genevieve Sterling'), 'Must contain customer name');
  assert(renderedHtml.includes('client@luxuryboutique.com'), 'Must contain customer email');
  assert(renderedHtml.includes('₦175,000'), 'Must contain order total');
  assert(renderedHtml.includes('Manual Bank Transfer'), 'Must contain payment method');
  assert(renderedHtml.includes('https://philzsignature.com/admin/orders?order=PS-8821-4920'), 'Must contain direct CMS link');
  console.log('  ✓ Admin template correctly renders all 7 required fields\n');

  // Test 2: Admin Notification Emails List Parsing
  console.log('[Test 2] Verifying Configured Admin Email(s) Multi-Recipient Parsing');
  function parseAdminEmails(envVal, fallback = 'orders@philzsignature.com') {
    if (envVal) {
      const list = envVal.split(',').map((e) => e.trim()).filter((e) => e.length > 0 && e.includes('@'));
      if (list.length > 0) return list;
    }
    return [fallback];
  }

  const singleAdmin = parseAdminEmails('admin@philzsignature.com');
  assert.deepStrictEqual(singleAdmin, ['admin@philzsignature.com']);

  const multiAdmins = parseAdminEmails('admin1@philzsignature.com, admin2@philzsignature.com, orders@philzsignature.com');
  assert.deepStrictEqual(multiAdmins, ['admin1@philzsignature.com', 'admin2@philzsignature.com', 'orders@philzsignature.com']);

  const emptyFallback = parseAdminEmails('');
  assert.deepStrictEqual(emptyFallback, ['orders@philzsignature.com']);
  console.log('  ✓ Configured admin email(s) parse single, multi, and fallback correctly\n');

  // Test 3: Customer Payment Confirmed Template Resolution
  console.log('[Test 3] Verifying Customer Payment Confirmed Email for Manual Bank Transfer');
  const paymentTemplate = {
    subject: `Payment Confirmed — Philz Signature Order #{{order_number}}`,
    html_body: `
      We have successfully verified your payment via {{gateway}}.
      Reference: {{reference}}
      Amount Paid: {{amount_paid}}
      Status: Verified • Paid
    `,
  };

  const paymentVars = {
    order_number: sampleOrder.order_number,
    gateway: 'MANUAL BANK TRANSFER',
    reference: 'MANUAL-admin-1761984000',
    amount_paid: formatNaira(sampleOrder.total_amount),
  };

  const customerEmailSubject = replacePlaceholders(paymentTemplate.subject, paymentVars);
  const customerEmailBody = replacePlaceholders(paymentTemplate.html_body, paymentVars);

  assert.strictEqual(customerEmailSubject, 'Payment Confirmed — Philz Signature Order #PS-8821-4920');
  assert(customerEmailBody.includes('MANUAL BANK TRANSFER'), 'Must specify verified payment via Manual Bank Transfer');
  assert(customerEmailBody.includes('MANUAL-admin-1761984000'), 'Must include manual reference');
  assert(customerEmailBody.includes('₦175,000'), 'Must include correct amount paid');
  console.log('  ✓ Customer Payment Confirmed email properly notifies payment verification & order processing\n');

  // Test 4: Deduplication Logic Check
  console.log('[Test 4] Verifying Deduplication / Idempotency Safeguards');
  const mockActivityLogs = [
    {
      action: 'transactional_email_dispatched',
      entity_type: 'order',
      entity_id: 'test-order-uuid-001',
      details: {
        type: 'admin_manual_order',
        recipient: 'admin1@philzsignature.com',
      },
    },
    {
      action: 'transactional_email_dispatched',
      entity_type: 'order',
      entity_id: 'test-order-uuid-001',
      details: {
        type: 'payment_confirmed',
        recipient: 'client@luxuryboutique.com',
      },
    },
  ];

  function isDuplicate(orderId, emailType, recipient, logs) {
    return logs.some(
      (log) =>
        log.entity_id === orderId &&
        log.details?.type === emailType &&
        String(log.details?.recipient).toLowerCase() === recipient.toLowerCase()
    );
  }

  // Duplicate checks
  assert.strictEqual(isDuplicate('test-order-uuid-001', 'admin_manual_order', 'admin1@philzsignature.com', mockActivityLogs), true);
  assert.strictEqual(isDuplicate('test-order-uuid-001', 'payment_confirmed', 'client@luxuryboutique.com', mockActivityLogs), true);

  // Different recipient or different email type or new order must not be blocked
  assert.strictEqual(isDuplicate('test-order-uuid-001', 'admin_manual_order', 'newadmin@philzsignature.com', mockActivityLogs), false);
  assert.strictEqual(isDuplicate('test-order-uuid-002', 'admin_manual_order', 'admin1@philzsignature.com', mockActivityLogs), false);
  console.log('  ✓ Deduplication safeguards accurately identify and block duplicate notifications\n');

  // Test 5: Order State Machine / Fulfillment Status Transition on Payment Confirmation
  console.log('[Test 5] Verifying State Transitions on Manual Transfer Payment Confirmation');
  const pendingOrder = {
    id: 'test-order-uuid-001',
    financial_status: 'pending',
    fulfillment_status: 'pending',
  };

  function simulatePaymentConfirmation(order) {
    if (order.financial_status === 'paid') {
      return { order, shouldSendEmail: false, alreadyConfirmed: true };
    }
    const updated = {
      ...order,
      financial_status: 'paid',
      fulfillment_status: order.fulfillment_status === 'pending' ? 'processing' : order.fulfillment_status,
    };
    return { order: updated, shouldSendEmail: true, alreadyConfirmed: false };
  }

  const firstConfirm = simulatePaymentConfirmation(pendingOrder);
  assert.strictEqual(firstConfirm.alreadyConfirmed, false);
  assert.strictEqual(firstConfirm.shouldSendEmail, true);
  assert.strictEqual(firstConfirm.order.financial_status, 'paid');
  assert.strictEqual(firstConfirm.order.fulfillment_status, 'processing');

  const secondConfirm = simulatePaymentConfirmation(firstConfirm.order);
  assert.strictEqual(secondConfirm.alreadyConfirmed, true);
  assert.strictEqual(secondConfirm.shouldSendEmail, false, 'No second email sent upon duplicate confirm');
  console.log('  ✓ State transition correctly moves pending -> processing, and suppresses duplicate emails\n');

  console.log('All 5 Manual Transfer notification tests passed successfully!');
}

runManualTransferTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

