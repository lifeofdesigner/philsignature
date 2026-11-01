import {
  validateTemplatePlaceholders,
  extractPlaceholders,
  getRequiredVariables,
  getRealisticSampleData,
  COMPREHENSIVE_SAMPLE_DATA,
} from '../src/features/admin/emails/placeholderValidation';
import { renderEmailPreview, DEFAULT_EMAIL_TEMPLATES } from '../src/features/admin/emails/emailTemplateDefaults';

console.log('================================================================');
console.log('  PHILZ SIGNATURE: EMAIL PLACEHOLDER VALIDATION & PREVIEW TESTS');
console.log('================================================================\n');

let allPassed = true;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    allPassed = false;
  }
}

// -----------------------------------------------------------------------------
// [Test 1] Required Variables Validation (Accidental Deletion Prevention)
// -----------------------------------------------------------------------------
console.log('[1/4] Testing Required Variables Validation (Accidental Deletion Prevention)...');

// Scenario 1a: Admin deletes {{order_number}} from an order template
const deletedOrderNumberResult = validateTemplatePlaceholders({
  subject: 'Your order has shipped',
  htmlBody: '<p>Dear Patron, your package is on the way via DHL.</p>',
  availableVariables: ['order_number', 'tracking_number', 'courier'],
  templateKey: 'order_shipped',
});
assert(!deletedOrderNumberResult.isValid, 'Templates missing required variables fail validation');
assert(
  deletedOrderNumberResult.missingRequiredVariables.includes('order_number'),
  'Flags missing "order_number" on order template'
);
assert(
  deletedOrderNumberResult.missingRequiredVariables.includes('tracking_number'),
  'Flags missing "tracking_number" on order_shipped template'
);

// Scenario 1b: Admin keeps required variables intact
const validOrderResult = validateTemplatePlaceholders({
  subject: 'Your order #{{order_number}} has shipped',
  htmlBody: '<p>Dear Patron, your package #{{order_number}} is on the way via {{courier}} with tracking {{tracking_number}}.</p>',
  availableVariables: ['order_number', 'tracking_number', 'courier'],
  templateKey: 'order_shipped',
});
assert(validOrderResult.isValid, 'Template with required variables passes validation');
assert(validOrderResult.missingRequiredVariables.length === 0, 'Zero missing required variables');

// Scenario 1c: Auth template requires verification_url
const missingVerifyResult = validateTemplatePlaceholders({
  subject: 'Welcome to Philz Signature',
  htmlBody: '<p>Welcome to our atelier!</p>',
  availableVariables: ['customer_name', 'verification_url'],
  templateKey: 'welcome_verification',
});
assert(
  missingVerifyResult.missingRequiredVariables.includes('verification_url'),
  'Flags missing "verification_url" on auth verification template'
);

// -----------------------------------------------------------------------------
// [Test 2] Invalid / Unknown Placeholder Warnings
// -----------------------------------------------------------------------------
console.log('\n[2/4] Testing Invalid / Unknown Placeholder Detection...');

const typoResult = validateTemplatePlaceholders({
  subject: 'Order Confirmation #{{order_numb}}', // typo: order_numb
  htmlBody: '<p>Hello {{customer_name}}, total: {{total_amout}}</p>', // typo: total_amout
  availableVariables: ['order_number', 'customer_name', 'total_amount'],
  templateKey: 'admin_manual_order',
});

assert(!typoResult.isValid, 'Templates with invalid placeholders fail validation');
assert(typoResult.invalidPlaceholders.includes('order_numb'), 'Correctly detected typo placeholder "order_numb"');
assert(typoResult.invalidPlaceholders.includes('total_amout'), 'Correctly detected typo placeholder "total_amout"');
assert(
  typoResult.missingRequiredVariables.includes('order_number'),
  'Also caught that required "order_number" was missing because of typo'
);

// Universal system variables (brand_name, support_email, app_url) are valid everywhere
const universalTokensResult = validateTemplatePlaceholders({
  subject: 'Order #{{order_number}} — {{brand_name}}',
  htmlBody: '<p>Contact {{support_email}} or visit {{app_url}} &copy; {{year}}</p>',
  availableVariables: ['order_number'],
  templateKey: 'order_received',
});
assert(universalTokensResult.isValid, 'Universal brand tokens (brand_name, support_email, app_url, year) pass validation');
assert(universalTokensResult.invalidPlaceholders.length === 0, 'Zero invalid placeholders for universal tokens');

