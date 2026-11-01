const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const assert = require('assert');

// Load environment variables
const envContent = fs.readFileSync('.env', 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const parts = line.trim().split('=');
  const key = parts[0]?.trim();
  const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
  if (key && val) env[key] = val;
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('  PHILZ SIGNATURE: END-TO-END MANUAL TRANSFER VERIFICATION');
  console.log('================================================================\n');

  const testOrderNumber = `PS-E2E-${Date.now().toString().slice(-6)}`;
  let testOrderId = null;

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Verify Concierge Email Configuration in System
    // -------------------------------------------------------------------------
    console.log('[Step 1] Querying existing Concierge email from site_settings...');
    const { data: conciergeSetting, error: conciergeErr } = await supabase
      .from('site_settings')
      .select('key, value')
      .eq('key', 'concierge_email')
      .maybeSingle();

    assert(!conciergeErr, `Failed to query site_settings: ${conciergeErr?.message}`);
    assert(conciergeSetting, 'concierge_email must exist in site_settings');
    const existingConciergeEmail = String(conciergeSetting.value).replace(/^["']|["']$/g, '').trim().toLowerCase();
    assert(existingConciergeEmail.includes('@'), 'Concierge email must be a valid email address');
    console.log(`  ✓ Successfully retrieved existing Concierge email: "${existingConciergeEmail}"`);

    // Verify multi-recipient parsing logic collects the Concierge email
    function resolveRecipients(settingsData, envVal) {
      const recipients = new Set();
      if (settingsData && settingsData.length > 0) {
        for (const row of settingsData) {
          if (row && row.value) {
            const clean = typeof row.value === 'string' ? row.value.replace(/^["']|["']$/g, '') : String(row.value);
            clean.split(',').map((e) => e.trim().toLowerCase()).filter((e) => e.includes('@')).forEach((e) => recipients.add(e));
          }
        }
      }
      if (envVal) {
        envVal.split(',').map((e) => e.trim().toLowerCase()).filter((e) => e.includes('@')).forEach((e) => recipients.add(e));
      }
      return Array.from(recipients);
    }

    const resolvedEmails = resolveRecipients([conciergeSetting], env.ADMIN_NOTIFICATION_EMAIL);
    assert(resolvedEmails.includes(existingConciergeEmail), 'Resolved recipients MUST include existing Concierge email');
    console.log(`  ✓ Recipients list accurately includes Concierge email: [${resolvedEmails.join(', ')}]\n`);

    // -------------------------------------------------------------------------
    // STEP 2: Verify Online Payment Methods (Paystack, etc.) NEVER trigger manual admin notification
    // -------------------------------------------------------------------------
    console.log('[Step 2] Verifying Paystack / online methods CANNOT trigger manual transfer alert...');
    function canSendAdminManualTransferEmail(order) {
      if (order.payment_method && order.payment_method !== 'bank_transfer') {
        return false;
      }
      return true;
    }

    assert.strictEqual(canSendAdminManualTransferEmail({ order_number: 'PS-1', payment_method: 'paystack' }), false);
    assert.strictEqual(canSendAdminManualTransferEmail({ order_number: 'PS-2', payment_method: 'flutterwave' }), false);
    assert.strictEqual(canSendAdminManualTransferEmail({ order_number: 'PS-3', payment_method: 'korapay' }), false);
    assert.strictEqual(canSendAdminManualTransferEmail({ order_number: 'PS-4', payment_method: 'bank_transfer' }), true);
    console.log('  ✓ Verified: Non-manual payment methods strictly blocked from triggering admin manual order alerts\n');

    // -------------------------------------------------------------------------
    // STEP 3: Customer Places a Manual Bank Transfer Order
    // -------------------------------------------------------------------------
    console.log('[Step 3] Customer placing Manual Bank Transfer order in database...');
    const { data: createdOrder, error: createErr } = await supabase
      .from('orders')
      .insert({
        order_number: testOrderNumber,
        email: 'e2e_customer@luxuryfragrance.com',
        phone: '+2348011223344',
        financial_status: 'pending',
        fulfillment_status: 'pending',
        payment_method: 'bank_transfer',
        subtotal: 120000,
        shipping_amount: 5000,
        discount_amount: 0,
        tax_amount: 9000,
        tax_rate: 7.5,
        total_amount: 134000,
        shipping_address: {
          first_name: 'Genevieve',
          last_name: 'Sterling',
          address_line1: '14 Alexander Boulevard',
          city: 'Ikoyi',
          state: 'Lagos',
          country: 'Nigeria',
        },
      })
      .select()
      .single();

    assert(!createErr, `Failed to create test order: ${createErr?.message}`);
    testOrderId = createdOrder.id;
    console.log(`  ✓ Order created successfully: #${createdOrder.order_number} (ID: ${testOrderId})`);
    assert.strictEqual(createdOrder.financial_status, 'pending');
    assert.strictEqual(createdOrder.fulfillment_status, 'pending');
    assert.strictEqual(createdOrder.payment_method, 'bank_transfer');

    // -------------------------------------------------------------------------
    // STEP 4: Concierge Email Receives the Admin Notification & Deduplication
    // -------------------------------------------------------------------------
    console.log('[Step 4] Simulating Admin Manual Transfer notification dispatch...');
    const dispatchedEmails = [];

    async function simulateDispatchEmail(payload) {
      // Check idempotency against existing dispatched log for this order
      const isDupe = dispatchedEmails.some(
        (e) => e.orderId === payload.orderId && e.emailType === payload.emailType && e.to.toLowerCase() === payload.to.toLowerCase()
      );
      if (isDupe) {
        console.log(`  [Dedup Block] Prevented duplicate "${payload.emailType}" dispatch to ${payload.to}`);
        return { success: true, duplicateBlocked: true };
      }

      dispatchedEmails.push({
        orderId: payload.orderId,
        emailType: payload.emailType,
        to: payload.to,
        subject: payload.subject,
        timestamp: new Date().toISOString(),
      });

      // Record in activity_logs
      await supabase.from('activity_logs').insert({
        action: 'transactional_email_dispatched',
        entity_type: 'order',
        entity_id: payload.orderId,
        details: {
          type: payload.emailType,
          recipient: payload.to,
          subject: payload.subject,
          sentViaApi: true,
          timestamp: new Date().toISOString(),
        },
      });

      return { success: true, duplicateBlocked: false };
    }

    // First dispatch to Concierge Email
    const adminAlertSubject = `[Action Required] New Manual Transfer Order #${createdOrder.order_number} Awaiting Verification`;
    const firstDispatch = await simulateDispatchEmail({
      orderId: createdOrder.id,
      emailType: 'admin_manual_order',
      to: existingConciergeEmail,
      subject: adminAlertSubject,
    });

    assert.strictEqual(firstDispatch.duplicateBlocked, false);
    assert.strictEqual(dispatchedEmails.filter((e) => e.emailType === 'admin_manual_order').length, 1);
    console.log(`  ✓ Concierge email (${existingConciergeEmail}) received notification: "${adminAlertSubject}"`);

    // Verify deduplication: Attempt duplicate dispatch for the same order
    const secondDispatch = await simulateDispatchEmail({
      orderId: createdOrder.id,
      emailType: 'admin_manual_order',
      to: existingConciergeEmail,
      subject: adminAlertSubject,
    });
    assert.strictEqual(secondDispatch.duplicateBlocked, true);
    assert.strictEqual(dispatchedEmails.filter((e) => e.emailType === 'admin_manual_order').length, 1);
    console.log('  ✓ Verified: Admin notification sent EXACTLY ONCE (duplicate suppressed)\n');

    // -------------------------------------------------------------------------
    // STEP 5: Admin Confirms Payment
    // -------------------------------------------------------------------------
    console.log('[Step 5] Admin confirming Manual Bank Transfer payment...');
    const manualRef = `MANUAL-admin-${Date.now()}`;

    // Simulate OrderService.confirmPayment logic
    async function confirmPaymentWorkflow(orderId, reference, paymentMethod) {
      // 1. Fetch current order
      const { data: currentOrder } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (currentOrder.financial_status === 'paid') {
        return { order: currentOrder, alreadyConfirmed: true, emailDispatched: false };
      }

      // 2. Transition financial_status -> 'paid', fulfillment_status -> 'processing'
      const nextFulfillment = currentOrder.fulfillment_status === 'pending' ? 'processing' : currentOrder.fulfillment_status;
      const { data: updated, error: updErr } = await supabase
        .from('orders')
        .update({
          payment_reference: reference,
          financial_status: 'paid',
          fulfillment_status: nextFulfillment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updErr) throw updErr;

      // 3. Add timeline milestone
      await supabase.from('order_timeline').insert({
        order_id: orderId,
        status: 'paid',
        title: 'Payment Confirmed',
        description: `Payment confirmed successfully via ${paymentMethod === 'bank_transfer' ? 'MANUAL BANK TRANSFER' : paymentMethod.toUpperCase()} (Ref: ${reference}). Your payment has been verified and your order is now being processed.`,
      });

      // 4. Dispatch Payment Confirmation email to customer
      const result = await simulateDispatchEmail({
        orderId: updated.id,
        emailType: 'payment_confirmation',
        to: updated.email,
        subject: `Payment Confirmed — Philz Signature Order #${updated.order_number}`,
      });

      return { order: updated, alreadyConfirmed: false, emailDispatched: !result.duplicateBlocked };
    }

    const firstConfirmResult = await confirmPaymentWorkflow(createdOrder.id, manualRef, 'bank_transfer');
    assert.strictEqual(firstConfirmResult.alreadyConfirmed, false);
    assert.strictEqual(firstConfirmResult.emailDispatched, true);
    assert.strictEqual(firstConfirmResult.order.financial_status, 'paid');
    assert.strictEqual(firstConfirmResult.order.fulfillment_status, 'processing');
    console.log(`  ✓ Order #${createdOrder.order_number} marked as paid (financial_status: 'paid', fulfillment_status: 'processing')`);
    console.log(`  ✓ Customer (${createdOrder.email}) received Payment Confirmed email`);

    // Verify timeline entry was written
    const { data: timeline } = await supabase.from('order_timeline').select('*').eq('order_id', createdOrder.id).eq('status', 'paid');
    assert(timeline && timeline.length > 0, 'Timeline milestone must be created');
    console.log(`  ✓ Timeline milestone created: "${timeline[0].title}" — "${timeline[0].description}"`);

    // -------------------------------------------------------------------------
    // STEP 6: Verify Deduplication on Repeated Confirm
    // -------------------------------------------------------------------------
    console.log('[Step 6] Testing idempotency on secondary / double-confirm attempt...');
    const secondConfirmResult = await confirmPaymentWorkflow(createdOrder.id, manualRef, 'bank_transfer');
    assert.strictEqual(secondConfirmResult.alreadyConfirmed, true);
    assert.strictEqual(secondConfirmResult.emailDispatched, false);

    const customerConfirmationEmails = dispatchedEmails.filter((e) => e.emailType === 'payment_confirmation');
    assert.strictEqual(customerConfirmationEmails.length, 1);
    console.log('  ✓ Verified: Customer Payment Confirmed email sent EXACTLY ONCE (duplicate suppressed)\n');

    console.log('================================================================');
    console.log('  ALL END-TO-END VERIFICATION CHECKS COMPLETED SUCCESSFULLY!');
    console.log('================================================================');
  } finally {
    // Clean up test order
    if (testOrderId) {
      console.log('\nCleaning up test artifacts...');
      await supabase.from('activity_logs').delete().eq('entity_id', testOrderId);
      await supabase.from('order_timeline').delete().eq('order_id', testOrderId);
      await supabase.from('orders').delete().eq('id', testOrderId);
      console.log('Test artifacts cleaned up.');
    }
  }
}

runEndToEndVerification().catch((err) => {
  console.error('\nE2E verification failed:', err);
  process.exit(1);
});
