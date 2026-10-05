-- ==============================================================================
-- PHILZ SIGNATURE — 029_email_templates.sql
-- Transactional Email Template Management Table, Seeds, and RLS Policies
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Index on template_key for ultra-fast lookup at send time
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON public.email_templates(template_key);

-- Trigger for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_email_templates_updated_at ON public.email_templates;
CREATE TRIGGER trigger_update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION update_email_templates_updated_at();

-- Enable Row Level Security
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Drop previous policies if any exist
DROP POLICY IF EXISTS "Allow admin and super_admin read access to email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow admin and super_admin write access to email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow admin and super_admin select on email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow admin and super_admin update on email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow super_admin insert on email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "Allow super_admin delete on email_templates" ON public.email_templates;

-- SELECT: super_admin and admin (and administrator)
CREATE POLICY "Allow admin and super_admin select on email_templates"
ON public.email_templates
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin', 'administrator')
        AND is_active = true
    )
);

-- UPDATE: super_admin and admin (and administrator)
CREATE POLICY "Allow admin and super_admin update on email_templates"
ON public.email_templates
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin', 'administrator')
        AND is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role IN ('super_admin', 'admin', 'administrator')
        AND is_active = true
    )
);

-- INSERT: super_admin only
CREATE POLICY "Allow super_admin insert on email_templates"
ON public.email_templates
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'super_admin'
        AND is_active = true
    )
);

-- DELETE: super_admin only
CREATE POLICY "Allow super_admin delete on email_templates"
ON public.email_templates
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
        AND role = 'super_admin'
        AND is_active = true
    )
);

-- ==============================================================================
-- SEED DEFAULT 20 TEMPLATES (14 CUSTOMER + 6 ADMIN)
-- ==============================================================================

INSERT INTO public.email_templates (template_key, name, subject, html_body, variables, is_active)
VALUES
-- 1. Welcome + Verification
(
    'welcome_verification',
    'Welcome + Email Verification',
    'Welcome to Philz Signature — Verify Your Email',
    '<div style="text-align: center; margin-bottom: 24px;">
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
</div>',
    '["customer_name", "verification_url"]'::jsonb,
    true
),

-- 2. Email Verified Confirmation
(
    'email_verified_confirmation',
    'Email Verified Confirmation',
    'Account Activated — Philz Signature',
    '<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Verified</span>
  <h1 class="heading">Your Account is Active</h1>
  <p class="paragraph">Dear {{customer_name}}, your email address has been successfully verified. You now enjoy full privileges to curate your private collection.</p>
</div>
<div class="button-container">
  <a href="{{shop_url}}" class="btn-gold">Explore The Collection</a>
</div>',
    '["customer_name", "shop_url"]'::jsonb,
    true
),

-- 3. New Login Alert
(
    'new_login_alert',
    'New Login Alert',
    'Security Alert: New Sign-In to Philz Signature',
    '<div style="text-align: center; margin-bottom: 24px;">
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
</div>',
    '["date", "time", "device", "ip", "location", "reset_password_url"]'::jsonb,
    true
),

-- 4. Password Changed Alert
(
    'password_changed_alert',
    'Password Changed Alert',
    'Security Notice: Your Password Has Been Changed',
    '<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Password Updated</span>
  <h1 class="heading">Password Changed Successfully</h1>
  <p class="paragraph">The password for your Philz Signature account was updated on {{date}} at {{time}} (IP: {{ip}}).</p>
</div>
<p class="paragraph">If you initiated this change, you may disregard this email. If you did not make this change, please contact Concierge immediately.</p>',
    '["date", "time", "ip"]'::jsonb,
    true
),

-- 5. Password Reset Instructions
(
    'password_reset',
    'Password Reset Instructions',
    'Password Reset Instructions — Philz Signature',
    '<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Account Recovery</span>
  <h1 class="heading">Reset Your Password</h1>
  <p class="paragraph">We received a request to reset your Philz Signature password. Click below to establish a new password.</p>
</div>
<div class="button-container">
  <a href="{{reset_url}}" class="btn-gold">Reset Password</a>
</div>
<p class="paragraph" style="text-align: center; font-size: 11px;">This link is valid for 30 minutes and can only be used once. If you did not request this, you may safely ignore this email.</p>',
    '["reset_url"]'::jsonb,
    true
),

-- 6. Email Address Updated
(
    'email_changed',
    'Email Address Updated Notice',
    'Notice: Email Address Update on Philz Signature',
    '<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Account Profile</span>
  <h1 class="heading">Email Address Updated</h1>
  <p class="paragraph">Your registered email address was changed from <strong>{{old_email}}</strong> to <strong>{{new_email}}</strong> on {{date}}.</p>
</div>
<p class="paragraph">If you performed this change, no further action is necessary. If this update was unauthorized, contact our boutique immediately.</p>',
    '["old_email", "new_email", "date"]'::jsonb,
    true
),

-- 7. Order Received
(
    'order_received',
    'Order Received',
    'Order Received: #{{order_number}} — Philz Signature',
    '<div style="text-align: center; margin-bottom: 24px;">
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
</div>',
    '["order_number", "items_table", "subtotal", "tax_row", "discount_row", "shipping_amount", "total_amount", "shipping_address_html", "track_order_url"]'::jsonb,
    true
),

