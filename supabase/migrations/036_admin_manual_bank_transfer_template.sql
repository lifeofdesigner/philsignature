-- ==============================================================================
-- PHILZ SIGNATURE — 036_admin_manual_bank_transfer_template.sql
-- Seed template for Admin Manual Bank Transfer Order Awaiting Verification Alert
-- ==============================================================================

INSERT INTO public.email_templates (template_key, name, subject, html_body, variables, is_active)
VALUES (
    'admin_manual_order',
    '[Admin Alert] Manual Transfer Awaiting Verification',
    '[Action Required] New Manual Transfer Order #{{order_number}} Awaiting Verification',
    '<div style="text-align: center; margin-bottom: 24px;">
  <span class="gold-pill">Awaiting Payment Verification</span>
  <h1 class="heading">New Manual Transfer Order</h1>
  <p class="paragraph">A customer has placed an order via Manual Bank Transfer. Please confirm that the funds have cleared into the boutique bank account before marking this consignment as paid.</p>
</div>
<div class="card">
  <table class="info-table">
    <tr><td class="info-label">Order Number</td><td class="info-value">#{{order_number}}</td></tr>
    <tr><td class="info-label">Customer Name</td><td class="info-value">{{customer_name}}</td></tr>
    <tr><td class="info-label">Customer Email</td><td class="info-value">{{customer_email}}</td></tr>
    <tr><td class="info-label">Order Total</td><td class="info-value" style="color: #d4af37; font-weight: 700; font-size: 15px;">{{total_amount}}</td></tr>
    <tr><td class="info-label">Payment Method</td><td class="info-value">{{payment_method}}</td></tr>
    <tr><td class="info-label">Date & Time</td><td class="info-value">{{date_time}}</td></tr>
  </table>
</div>
<div class="button-container">
  <a href="{{admin_order_url}}" class="btn-gold">Review & Verify in Admin CMS</a>
</div>',
    '["order_number", "customer_name", "customer_email", "payment_method", "date_time", "total_amount", "admin_order_url"]'::jsonb,
    true
)
ON CONFLICT (template_key) DO UPDATE SET
    name = EXCLUDED.name,
    subject = EXCLUDED.subject,
    variables = EXCLUDED.variables;
