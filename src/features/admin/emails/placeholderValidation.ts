/**
 * ==============================================================================
 * PHILZ SIGNATURE — Transactional Email Placeholder & Variable Validation System
 * ==============================================================================
 * Enforces safety guarantees:
 * 1. Admin cannot accidentally delete required variables.
 * 2. Invalid/unknown placeholders are warned before saving.
 * 3. Preview mode renders rich sample order and patron data realistically.
 */

export const UNIVERSAL_SYSTEM_VARIABLES = [
  'brand_name',
  'brand_tagline',
  'support_email',
  'app_url',
  'year',
] as const;

export const REQUIRED_VARIABLES_BY_KEY: Record<string, string[]> = {
  // Patron order notifications
  order_received: ['order_number'],
  payment_confirmation: ['order_number'],
  order_processing: ['order_number'],
  order_shipped: ['order_number', 'tracking_number'],
  out_for_delivery: ['order_number'],
  order_delivered: ['order_number'],
  order_cancelled: ['order_number'],
  refund_processed: ['order_number'],

  // Authentication & Security
  welcome_verification: ['verification_url'],
  email_verified_confirmation: ['customer_name'],
  password_reset: ['reset_url'],
  email_changed: ['old_email', 'new_email'],

  // Admin alerts
  admin_manual_order: ['order_number'],
  admin_new_order: ['order_number'],
  admin_high_value_order: ['order_number'],
  admin_failed_payment: ['order_number'],
  admin_refund_requested: ['order_number'],
  admin_low_inventory: ['product_name'],
  admin_new_customer: ['customer_email'],
};

/**
 * Extracts all {{variable_name}} tokens from subject and HTML body
 */
export function extractPlaceholders(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/{{\s*([a-zA-Z0-9_]+)\s*}}/g);
  if (!matches) return [];

  const set = new Set<string>();
  for (const match of matches) {
    const cleaned = match.replace(/[{}]/g, '').trim();
    if (cleaned) {
      set.add(cleaned);
    }
  }
  return Array.from(set);
}

/**
 * Resolves required variables for a given template key or custom template
 */
export function getRequiredVariables(templateKey?: string, variables?: string[]): string[] {
  if (templateKey && REQUIRED_VARIABLES_BY_KEY[templateKey]) {
    return REQUIRED_VARIABLES_BY_KEY[templateKey];
  }

  // Heuristic: If template key or variables suggest an order, order_number is required
  if (templateKey?.includes('order') || variables?.includes('order_number')) {
    return ['order_number'];
  }

  // If auth-related
  if (templateKey?.includes('verify') || variables?.includes('verification_url')) {
    return ['verification_url'];
  }
  if (templateKey?.includes('password') && variables?.includes('reset_url')) {
    return ['reset_url'];
  }

  return [];
}

export interface PlaceholderValidationResult {
  isValid: boolean;
  usedPlaceholders: string[];
  invalidPlaceholders: string[];
  missingRequiredVariables: string[];
  errors: string[];
  warnings: string[];
}

/**
 * Performs strict validation on placeholders present in the template text
 */
export function validateTemplatePlaceholders(params: {
  subject: string;
  htmlBody: string;
  availableVariables: string[];
  templateKey?: string;
  explicitRequiredVariables?: string[];
}): PlaceholderValidationResult {
  const { subject, htmlBody, availableVariables, templateKey, explicitRequiredVariables } = params;
  const combinedContent = `${subject || ''} ${htmlBody || ''}`;
  const usedPlaceholders = extractPlaceholders(combinedContent);

  // Allowed tokens: available variables + universal brand variables
  const allowedSet = new Set<string>([
    ...availableVariables,
    ...UNIVERSAL_SYSTEM_VARIABLES,
  ]);

  // 1. Detect unknown / invalid placeholders
  const invalidPlaceholders = usedPlaceholders.filter((ph) => !allowedSet.has(ph));

  // 2. Detect missing required variables
  const requiredList = explicitRequiredVariables || getRequiredVariables(templateKey, availableVariables);
  const usedSet = new Set<string>(usedPlaceholders);
  const missingRequiredVariables = requiredList.filter((req) => !usedSet.has(req));

  const errors: string[] = [];
  const warnings: string[] = [];

  if (invalidPlaceholders.length > 0) {
    warnings.push(
      `Unknown placeholder(s) detected: ${invalidPlaceholders.map((v) => `{{${v}}}`).join(', ')}. These will not be replaced with dynamic data.`
    );
  }

  if (missingRequiredVariables.length > 0) {
    errors.push(
      `Required variable(s) missing: ${missingRequiredVariables.map((v) => `{{${v}}}`).join(', ')}. Please include them in the subject or body to prevent critical data loss.`
    );
  }

  const isValid = missingRequiredVariables.length === 0 && invalidPlaceholders.length === 0;

  return {
    isValid,
    usedPlaceholders,
    invalidPlaceholders,
    missingRequiredVariables,
    errors,
    warnings,
  };
}

/**
 * Comprehensive luxury sample dictionary for rendering previews
 */