-- 8. Payment Confirmed
(
    'payment_confirmation',
    'Payment Confirmed',
    'Payment Confirmed — Philz Signature Order #{{order_number}}',
    '<div style="text-align: center; margin-bottom: 24px;">
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
</div>',
    '["order_number", "gateway", "reference", "subtotal", "tax_row", "shipping_amount", "amount_paid", "receipt_url"]'::jsonb,
    true
),

-- 9. Order Processing
(
    'order_processing',
    'Order Processing (Atelier)',
    'Atelier In Progress: Order #{{order_number}} — Philz Signature',
    '<div style="text-align: center; margin-bottom: 24px;">
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
</div>',
    '["order_number", "subtotal", "tax_row", "shipping_amount", "total_amount", "track_order_url"]'::jsonb,
    true
),

-- 10. Order Shipped
(
    'order_shipped',
    'Order Shipped / Dispatched',
    'Consignment Dispatched: Order #{{order_number}} — Philz Signature',
    '<div style="text-align: center; margin-bottom: 24px;">
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
</div>',
    '["order_number", "courier", "tracking_number", "track_courier_url"]'::jsonb,
    true
),

-- 11. Out for Delivery
(
    'out_for_delivery',
    'Out for Delivery',
    'Arriving Today: Order #{{order_number}} — Philz Signature',
    '<div style="text-align: center; margin-bottom: 24px;">
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
</div>',
    '["order_number", "courier", "estimated_time", "track_order_url"]'::jsonb,
    true
),

-- 12. Order Delivered
(
    'order_delivered',
    'Order Delivered',
    'Consignment Delivered — Philz Signature #{{order_number}}',
    '<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Delivered</span>
  <h1 class="heading">Consignment Delivered</h1>
  <p class="paragraph">We have confirmation that order #{{order_number}} has been safely delivered. We hope you savor every drop of your handcrafted fragrance.</p>
</div>
<div class="card">
  <p class="paragraph" style="text-align: center;">How is your olfactory experience? Your review helps our perfumers uphold exacting standards.</p>
  <div class="button-container">
    <a href="{{review_url}}" class="btn-gold">Leave a Boutique Review</a>
  </div>
</div>',
    '["order_number", "review_url"]'::jsonb,
    true
),

-- 13. Order Cancelled
(
    'order_cancelled',
    'Order Cancelled',
    'Order Cancelled: #{{order_number}} — Philz Signature',
    '<div style="text-align: center; margin-bottom: 24px;">
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
<p class="paragraph">If payment was already deducted, a full refund will be processed promptly. Contact Concierge at <a href="mailto:{{support_email}}">{{support_email}}</a> for assistance.</p>',
    '["order_number", "reason", "subtotal", "tax_row", "total_amount", "support_email"]'::jsonb,
    true
),

-- 14. Refund Processed
(
    'refund_processed',
    'Refund Processed',
    'Refund Processed: #{{order_number}} — Philz Signature',
    '<div style="text-align: center; margin-bottom: 24px;">
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
<p class="paragraph">Depending on your financial institution, funds typically reflect in your account within 3 to 5 business days.</p>',
    '["order_number", "refund_amount", "timeline", "reference_row"]'::jsonb,
    true
),

-- 15. Admin New Order
(
    'admin_new_order',
    '[Admin Alert] New Order Received',
    '[Admin Alert] New Order Received: #{{order_number}} ({{total_amount}})',
    '<div style="text-align: center; margin-bottom: 24px;">
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
</div>',
    '["order_number", "customer_email", "subtotal", "tax_row", "shipping_amount", "total_amount", "items_count", "admin_orders_url"]'::jsonb,
    true
),

-- 16. Admin High-Value Order
(
    'admin_high_value_order',
    '[Admin Alert] High-Value Order',
    '[HIGH VALUE] Order #{{order_number}} Exceeds {{threshold_amount}}',
    '<div style="text-align: center; margin-bottom: 24px;">
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
</div>',
    '["order_number", "customer_email", "subtotal", "tax_row", "total_amount", "threshold_amount", "admin_orders_url"]'::jsonb,
    true
),

-- 17. Admin Failed Payment
(
    'admin_failed_payment',
    '[Admin Alert] Failed Payment',
    '[Alert] Payment Failed: #{{order_number}} via {{gateway}}',
    '<div style="text-align: center; margin-bottom: 24px;">
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
</div>',
    '["order_number", "customer_email", "amount", "gateway", "reason"]'::jsonb,
    true
),

-- 18. Admin Refund Requested
(
    'admin_refund_requested',
    '[Admin Alert] Refund Requested',
    '[Action Required] Refund Requested for Order #{{order_number}}',
    '<div style="text-align: center; margin-bottom: 24px;">
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
</div>',
    '["order_number", "customer_email", "requested_amount", "reason", "admin_orders_url"]'::jsonb,
    true
),

-- 19. Admin New Customer Registered
(
    'admin_new_customer',
    '[Admin Alert] New Customer Registered',
    '[Client Registry] New Customer Registered: {{customer_email}}',
    '<div style="text-align: center; margin-bottom: 24px;">
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
</div>',
    '["customer_email", "customer_name", "registered_at", "admin_customers_url"]'::jsonb,
    true
),

-- 20. Admin Low Inventory Alert
(
    'admin_low_inventory',
    '[Admin Alert] Low Inventory',
    '[INVENTORY ALERT] Low Stock: {{product_name}} ({{current_stock}} left)',
    '<div style="text-align: center; margin-bottom: 24px;">
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
</div>',
    '["product_name", "sku", "current_stock", "threshold", "admin_products_url"]'::jsonb,
    true
)
ON CONFLICT (template_key) DO NOTHING;