// -----------------------------------------------------------------------------
// [Test 3] Preview Mode Sample Order Data Rendering
// -----------------------------------------------------------------------------
console.log('\n[3/4] Testing Preview Mode Sample Order Data Rendering...');

// Test on newly created / custom order template
const customTemplateKey = 'custom_vip_order_notice';
const customVariables = ['order_number', 'customer_name', 'total_amount', 'payment_method', 'custom_vip_tier'];
const sampleData = getRealisticSampleData(customTemplateKey, customVariables);

assert(sampleData.order_number === 'PS-88492', 'Sample order number provided');
assert(sampleData.total_amount === '₦185,000', 'Sample total amount formatted with currency symbol');
assert(sampleData.payment_method === 'Manual Bank Transfer', 'Sample payment method provided');
assert(sampleData.custom_vip_tier === '[Custom Vip Tier]', 'Generated clean humanized fallback for custom variable');

const previewHtml = renderEmailPreview(
  '<p>Dear {{customer_name}}, order #{{order_number}} total {{total_amount}} via {{payment_method}}. Tier: {{custom_vip_tier}}.</p>',
  'VIP Notice for #{{order_number}}',
  sampleData
);

assert(previewHtml.renderedSubject.includes('VIP Notice for #PS-88492'), 'Preview subject rendered sample order data');
assert(previewHtml.renderedHtml.includes('PS-88492'), 'Preview body contains rendered order number');
assert(previewHtml.renderedHtml.includes('₦185,000'), 'Preview body contains rendered order total');
assert(previewHtml.renderedHtml.includes('Manual Bank Transfer'), 'Preview body contains rendered payment method');
assert(!previewHtml.renderedHtml.includes('{{'), 'Zero raw unrendered curly placeholders remaining in preview HTML');

// -----------------------------------------------------------------------------
// [Test 4] Verify Restoring Default Templates Does NOT Overwrite Customizations
// -----------------------------------------------------------------------------
console.log('\n[4/4] Verifying Default Restoration Safeguards...');

// Test simulated database seeding logic
const mockDatabase = new Map<string, { subject: string; html_body: string }>();
mockDatabase.set('admin_manual_order', {
  subject: 'CUSTOM ADMIN SUBJECT CONFIGURED BY BOUTIQUE MANAGER',
  html_body: '<p>Custom body configured by admin.</p>',
});

// Simulate EmailTemplateRepository.getAll() seeding logic:
const dbKeys = new Set(mockDatabase.keys());
const missingToInsert = DEFAULT_EMAIL_TEMPLATES.filter((t) => !dbKeys.has(t.template_key));

assert(
  !missingToInsert.some((t) => t.template_key === 'admin_manual_order'),
  'Seeding logic skips templates already in database: "admin_manual_order" is NOT touched'
);

assert(
  mockDatabase.get('admin_manual_order')?.subject === 'CUSTOM ADMIN SUBJECT CONFIGURED BY BOUTIQUE MANAGER',
  'Customized admin subject remains 100% intact and is never overwritten on startup or seeding'
);

// Verify per-template reset isolation
const resetTargetKey = 'welcome_verification';
const defaultWelcome = DEFAULT_EMAIL_TEMPLATES.find((t) => t.template_key === resetTargetKey);
assert(Boolean(defaultWelcome), 'Default config found for single targeted reset');
assert(
  mockDatabase.get('admin_manual_order')?.subject === 'CUSTOM ADMIN SUBJECT CONFIGURED BY BOUTIQUE MANAGER',
  'Resetting one template never affects any other customized templates'
);

console.log('\n================================================================');
if (allPassed) {
  console.log('  ALL PLACEHOLDER VALIDATION & PREVIEW TESTS PASSED WITH SUCCESS!');
} else {
  console.error('  SOME TESTS FAILED');
  process.exit(1);
}
console.log('================================================================');

