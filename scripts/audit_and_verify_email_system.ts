import { createClient } from '@supabase/supabase-js';
import { getAdminNotificationEmails, sendAdminManualTransferEmail, sendOrderReceivedEmail, sendPaymentConfirmationEmail } from '../api/_lib/emailService.js';

console.log('================================================================');
console.log('  PHILZ SIGNATURE: FULL TRANSACTIONAL EMAIL ARCHITECTURE AUDIT  ');
console.log('================================================================\n');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

let allPassed = true;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    allPassed = false;
  }
}

async function main() {
  // ---------------------------------------------------------------------------
  // [Audit 1] CMS as Single Source of Truth — Database Templates Verification
  // ---------------------------------------------------------------------------
  console.log('[1/5] Auditing CMS Email Templates Table as Single Source of Truth...');
  const { data: templates, error: tErr } = await supabase
    .from('email_templates')
    .select('id, template_key, name, subject, html_body, is_active');

  assert(!tErr, 'Successfully connected and queried email_templates database table');
  assert(Boolean(templates && templates.length >= 21), `Found ${templates?.length} CMS templates in database (expected >= 21)`);

  const keys = new Set(templates?.map((t) => t.template_key) || []);
  const REQUIRED_KEYS = [
    'welcome_verification',
    'email_verified_confirmation',
    'new_login_alert',
    'password_changed_alert',
    'password_reset',
    'email_changed',
    'order_received',
    'payment_confirmation',
    'order_processing',
    'order_shipped',
    'out_for_delivery',
    'order_delivered',
    'order_cancelled',
    'refund_processed',
    'admin_new_order',
    'admin_high_value_order',
    'admin_failed_payment',
    'admin_refund_requested',
    'admin_new_customer',
    'admin_low_inventory',
    'admin_manual_order',
  ];

  for (const k of REQUIRED_KEYS) {
    assert(keys.has(k), `Template key "${k}" exists in database email_templates table`);
  }

  // ---------------------------------------------------------------------------
  // [Audit 2] Template Disable Behavior
  // ---------------------------------------------------------------------------
  console.log('\n[2/5] Auditing Template Disable Behavior...');
  // Temporarily disable admin_manual_order to verify suppression
  await supabase
    .from('email_templates')
    .update({ is_active: false })
    .eq('template_key', 'admin_manual_order');

  const testOrder = {
    id: 'audit-test-order-001',
    order_number: 'PS-AUDIT-001',
    email: 'patron@example.com',
    subtotal: 150000,
    shipping_amount: 0,
    discount_amount: 0,
    total_amount: 150000,
    payment_method: 'bank_transfer',
    shipping_address: { first_name: 'Audit', last_name: 'Tester' },
  };

  // Dispatch should be suppressed because is_active is false
  await sendAdminManualTransferEmail(testOrder);

  // Check activity logs for suppression entry
  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('action', 'transactional_email_suppressed_disabled')
    .eq('entity_id', 'admin_manual_order')
    .order('created_at', { ascending: false })
    .limit(1);

  assert(Boolean(logs && logs.length > 0), 'Suppression logged to activity_logs when template is disabled');
  assert(
    logs?.[0]?.details?.reason === 'Template disabled in Admin CMS',
    'Logged suppression reason accurately: "Template disabled in Admin CMS"'
  );

  // Restore template to active
  await supabase
    .from('email_templates')
    .update({ is_active: true })
    .eq('template_key', 'admin_manual_order');
  console.log('  ✓ Template restored to is_active = true');

  // ---------------------------------------------------------------------------
  // [Audit 3] Concierge & Admin Notification Recipients
  // ---------------------------------------------------------------------------
  console.log('\n[3/5] Auditing Concierge Email & Multi-Recipient Configuration...');
  const { data: siteSettings } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('key', 'concierge_email')
    .single();

  assert(siteSettings?.value === 'philzsignature1@gmail.com', 'site_settings.concierge_email is "philzsignature1@gmail.com"');

  const resolvedRecipients = await getAdminNotificationEmails();
  assert(
    resolvedRecipients.includes('philzsignature1@gmail.com'),
    'getAdminNotificationEmails() includes configured Concierge email'
  );
  assert(resolvedRecipients.length >= 1, `Total admin recipients resolved: ${resolvedRecipients.join(', ')}`);

  // ---------------------------------------------------------------------------
  // [Audit 4] Preview Data Isolation
  // ---------------------------------------------------------------------------
  console.log('\n[4/5] Auditing Preview Data Isolation...');
  // Inspect that production email service never uses hardcoded preview data
  const fs = await import('fs');
  const emailServiceCode = fs.readFileSync('api/_lib/emailService.ts', 'utf8');

  assert(!emailServiceCode.includes('Lord Alexander Vance'), 'Production emailService.ts contains NO sample names');
  assert(!emailServiceCode.includes('PS-88492'), 'Production emailService.ts contains NO sample order numbers');
  assert(!emailServiceCode.includes('14 Alexander Road'), 'Production emailService.ts contains NO sample addresses');
  assert(!emailServiceCode.includes('COMPREHENSIVE_SAMPLE_DATA'), 'Production emailService.ts does NOT import CMS preview sample dictionary');

  // ---------------------------------------------------------------------------
  // [Audit 5] Real Payload Rendering
  // ---------------------------------------------------------------------------
  console.log('\n[5/5] Verifying Production Emails Render Exclusively from Real Payloads...');
  // Verify manual transfer guard rejects online payments
  let onlinePaymentSkipped = false;
  const paystackOrder = { ...testOrder, payment_method: 'paystack' };
  // Intercept console.info
  const originalInfo = console.info;
  console.info = (msg: string) => {
    if (msg.includes('Skipping admin_manual_order')) onlinePaymentSkipped = true;
  };
  await sendAdminManualTransferEmail(paystackOrder);
  console.info = originalInfo;
  assert(onlinePaymentSkipped, 'Manual transfer notification strictly rejects paystack / non-manual payments');

  console.log('\n================================================================');
  if (allPassed) {
    console.log('  ALL EMAIL ARCHITECTURE AUDIT CHECKS PASSED WITH SUCCESS!');
  } else {
    console.error('  SOME AUDIT CHECKS FAILED');
    process.exit(1);
  }
  console.log('================================================================');
}

main().catch((err) => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
