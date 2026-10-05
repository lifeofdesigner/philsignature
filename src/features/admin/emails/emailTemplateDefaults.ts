export interface DefaultTemplateConfig {
  template_key: string;
  name: string;
  category: 'customer' | 'admin';
  description: string;
  subject: string;
  html_body: string;
  variables: string[];
  sampleData: Record<string, string>;
}

export const DEFAULT_EMAIL_TEMPLATES: DefaultTemplateConfig[] = [
  // ---------------------------------------------------------------------------
  // CUSTOMER EMAILS (1 - 14)
  // ---------------------------------------------------------------------------
  {
    template_key: 'welcome_verification',
    name: 'Welcome + Email Verification',
    category: 'customer',
    description: 'Sent upon patron account registration to verify email authenticity.',
    subject: 'Welcome to Philz Signature — Verify Your Email',
    variables: ['customer_name', 'verification_url'],
    sampleData: {
      customer_name: 'Lord Alexander Vance',
      verification_url: 'https://philzsignature.com/verify-email?token=ps_sample_verify_882910',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Private Membership</span>
  <h1 class="heading">Welcome to Philz Signature</h1>
  <p class="paragraph">Dear {{customer_name}}, thank you for stepping into the atelier of Philz Signature. Please verify your email to activate your client account.</p>
</div>
<div class="card">
  <p class="paragraph">For your security, unverified accounts expire after 24 hours. Click the button below to confirm your address and unlock your bespoke fragrance journey.</p>
  <div class="button-container">
    <a href="{{verification_url}}" class="btn-gold">Verify Account</a>
  </div>
  <p style="font-size: 11px; color: #78716c; text-align: center; margin-top: 12px;">Link expires in 24 hours.</p>
</div>`,
  },
  {
    template_key: 'email_verified_confirmation',
    name: 'Email Verified Confirmation',
    category: 'customer',
    description: 'Confirmation dispatched once the patron successfully verifies their email.',
    subject: 'Account Activated — Philz Signature',
    variables: ['customer_name', 'shop_url'],
    sampleData: {
      customer_name: 'Lady Genevieve Sterling',
      shop_url: 'https://philzsignature.com/shop',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Verified</span>
  <h1 class="heading">Your Account is Active</h1>
  <p class="paragraph">Dear {{customer_name}}, your email address has been successfully verified. You now enjoy full privileges to curate your private collection.</p>
</div>
<div class="button-container">
  <a href="{{shop_url}}" class="btn-gold">Explore The Collection</a>
</div>`,
  },
  {
    template_key: 'new_login_alert',
    name: 'New Login Alert',
    category: 'customer',
    description: 'Security notification for sign-ins from unrecognized devices or IP addresses.',
    subject: 'Security Alert: New Sign-In to Philz Signature',
    variables: ['date', 'time', 'device', 'ip', 'location', 'reset_password_url'],
    sampleData: {
      date: 'October 5, 2026',
      time: '02:40 AM GMT+1',
      device: 'Safari on macOS Sonoma',
      ip: '102.89.23.114',
      location: 'Ikoyi, Lagos, Nigeria',
      reset_password_url: 'https://philzsignature.com/forgot-password',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="alert-pill">Security Notice</span>
  <h1 class="heading">New Sign-In Detected</h1>
  <p class="paragraph">We noticed a sign-in to your Philz Signature account from a new device or browser.</p>
</div>
<div class="card">
  <table class="info-table">
    <tr><td class="info-label">Date & Time</td><td class="info-value">{{date}} at {{time}}</td></tr>
    <tr><td class="info-label">Device / Browser</td><td class="info-value">{{device}}</td></tr>
    <tr><td class="info-label">IP Address</td><td class="info-value">{{ip}}</td></tr>
    <tr><td class="info-label">Location</td><td class="info-value">{{location}}</td></tr>
  </table>
</div>
<p class="paragraph">If this was you, no action is required. If you do not recognize this activity, please reset your password immediately or contact Concierge.</p>
<div class="button-container">
  <a href="{{reset_password_url}}" class="btn-gold">Secure Account</a>
</div>`,
  },
  {
    template_key: 'password_changed_alert',
    name: 'Password Changed Alert',
    category: 'customer',
    description: 'Sent when client account password is changed or updated.',
    subject: 'Security Notice: Your Password Has Been Changed',
    variables: ['date', 'time', 'ip'],
    sampleData: {
      date: 'October 5, 2026',
      time: '02:45 AM GMT+1',
      ip: '102.89.23.114',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Password Updated</span>
  <h1 class="heading">Password Changed Successfully</h1>
  <p class="paragraph">The password for your Philz Signature account was updated on {{date}} at {{time}} (IP: {{ip}}).</p>
</div>
<p class="paragraph">If you initiated this change, you may disregard this email. If you did not make this change, please contact Concierge immediately.</p>`,
  },
  {
    template_key: 'password_reset',
    name: 'Password Reset Instructions',
    category: 'customer',
    description: 'Recovery email containing single-use password reset token link.',
    subject: 'Password Reset Instructions — Philz Signature',
    variables: ['reset_url'],
    sampleData: {
      reset_url: 'https://philzsignature.com/reset-password?token=ps_reset_sample_99482',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Account Recovery</span>
  <h1 class="heading">Reset Your Password</h1>
  <p class="paragraph">We received a request to reset your Philz Signature password. Click below to establish a new password.</p>
</div>
<div class="button-container">
  <a href="{{reset_url}}" class="btn-gold">Reset Password</a>
</div>
<p class="paragraph" style="text-align: center; font-size: 11px;">This link is valid for 30 minutes and can only be used once. If you did not request this, you may safely ignore this email.</p>`,
  },
  {
    template_key: 'email_changed',
    name: 'Email Address Updated Notice',
    category: 'customer',
    description: 'Dispatched to both previous and new email addresses on account modification.',
    subject: 'Notice: Email Address Update on Philz Signature',
    variables: ['old_email', 'new_email', 'date'],
    sampleData: {
      old_email: 'alexander.former@domain.com',
      new_email: 'alexander.vance@luxury.com',
      date: 'October 5, 2026',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Account Profile</span>
  <h1 class="heading">Email Address Updated</h1>
  <p class="paragraph">Your registered email address was changed from <strong>{{old_email}}</strong> to <strong>{{new_email}}</strong> on {{date}}.</p>
</div>
<p class="paragraph">If you performed this change, no further action is necessary. If this update was unauthorized, contact our boutique immediately.</p>`,
  },
  {
    template_key: 'order_received',
    name: 'Order Received',
    category: 'customer',
    description: 'Initial order acknowledgement sent when checkout is completed.',
    subject: 'Order Received: #{{order_number}} — Philz Signature',
    variables: [
      'order_number',
      'items_table',
      'subtotal',
      'tax_row',
      'discount_row',
      'shipping_amount',
      'total_amount',
      'shipping_address_html',
      'track_order_url',
    ],
    sampleData: {
      order_number: 'PS-88492',
      items_table: `<tr>
  <td style="padding: 10px 0; border-bottom: 1px solid #292524;">
    <div style="color: #fafaf9; font-weight: 500;">Oud Royale Extrait de Parfum</div>
    <div style="color: #78716c; font-size: 11px;">Qty: 1 &bull; 100ml Pure Oil Flacon</div>
  </td>
  <td style="padding: 10px 0; border-bottom: 1px solid #292524; text-align: right; color: #fafaf9; font-weight: 500;">
    ₦185,000
  </td>
</tr>`,
      subtotal: '₦185,000',
      tax_row: '<tr><td class="info-label">Estimated Tax (7.5%)</td><td class="info-value">₦13,875</td></tr>',
      discount_row: '',
      shipping_amount: 'Complimentary',
      total_amount: '₦198,875',
      shipping_address_html: 'Lord Alexander Vance<br/>Plot 14 Victoria Island<br/>Lagos, Nigeria',
      track_order_url: 'https://philzsignature.com/track-order?orderNumber=PS-88492',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Order Received</span>
  <h1 class="heading">Thank You for Your Acquisition</h1>
  <p class="paragraph">Your order #{{order_number}} has been logged and is awaiting verification / processing.</p>
</div>
<div class="card">
  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #d4af37; margin-bottom: 12px; font-weight: 600;">Consignment Summary</div>
  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">{{items_table}}</table>
  <table class="info-table" style="margin-top: 16px;">
    <tr><td class="info-label">Subtotal</td><td class="info-value">{{subtotal}}</td></tr>
    {{tax_row}}
    {{discount_row}}
    <tr><td class="info-label">Delivery</td><td class="info-value">{{shipping_amount}}</td></tr>
    <tr><td class="info-label" style="font-weight: 700; color: #fafaf9;">Total</td><td class="info-value" style="font-weight: 700; color: #d4af37; font-size: 16px;">{{total_amount}}</td></tr>
  </table>
</div>
<div class="card">
  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #d4af37; margin-bottom: 12px; font-weight: 600;">Destination</div>
  <div style="font-size: 13px; color: #fafaf9; line-height: 1.6;">
    {{shipping_address_html}}
  </div>
</div>
<div class="button-container">
  <a href="{{track_order_url}}" class="btn-gold">Track Consignment</a>
</div>`,
  },
  {
    template_key: 'payment_confirmation',
    name: 'Payment Confirmed',
    category: 'customer',
    description: 'Sent when payment gateway or manual bank transfer is verified.',
    subject: 'Payment Confirmed — Philz Signature Order #{{order_number}}',
    variables: [
      'order_number',
      'gateway',
      'reference',
      'subtotal',
      'tax_row',
      'shipping_amount',
      'amount_paid',
      'receipt_url',
    ],
    sampleData: {
      order_number: 'PS-88492',
      gateway: 'PAYSTACK',
      reference: 'pstk_ref_99201938210',
      subtotal: '₦185,000',
      tax_row: '<tr><td class="info-label">Tax (7.5%)</td><td class="info-value">₦13,875</td></tr>',
      shipping_amount: 'Complimentary',
      amount_paid: '₦198,875',
      receipt_url: 'https://philzsignature.com/checkout/confirmation/PS-88492',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Payment Confirmed</span>
  <h1 class="heading">Payment Received with Thanks</h1>
  <p class="paragraph">We have successfully verified your payment via {{gateway}}. Your consignment is now locked in and queued for priority preparation.</p>
</div>
<div class="card">
  <table class="info-table">
    <tr><td class="info-label">Order Number</td><td class="info-value">{{order_number}}</td></tr>
    <tr><td class="info-label">Payment Gateway</td><td class="info-value">{{gateway}}</td></tr>
    <tr><td class="info-label">Payment Reference</td><td class="info-value" style="font-family: monospace; font-size: 12px;">{{reference}}</td></tr>
    <tr><td class="info-label">Subtotal</td><td class="info-value">{{subtotal}}</td></tr>
    {{tax_row}}
    <tr><td class="info-label">Delivery</td><td class="info-value">{{shipping_amount}}</td></tr>
    <tr><td class="info-label">Amount Paid</td><td class="info-value" style="color: #d4af37; font-weight: 700; font-size: 15px;">{{amount_paid}}</td></tr>
    <tr><td class="info-label">Status</td><td class="info-value" style="color: #10b981;">Verified &bull; Paid</td></tr>
  </table>
</div>
<div class="button-container">
  <a href="{{receipt_url}}" class="btn-gold">View Order Receipt</a>
</div>`,
  },
  {
    template_key: 'order_processing',
    name: 'Order Processing (Atelier)',
    category: 'customer',
    description: 'Notifies patron that custom bottling and quality inspection is in progress.',
    subject: 'Atelier In Progress: Order #{{order_number}} — Philz Signature',
    variables: ['order_number', 'subtotal', 'tax_row', 'shipping_amount', 'total_amount', 'track_order_url'],
    sampleData: {
      order_number: 'PS-88492',
      subtotal: '₦185,000',
      tax_row: '',
      shipping_amount: 'Complimentary',
      total_amount: '₦185,000',
      track_order_url: 'https://philzsignature.com/track-order?orderNumber=PS-88492',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Boutique Preparation</span>
  <h1 class="heading">Bottling & Inspection Underway</h1>
  <p class="paragraph">Our fragrance specialists are preparing and inspecting each item in consignment #{{order_number}} to ensure immaculate quality.</p>
</div>
<div class="card">
  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #d4af37; margin-bottom: 12px; font-weight: 600;">Consignment Summary</div>
  <table class="info-table">
    <tr><td class="info-label">Subtotal</td><td class="info-value">{{subtotal}}</td></tr>
    {{tax_row}}
    <tr><td class="info-label">Delivery</td><td class="info-value">{{shipping_amount}}</td></tr>
    <tr><td class="info-label" style="font-weight: 700; color: #fafaf9;">Total</td><td class="info-value" style="font-weight: 700; color: #d4af37;">{{total_amount}}</td></tr>
  </table>
  <p class="paragraph" style="margin-top: 14px; margin-bottom: 0;">Estimated dispatch within 24 to 48 business hours. You will receive dispatch tracking as soon as your courier departs.</p>
</div>
<div class="button-container">
  <a href="{{track_order_url}}" class="btn-gold">Track Live Progress</a>
</div>`,
  },
  {
    template_key: 'order_shipped',
    name: 'Order Shipped / Dispatched',
    category: 'customer',
    description: 'Dispatched when the consignment departs the atelier with tracking code.',
    subject: 'Consignment Dispatched: Order #{{order_number}} — Philz Signature',
    variables: ['order_number', 'courier', 'tracking_number', 'track_courier_url'],
    sampleData: {
      order_number: 'PS-88492',
      courier: 'DHL Express Prestige',
      tracking_number: 'DHL-NG-9920192',
      track_courier_url: 'https://philzsignature.com/track-order?orderNumber=PS-88492',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Dispatched</span>
  <h1 class="heading">Your Consignment is on Its Way</h1>
  <p class="paragraph">Consignment #{{order_number}} has left our boutique atelier and is in transit with {{courier}}.</p>
</div>
<div class="card">
  <table class="info-table">
    <tr><td class="info-label">Courier Partner</td><td class="info-value">{{courier}}</td></tr>
    <tr><td class="info-label">Tracking Number</td><td class="info-value" style="font-family: monospace;">{{tracking_number}}</td></tr>
    <tr><td class="info-label">Delivery Window</td><td class="info-value">1 - 3 Business Days</td></tr>
  </table>
</div>
<div class="button-container">
  <a href="{{track_courier_url}}" class="btn-gold">Track Courier</a>
</div>`,
  },
  {
    template_key: 'out_for_delivery',
    name: 'Out for Delivery',
    category: 'customer',
    description: 'Sent on the morning of delivery when courier is out for delivery.',
    subject: 'Arriving Today: Order #{{order_number}} — Philz Signature',
    variables: ['order_number', 'courier', 'estimated_time', 'track_order_url'],
    sampleData: {
      order_number: 'PS-88492',
      courier: 'Concierge Dispatch Vehicle',
      estimated_time: 'Today between 1:00 PM – 4:00 PM',
      track_order_url: 'https://philzsignature.com/track-order?orderNumber=PS-88492',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Out For Delivery</span>
  <h1 class="heading">Arriving Today</h1>
  <p class="paragraph">Your Philz Signature consignment #{{order_number}} is in the courier dispatch vehicle and will arrive today.</p>
</div>
<div class="card">
  <table class="info-table">
    <tr><td class="info-label">Courier</td><td class="info-value">{{courier}}</td></tr>
    <tr><td class="info-label">Estimated Delivery</td><td class="info-value">{{estimated_time}}</td></tr>
  </table>
</div>
<div class="button-container">
  <a href="{{track_order_url}}" class="btn-gold">Track Live Delivery</a>
</div>`,
  },
  {
    template_key: 'order_delivered',
    name: 'Order Delivered',
    category: 'customer',
    description: 'Delivery confirmation and invitation to leave an olfactory review.',
    subject: 'Consignment Delivered — Philz Signature #{{order_number}}',
    variables: ['order_number', 'review_url'],
    sampleData: {
      order_number: 'PS-88492',
      review_url: 'https://philzsignature.com/track-order?orderNumber=PS-88492#review',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Delivered</span>
  <h1 class="heading">Consignment Delivered</h1>
  <p class="paragraph">We have confirmation that order #{{order_number}} has been safely delivered. We hope you savor every drop of your handcrafted fragrance.</p>
</div>
<div class="card">
  <p class="paragraph" style="text-align: center;">How is your olfactory experience? Your review helps our perfumers uphold exacting standards.</p>
  <div class="button-container">
    <a href="{{review_url}}" class="btn-gold">Leave a Boutique Review</a>
  </div>
</div>`,
  },
  {
    template_key: 'order_cancelled',
    name: 'Order Cancelled',
    category: 'customer',
    description: 'Notification dispatched when an order is cancelled with cancellation reason.',
    subject: 'Order Cancelled: #{{order_number}} — Philz Signature',
    variables: ['order_number', 'reason', 'subtotal', 'tax_row', 'total_amount', 'support_email'],
    sampleData: {
      order_number: 'PS-88492',
      reason: 'Requested by client prior to atelier bottling',
      subtotal: '₦185,000',
      tax_row: '',
      total_amount: '₦185,000',
      support_email: 'concierge@philzsignature.com',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="alert-pill">Cancelled</span>
  <h1 class="heading">Order Cancellation Notice</h1>
  <p class="paragraph">Consignment #{{order_number}} has been cancelled.</p>
</div>
<div class="card">
  <table class="info-table">
    <tr><td class="info-label">Order Number</td><td class="info-value">{{order_number}}</td></tr>
    <tr><td class="info-label">Reason</td><td class="info-value">{{reason}}</td></tr>
    <tr><td class="info-label">Subtotal</td><td class="info-value">{{subtotal}}</td></tr>
    {{tax_row}}
    <tr><td class="info-label">Total Amount</td><td class="info-value">{{total_amount}}</td></tr>
  </table>
</div>
<p class="paragraph">If payment was already deducted, a full refund will be processed promptly. Contact Concierge at <a href="mailto:{{support_email}}">{{support_email}}</a> for assistance.</p>`,
  },
  {
    template_key: 'refund_processed',
    name: 'Refund Processed',
    category: 'customer',
    description: 'Dispatched when a refund has been issued to the client payment source.',
    subject: 'Refund Processed: #{{order_number}} — Philz Signature',
    variables: ['order_number', 'refund_amount', 'timeline', 'reference_row'],
    sampleData: {
      order_number: 'PS-88492',
      refund_amount: '₦185,000',
      timeline: '2 - 3 Business Days',
      reference_row: '<tr><td class="info-label">Reference</td><td class="info-value" style="font-family: monospace;">ref_rfnd_9928172</td></tr>',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Refund Complete</span>
  <h1 class="heading">Refund Issued</h1>
  <p class="paragraph">A refund has been initiated for consignment #{{order_number}}.</p>
</div>
<div class="card">
  <table class="info-table">
    <tr><td class="info-label">Refund Amount</td><td class="info-value" style="color: #d4af37; font-weight: 700;">{{refund_amount}}</td></tr>
    <tr><td class="info-label">Expected Settlement</td><td class="info-value">{{timeline}}</td></tr>
    {{reference_row}}
  </table>
</div>
<p class="paragraph">Depending on your financial institution, funds typically reflect in your account within 3 to 5 business days.</p>`,
  },

  // ---------------------------------------------------------------------------
  // ADMIN EMAILS (15 - 20)
  // ---------------------------------------------------------------------------
  {
    template_key: 'admin_new_order',
    name: '[Admin Alert] New Order Received',
    category: 'admin',
    description: 'Alert sent to administrators upon customer order placement.',
    subject: '[Admin Alert] New Order Received: #{{order_number}} ({{total_amount}})',
    variables: [
      'order_number',
      'customer_email',
      'subtotal',
      'tax_row',
      'shipping_amount',
      'total_amount',
      'items_count',
      'admin_orders_url',
    ],
    sampleData: {
      order_number: 'PS-88492',
      customer_email: 'alexander.vance@luxury.com',
      subtotal: '₦185,000',
      tax_row: '',
      shipping_amount: 'Complimentary',
      total_amount: '₦185,000',
      items_count: '2',
      admin_orders_url: 'https://philzsignature.com/admin/orders',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Admin Alert</span>
  <h1 class="heading">New Order Placed</h1>
  <p class="paragraph">A customer has completed an order on Philz Signature storefront.</p>
</div>
<div class="card">
  <table class="info-table">
    <tr><td class="info-label">Order Number</td><td class="info-value">{{order_number}}</td></tr>
    <tr><td class="info-label">Customer Email</td><td class="info-value">{{customer_email}}</td></tr>
    <tr><td class="info-label">Subtotal</td><td class="info-value">{{subtotal}}</td></tr>
    {{tax_row}}
    <tr><td class="info-label">Delivery</td><td class="info-value">{{shipping_amount}}</td></tr>
    <tr><td class="info-label">Order Total</td><td class="info-value" style="color: #d4af37; font-weight: 700;">{{total_amount}}</td></tr>
    <tr><td class="info-label">Items Count</td><td class="info-value">{{items_count}}</td></tr>
  </table>
</div>
<div class="button-container">
  <a href="{{admin_orders_url}}" class="btn-gold">Open Admin Dashboard</a>
</div>`,
  },
  {
    template_key: 'admin_high_value_order',
    name: '[Admin Alert] High-Value Order',
    category: 'admin',
    description: 'Priority alert sent when an order total exceeds high-value threshold (₦250k).',
    subject: '[HIGH VALUE] Order #{{order_number}} Exceeds {{threshold_amount}}',
    variables: [
      'order_number',
      'customer_email',
      'subtotal',
      'tax_row',
      'total_amount',
      'threshold_amount',
      'admin_orders_url',
    ],
    sampleData: {
      order_number: 'PS-88500',
      customer_email: 'concierge.vip@royalty.com',
      subtotal: '₦450,000',
      tax_row: '',
      total_amount: '₦450,000',
      threshold_amount: '₦250,000',
      admin_orders_url: 'https://philzsignature.com/admin/orders',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="alert-pill">High-Value Order</span>
  <h1 class="heading">Priority Consignment Alert</h1>
  <p class="paragraph">An order exceeding your high-value threshold of {{threshold_amount}} was recorded.</p>
</div>
<div class="card">
  <table class="info-table">
    <tr><td class="info-label">Order Number</td><td class="info-value">{{order_number}}</td></tr>
    <tr><td class="info-label">Customer Email</td><td class="info-value">{{customer_email}}</td></tr>
    <tr><td class="info-label">Subtotal</td><td class="info-value">{{subtotal}}</td></tr>
    {{tax_row}}
    <tr><td class="info-label">Order Amount</td><td class="info-value" style="color: #d4af37; font-weight: 700; font-size: 16px;">{{total_amount}}</td></tr>
  </table>
</div>
<div class="button-container">
  <a href="{{admin_orders_url}}" class="btn-gold">Review High-Value Order</a>
</div>`,
  },
  {
    template_key: 'admin_failed_payment',
    name: '[Admin Alert] Failed Payment',
    category: 'admin',
    description: 'Alert triggered when gateway reports a failed or rejected transaction.',
    subject: '[Alert] Payment Failed: #{{order_number}} via {{gateway}}',
    variables: ['order_number', 'customer_email', 'amount', 'gateway', 'reason'],
    sampleData: {
      order_number: 'PS-88492',
      customer_email: 'alexander.vance@luxury.com',
      amount: '₦185,000',
      gateway: 'PAYSTACK',
      reason: 'Insufficient funds on debit card',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="alert-pill">Payment Failed</span>
  <h1 class="heading">Gateway Payment Failure</h1>
  <p class="paragraph">A customer encountered a payment failure during checkout.</p>
</div>
<div class="card">
  <table class="info-table">
    <tr><td class="info-label">Order Number</td><td class="info-value">{{order_number}}</td></tr>
    <tr><td class="info-label">Customer Email</td><td class="info-value">{{customer_email}}</td></tr>
    <tr><td class="info-label">Amount</td><td class="info-value">{{amount}}</td></tr>
    <tr><td class="info-label">Gateway</td><td class="info-value">{{gateway}}</td></tr>
    <tr><td class="info-label">Failure Reason</td><td class="info-value" style="color: #f87171;">{{reason}}</td></tr>
  </table>
</div>`,
  },
  {
    template_key: 'admin_refund_requested',
    name: '[Admin Alert] Refund Requested',
    category: 'admin',
    description: 'Action required notice when a patron submits a refund or return claim.',
    subject: '[Action Required] Refund Requested for Order #{{order_number}}',
    variables: ['order_number', 'customer_email', 'requested_amount', 'reason', 'admin_orders_url'],
    sampleData: {
      order_number: 'PS-88492',
      customer_email: 'alexander.vance@luxury.com',
      requested_amount: '₦185,000',
      reason: 'Order placed by mistake / wrong address entered',
      admin_orders_url: 'https://philzsignature.com/admin/orders',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="alert-pill">Refund Requested</span>
  <h1 class="heading">Customer Refund Request</h1>
  <p class="paragraph">A refund request requires administrative review.</p>
</div>
<div class="card">
  <table class="info-table">
    <tr><td class="info-label">Order Number</td><td class="info-value">{{order_number}}</td></tr>
    <tr><td class="info-label">Customer</td><td class="info-value">{{customer_email}}</td></tr>
    <tr><td class="info-label">Requested Amount</td><td class="info-value">{{requested_amount}}</td></tr>
    <tr><td class="info-label">Reason Stated</td><td class="info-value">{{reason}}</td></tr>
  </table>
</div>
<div class="button-container">
  <a href="{{admin_orders_url}}" class="btn-gold">Process In Admin</a>
</div>`,
  },
  {
    template_key: 'admin_new_customer',
    name: '[Admin Alert] New Customer Registered',
    category: 'admin',
    description: 'Client registry notification when a new patron registers on the storefront.',
    subject: '[Client Registry] New Customer Registered: {{customer_email}}',
    variables: ['customer_email', 'customer_name', 'registered_at', 'admin_customers_url'],
    sampleData: {
      customer_email: 'valeria.sterling@atelier.com',
      customer_name: 'Valeria Sterling',
      registered_at: 'October 5, 2026, 02:30 AM',
      admin_customers_url: 'https://philzsignature.com/admin/customers',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Client Registry</span>
  <h1 class="heading">New Patron Registered</h1>
  <p class="paragraph">A new client account was created on Philz Signature.</p>
</div>
<div class="card">
  <table class="info-table">
    <tr><td class="info-label">Email</td><td class="info-value">{{customer_email}}</td></tr>
    <tr><td class="info-label">Name</td><td class="info-value">{{customer_name}}</td></tr>
    <tr><td class="info-label">Registered At</td><td class="info-value">{{registered_at}}</td></tr>
  </table>
</div>
<div class="button-container">
  <a href="{{admin_customers_url}}" class="btn-gold">View Customers</a>
</div>`,
  },
  {
    template_key: 'admin_low_inventory',
    name: '[Admin Alert] Low Inventory',
    category: 'admin',
    description: 'Inventory warning dispatched when item stock dips below minimum threshold.',
    subject: '[INVENTORY ALERT] Low Stock: {{product_name}} ({{current_stock}} left)',
    variables: ['product_name', 'sku', 'current_stock', 'threshold', 'admin_products_url'],
    sampleData: {
      product_name: 'Imperial Oud Candle (100% Soy)',
      sku: 'CAN-OUD-IMP-01',
      current_stock: '3',
      threshold: '5',
      admin_products_url: 'https://philzsignature.com/admin/products',
    },
    html_body: `<div style="text-align: center; margin-bottom: 24px;">
  <span class="alert-pill">Stock Warning</span>
  <h1 class="heading">Low Fragrance Inventory</h1>
  <p class="paragraph">An atelier product has dipped below the configured replenishment threshold.</p>
</div>
<div class="card">
  <table class="info-table">
    <tr><td class="info-label">Product Name</td><td class="info-value">{{product_name}}</td></tr>
    <tr><td class="info-label">SKU</td><td class="info-value" style="font-family: monospace;">{{sku}}</td></tr>
    <tr><td class="info-label">Current Stock</td><td class="info-value" style="color: #f87171; font-weight: 700;">{{current_stock}} units</td></tr>
    <tr><td class="info-label">Threshold</td><td class="info-value">{{threshold}} units</td></tr>
  </table>
</div>
<div class="button-container">
  <a href="{{admin_products_url}}" class="btn-gold">Update Stock in Admin</a>
</div>`,
  },
];

export const BRAND_NAME = 'Philz Signature';
export const BRAND_TAGLINE = 'Haute Parfumerie & Pure Luxury';
export const SUPPORT_EMAIL = 'concierge@philzsignature.com';

/**
 * Builds the complete luxury HTML wrapper around email body content
 */
export function wrapInLuxuryEmailTemplate(title: string, contentHtml: string): string {
  if (contentHtml.includes('<!DOCTYPE') || contentHtml.includes('<html')) {
    return contentHtml;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0c0a09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f5f5f4; }
    .container { max-width: 600px; margin: 0 auto; background-color: #171717; border: 1px solid #292524; }
    .header { padding: 36px 24px; text-align: center; border-bottom: 1px solid #292524; background: linear-gradient(180deg, #1f1d1b 0%, #171717 100%); }
    .brand-title { font-size: 22px; font-weight: 600; letter-spacing: 4px; text-transform: uppercase; color: #d4af37; margin: 0; }
    .brand-sub { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a8a29e; margin-top: 6px; }
    .content { padding: 32px 28px; }
    .card { background-color: #1c1917; border: 1px solid #292524; border-radius: 4px; padding: 20px; margin-bottom: 24px; }
    .gold-pill { display: inline-block; background-color: rgba(212, 175, 55, 0.12); border: 1px solid rgba(212, 175, 55, 0.4); color: #d4af37; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 10px; border-radius: 2px; font-weight: 600; }
    .alert-pill { display: inline-block; background-color: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 10px; border-radius: 2px; font-weight: 600; }
    .heading { font-size: 20px; font-weight: 400; color: #fafaf9; margin-top: 14px; margin-bottom: 8px; }
    .paragraph { font-size: 13px; line-height: 1.6; color: #a8a29e; margin-bottom: 18px; }
    .info-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .info-table td { padding: 10px 0; border-bottom: 1px solid #292524; font-size: 13px; }
    .info-label { color: #a8a29e; }
    .info-value { color: #fafaf9; text-align: right; font-weight: 500; }
    .button-container { text-align: center; margin: 30px 0; }
    .btn-gold { display: inline-block; background: #d4af37; color: #0a0a0a !important; text-decoration: none; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; padding: 14px 32px; border-radius: 2px; }
    .footer { padding: 24px; text-align: center; font-size: 11px; color: #78716c; border-top: 1px solid #292524; background-color: #121212; }
    .footer a { color: #d4af37; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-title">${BRAND_NAME}</div>
      <div class="brand-sub">${BRAND_TAGLINE}</div>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;">PHILZ SIGNATURE HAUTE PARFUMS &bull; LUXURY REDEFINED</p>
      <p style="margin: 0 0 8px 0;">Need concierge assistance? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      <p style="margin: 0 0 8px 0; font-size: 10px; color: #57534e;">This is an essential account/order notification.</p>
      <p style="margin: 0; font-size: 10px; color: #57534e;">&copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Replaces placeholders with provided data and applies outer wrapper
 */
export function renderEmailPreview(
  htmlBody: string,
  subject: string,
  variablesData: Record<string, string>
): { renderedSubject: string; renderedHtml: string } {
  let renderedSubject = subject;
  let renderedBody = htmlBody;

  Object.entries(variablesData).forEach(([key, val]) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'g');
    renderedSubject = renderedSubject.replace(regex, val);
    renderedBody = renderedBody.replace(regex, val);
  });

  return {
    renderedSubject,
    renderedHtml: wrapInLuxuryEmailTemplate(renderedSubject, renderedBody),
  };
}
