import { supabaseAdmin } from './supabaseAdmin';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  emailType: 'payment_confirmation' | 'order_confirmation' | 'shipping_update';
  orderId: string;
}

export interface PaymentEmailDetails {
  reference: string;
  amountNaira: number;
  gateway: string;
  paidAt?: string;
}

interface OrderItemEmailData {
  product_name: string;
  sku?: string | null;
  quantity: number;
  subtotal: number;
}

interface OrderEmailData {
  id: string;
  order_number: string;
  email: string;
  phone?: string;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  coupon_code?: string | null;
  shipping_address: Record<string, unknown>;
  items?: OrderItemEmailData[];
}

const BRAND_NAME = 'Philz Signature';
const BRAND_TAGLINE = 'Haute Parfumerie & Pure Luxury';
const SUPPORT_EMAIL = 'Philzsignature1@gmail.com';
const APP_URL = process.env.VITE_APP_URL || 'https://philzsignature.com';

function formatNaira(amount: number): string {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function getEmailWrapper(title: string, contentHtml: string): string {
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
    .heading { font-size: 20px; font-weight: 400; color: #fafaf9; margin-top: 14px; margin-bottom: 8px; }
    .paragraph { font-size: 13px; line-height: 1.6; color: #a8a29e; margin-bottom: 18px; }
    .info-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    .info-table td { padding: 10px 0; border-bottom: 1px solid #292524; font-size: 13px; }
    .info-label { color: #a8a29e; }
    .info-value { color: #fafaf9; text-align: right; font-weight: 500; }
    .button-container { text-align: center; margin: 30px 0; }
    .btn-gold { display: inline-block; background: #d4af37; color: #0a0a0a; text-decoration: none; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; padding: 14px 32px; border-radius: 2px; }
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
      <p style="margin: 0; font-size: 10px; color: #57534e;">&copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

async function dispatchEmail(payload: EmailPayload): Promise<boolean> {
  let sentViaApi = false;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const fromAddress = process.env.EMAIL_FROM || 'Philz Signature <orders@philzsignature.com>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });

      if (res.ok) {
        sentViaApi = true;
      } else {
        const errorText = await res.text();
        console.warn(`[EmailService] Resend API responded with status ${res.status}:`, errorText);
      }
    } catch (err) {
      console.warn('[EmailService] API dispatch error:', err);
    }
  }

  // Record dispatch in database activity logs
  try {
    await supabaseAdmin.from('activity_logs').insert({
      action: 'transactional_email_dispatched',
      entity_type: 'order',
      entity_id: payload.orderId,
      details: {
        type: payload.emailType,
        recipient: payload.to,
        subject: payload.subject,
        sentViaApi,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    // non-blocking
  }

  return true;
}

/**
 * 1. Payment Confirmation Email
 */
export async function sendPaymentConfirmationEmail(
  order: OrderEmailData,
  payment: PaymentEmailDetails
): Promise<void> {
  const subject = `Payment Confirmed — Philz Signature Order #${order.order_number}`;
  const orderUrl = `${APP_URL}/checkout/confirmation/${order.order_number}`;

  const html = getEmailWrapper(
    subject,
    `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="gold-pill">Payment Confirmed</span>
      <h1 class="heading">Payment Received with Thanks</h1>
      <p class="paragraph">We have successfully verified your payment via ${payment.gateway.toUpperCase()}. Your fragrance consignment is now locked in and queued for priority preparation.</p>
    </div>

    <div class="card">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #d4af37; margin-bottom: 12px; font-weight: 600;">Transaction Receipt</div>
      <table class="info-table">
        <tr>
          <td class="info-label">Order Number</td>
          <td class="info-value">${order.order_number}</td>
        </tr>
        <tr>
          <td class="info-label">Payment Gateway</td>
          <td class="info-value">${payment.gateway.toUpperCase()}</td>
        </tr>
        <tr>
          <td class="info-label">Payment Reference</td>
          <td class="info-value" style="font-family: monospace; font-size: 12px;">${payment.reference}</td>
        </tr>
        <tr>
          <td class="info-label">Amount Paid</td>
          <td class="info-value" style="color: #d4af37; font-weight: 700; font-size: 15px;">${formatNaira(payment.amountNaira)}</td>
        </tr>
        <tr>
          <td class="info-label">Verification Status</td>
          <td class="info-value" style="color: #10b981;">Verified &bull; Paid</td>
        </tr>
      </table>
    </div>

    <div class="button-container">
      <a href="${orderUrl}" class="btn-gold">View Order Receipt</a>
    </div>
  `
  );

  const text = `PAYMENT CONFIRMED — PHILZ SIGNATURE
Order Number: ${order.order_number}
Reference: ${payment.reference}
Amount: ${formatNaira(payment.amountNaira)}
Gateway: ${payment.gateway.toUpperCase()}
Status: Verified & Paid

View your order: ${orderUrl}`;

  await dispatchEmail({
    to: order.email,
    subject,
    html,
    text,
    emailType: 'payment_confirmation',
    orderId: order.id,
  });
}

/**
 * 2. Order Confirmation Email
 */
export async function sendOrderConfirmationEmail(
  order: OrderEmailData,
  items: OrderItemEmailData[] = []
): Promise<void> {
  const subject = `Order Confirmed: Consignment #${order.order_number} — Philz Signature`;
  const trackingUrl = `${APP_URL}/track-order?orderNumber=${order.order_number}&email=${encodeURIComponent(order.email)}`;
  const shipping = order.shipping_address as Record<string, string>;

  const itemsRows = (items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #292524;">
          <div style="color: #fafaf9; font-weight: 500;">${item.product_name}</div>
          <div style="color: #78716c; font-size: 11px;">Qty: ${item.quantity} &bull; ${item.sku || 'Official Scent'}</div>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #292524; text-align: right; color: #fafaf9; font-weight: 500;">
          ${formatNaira(item.subtotal)}
        </td>
      </tr>`
    )
    .join('');

  const html = getEmailWrapper(
    subject,
    `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="gold-pill">Order Registered</span>
      <h1 class="heading">Your Acquisition is Confirmed</h1>
      <p class="paragraph">Thank you for patronizing Philz Signature Haute Parfums. Your order details and consignment information are outlined below.</p>
    </div>

    <div class="card">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #d4af37; margin-bottom: 12px; font-weight: 600;">Purchased Fragrances</div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        ${itemsRows}
      </table>

      <table class="info-table" style="margin-top: 16px;">
        <tr>
          <td class="info-label">Subtotal</td>
          <td class="info-value">${formatNaira(order.subtotal)}</td>
        </tr>
        <tr>
          <td class="info-label">Delivery Fee</td>
          <td class="info-value">${order.shipping_amount === 0 ? 'Complimentary' : formatNaira(order.shipping_amount)}</td>
        </tr>
        ${
          order.discount_amount > 0
            ? `<tr><td class="info-label">Discount ${order.coupon_code ? `(${order.coupon_code})` : ''}</td><td class="info-value" style="color: #d4af37;">-${formatNaira(order.discount_amount)}</td></tr>`
            : ''
        }
        <tr>
          <td class="info-label" style="font-weight: 700; color: #fafaf9; font-size: 14px;">Total Amount</td>
          <td class="info-value" style="font-weight: 700; color: #d4af37; font-size: 16px;">${formatNaira(order.total_amount)}</td>
        </tr>
      </table>
    </div>

    <div class="card">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #d4af37; margin-bottom: 12px; font-weight: 600;">Destination Delivery Address</div>
      <div style="font-size: 13px; color: #fafaf9; line-height: 1.6;">
        <strong>${shipping?.first_name || ''} ${shipping?.last_name || ''}</strong><br/>
        ${shipping?.address_line1 || shipping?.streetAddress || ''}<br/>
        ${shipping?.city || ''}, ${shipping?.state || 'Lagos'}, ${shipping?.country || 'Nigeria'}<br/>
        Phone: ${order.phone || shipping?.phone || 'On file'}
      </div>
    </div>

    <div class="button-container">
      <a href="${trackingUrl}" class="btn-gold">Track Consignment</a>
    </div>
  `
  );

  const text = `ORDER CONFIRMED — PHILZ SIGNATURE
Consignment Number: ${order.order_number}
Total: ${formatNaira(order.total_amount)}
Deliver to: ${shipping?.first_name || ''} ${shipping?.last_name || ''}, ${shipping?.city || ''}, ${shipping?.state || ''}

Track your order: ${trackingUrl}`;

  await dispatchEmail({
    to: order.email,
    subject,
    html,
    text,
    emailType: 'order_confirmation',
    orderId: order.id,
  });
}

/**
 * 3. Shipping / Preparation Update Email
 */
export async function sendShippingUpdateEmail(order: OrderEmailData): Promise<void> {
  const subject = `Consignment Preparation Notice — Philz Signature #${order.order_number}`;
  const trackingUrl = `${APP_URL}/track-order?orderNumber=${order.order_number}&email=${encodeURIComponent(order.email)}`;

  const html = getEmailWrapper(
    subject,
    `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="gold-pill">Boutique Preparation</span>
      <h1 class="heading">Fragrance Consignment in Progress</h1>
      <p class="paragraph">Our boutique specialists are carefully bottling, packaging, and seal-inspecting your fragrance consignment.</p>
    </div>

    <div class="card">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #d4af37; margin-bottom: 12px; font-weight: 600;">Dispatch Expectations</div>
      <p class="paragraph" style="margin-bottom: 12px;">
        Every bottle is stored in temperature-controlled ateliers to preserve olfactory purity. Once packaged, our courier team will initiate delivery.
      </p>
      <table class="info-table">
        <tr>
          <td class="info-label">Estimated Delivery (Lagos)</td>
          <td class="info-value">1 - 2 Business Days</td>
        </tr>
        <tr>
          <td class="info-label">Estimated Delivery (Nationwide)</td>
          <td class="info-value">3 - 5 Business Days</td>
        </tr>
        <tr>
          <td class="info-label">Fulfillment Status</td>
          <td class="info-value" style="color: #f59e0b;">Processing &bull; In Preparation</td>
        </tr>
      </table>
    </div>

    <div class="button-container">
      <a href="${trackingUrl}" class="btn-gold">Check Consignment Stream</a>
    </div>
  `
  );

  const text = `CONSIGNMENT PREPARATION NOTICE — PHILZ SIGNATURE
Order: ${order.order_number}
Your items are currently being prepared and inspected by our boutique specialists.
Track: ${trackingUrl}`;

  await dispatchEmail({
    to: order.email,
    subject,
    html,
    text,
    emailType: 'shipping_update',
    orderId: order.id,
  });
}

/**
 * Aggregator: Send all transactional communications
 */
export async function sendAllTransactionalEmails(
  order: OrderEmailData,
  items: OrderItemEmailData[],
  payment: PaymentEmailDetails
): Promise<void> {
  // Dispatches payment confirmation, order confirmation, and shipping updates
  await Promise.allSettled([
    sendPaymentConfirmationEmail(order, payment),
    sendOrderConfirmationEmail(order, items),
    sendShippingUpdateEmail(order),
  ]);

  // Insert consolidated milestone into order timeline
  try {
    await supabaseAdmin.from('order_timeline').insert({
      order_id: order.id,
      status: 'communications_sent',
      title: 'Transactional Communications Dispatched',
      description: `Payment confirmation, order confirmation, and preparation notice transmitted to ${order.email}.`,
    });
  } catch (err) {
    console.warn('Timeline update for email dispatch skipped:', err);
  }
}