export const COMPREHENSIVE_SAMPLE_DATA: Record<string, string> = {
  // Order identifiers & Customer
  order_number: 'PS-88492',
  customer_name: 'Lord Alexander Vance',
  customer_email: 'alexander.vance@luxury.com',

  // Financials & Payment
  total_amount: '₦185,000',
  amount_paid: '₦185,000',
  subtotal: '₦185,000',
  shipping_amount: '₦0 (Complimentary VIP Dispatch)',
  tax_row: '',
  discount_row: '',
  payment_method: 'Manual Bank Transfer',
  gateway: 'Manual Bank Transfer',
  reference: 'MAN-TRANSFER-88492',
  reference_row: '<tr><td class="info-label">Reference</td><td class="info-value">MAN-TRANSFER-88492</td></tr>',
  receipt_url: 'https://philzsignature.com/receipts/PS-88492',
  refund_amount: '₦185,000',
  timeline: '3–5 Business Days',

  // Order Details & Addresses
  shipping_address_html: '<strong>Lord Alexander Vance</strong><br />14 Alexander Road, Ikoyi, Lagos<br />+234 801 234 5678',
  track_order_url: 'https://philzsignature.com/orders/PS-88492',
  admin_order_url: 'https://philzsignature.com/admin/orders?order=PS-88492',
  admin_orders_url: 'https://philzsignature.com/admin/orders',
  admin_products_url: 'https://philzsignature.com/admin/products',
  admin_customers_url: 'https://philzsignature.com/admin/customers',

  // Logistics & Shipping
  courier: 'DHL Express VIP Consignment',
  tracking_number: 'DHL-NG-984021',
  track_courier_url: 'https://dhl.com/track?id=DHL-NG-984021',
  estimated_time: '24–48 Business Hours',
  review_url: 'https://philzsignature.com/reviews/new?order=PS-88492',
  reason: 'Client requested fragrance profile change',

  // Line items
  items_count: '2',
  items_table: `
    <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
      <tr style="border-bottom: 1px solid #292524;">
        <td style="padding: 10px 0; color: #fafaf9; font-size: 13px;">1x Santal Royal Parfum (100ml)</td>
        <td style="padding: 10px 0; text-align: right; color: #d4af37; font-weight: 600; font-size: 13px;">₦110,000</td>
      </tr>
      <tr style="border-bottom: 1px solid #292524;">
        <td style="padding: 10px 0; color: #fafaf9; font-size: 13px;">1x Oud Wood Extrait (50ml)</td>
        <td style="padding: 10px 0; text-align: right; color: #d4af37; font-weight: 600; font-size: 13px;">₦75,000</td>
      </tr>
    </table>
  `,

  // Inventory & Alerts
  product_name: 'Santal Royal Parfum 100ml',
  sku: 'PS-SAN-100',
  current_stock: '3',
  threshold: '5',
  threshold_amount: '₦150,000',
  requested_amount: '₦185,000',
  registered_at: '01 Nov 2026, 08:15 AM',

  // Dates & Security
  date: 'November 1, 2026',
  time: '09:30 AM',
  date_time: '01 Nov 2026, 09:30 AM',
  device: 'Safari on macOS Sequoia',
  ip: '102.89.23.114',
  location: 'Ikoyi, Lagos, Nigeria',

  // URLs
  verification_url: 'https://philzsignature.com/verify-email?token=ps_sample_verify_882910',
  reset_url: 'https://philzsignature.com/reset-password?token=ps_reset_sample_99482',
  reset_password_url: 'https://philzsignature.com/forgot-password',
  shop_url: 'https://philzsignature.com/shop',
  old_email: 'previous.patron@example.com',
  new_email: 'alexander.vance@luxury.com',

  // Brand Essentials
  brand_name: 'PHILZ SIGNATURE',
  brand_tagline: 'YOUR SCENT. YOUR SIGNATURE.',
  support_email: 'concierge@philzsignature.com',
  app_url: 'https://philzsignature.com',
  year: '2026',
};

/**
 * Builds a complete sample dictionary guaranteed to resolve all variables in a template
 */
export function getRealisticSampleData(
  _templateKey?: string,
  variables: string[] = [],
  customSampleData?: Record<string, string>
): Record<string, string> {
  const merged: Record<string, string> = {
    ...COMPREHENSIVE_SAMPLE_DATA,
    ...(customSampleData || {}),
  };

  // For any variable in the template that is not in the dictionary, create an intelligent sample value
  variables.forEach((variableName) => {
    if (!merged[variableName]) {
      const humanized = variableName
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      if (variableName.includes('url') || variableName.includes('link')) {
        merged[variableName] = `https://philzsignature.com/${variableName.replace(/_/g, '-')}`;
      } else if (variableName.includes('amount') || variableName.includes('price')) {
        merged[variableName] = '₦185,000';
      } else if (variableName.includes('date')) {
        merged[variableName] = 'November 1, 2026';
      } else if (variableName.includes('time')) {
        merged[variableName] = '09:30 AM';
      } else {
        merged[variableName] = `[${humanized}]`;
      }
    }
  });

  return merged;
}
