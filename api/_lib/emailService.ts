import nodemailer from 'nodemailer';
import { supabaseAdmin } from './supabaseAdmin.js';
import { decryptSecret } from './crypto.js';

if (!process.env.RESEND_API_KEY) {
  console.error('[EmailService] RESEND_API_KEY is not set — all emails will fail silently');
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  emailType: string;
  orderId?: string;
  userId?: string;
}

export interface PaymentEmailDetails {
  reference: string;
  amountNaira: number;
  gateway: string;
  paidAt?: string;
}

export interface OrderItemEmailData {
  product_name: string;
  sku?: string | null;
  quantity: number;
  subtotal: number;
}

export interface OrderEmailData {
  id: string;
  order_number: string;
  email: string;
  phone?: string;
  subtotal: number;
  shipping_amount: number;
  discount_amount: number;
  tax_amount?: number;
  tax_rate?: number;
  total_amount: number;
  coupon_code?: string | null;
  shipping_address: Record<string, unknown>;
  items?: OrderItemEmailData[];
}

const BRAND_NAME = 'Philz Signature';
const BRAND_TAGLINE = 'Your Scent. Your Signature.';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'philzsignature1@gmail.com';
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'orders@philzsignature.com';
const APP_URL = process.env.VITE_APP_URL || 'https://philzsignature.com';

function formatNaira(amount: number): string {
  return `₦${Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function getEmailWrapper(title: string, contentHtml: string, isMarketing: boolean = false): string {
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
      <p style="margin: 0 0 8px 0;">PHILZ SIGNATURE &mdash; Signature by nature, krafted for you.</p>
      <p style="margin: 0 0 8px 0;">Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
      ${
        isMarketing
          ? `<p style="margin: 0 0 8px 0;"><a href="${APP_URL}/unsubscribe" style="color: #78716c; text-decoration: underline;">Unsubscribe from marketing privileges</a></p>`
          : `<p style="margin: 0 0 8px 0; font-size: 10px; color: #57534e;">This is an essential account/order notification. Marketing unsubscribe is not applicable.</p>`
      }
      <p style="margin: 0; font-size: 10px; color: #57534e;">&copy; 2026 PHILZ SIGNATURE. ALL RIGHTS RESERVED.</p>
    </div>
  </div>
</body>
</html>`;
}

// =============================================================================
// DYNAMIC TEMPLATE FETCH & VARIABLE REPLACEMENT LOGIC
// =============================================================================

interface TemplateResolution {
  subject: string;
  html: string;
  shouldSend: boolean;
}

interface CachedTemplate {
  subject: string;
  html_body: string;
  is_active: boolean;
  cachedAt: number;
}

const templateCache = new Map<string, CachedTemplate>();
const CACHE_TTL_MS = 60 * 1000; // 60-second cache

function replacePlaceholders(templateStr: string, variables: Record<string, string | number | undefined | null>): string {
  let result = templateStr;
  for (const [key, val] of Object.entries(variables)) {
    const valueStr = val === undefined || val === null ? '' : String(val);
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`{{\\s*${escaped}\\s*}}`, 'g');
    result = result.replace(regex, valueStr);
  }
  return result;
}

async function resolveEmailTemplate(
  templateKey: string,
  variables: Record<string, string | number | undefined | null>,
  fallback: { subject: string; htmlBody: string }
): Promise<TemplateResolution> {
  let dbTemplate: { subject: string; html_body: string; is_active: boolean } | null = null;
  const now = Date.now();

  const cached = templateCache.get(templateKey);
  if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
    dbTemplate = cached;
  } else {
    try {
      const { data, error } = await supabaseAdmin
        .from('email_templates')
        .select('subject, html_body, is_active')
        .eq('template_key', templateKey)
        .maybeSingle();

      if (!error && data) {
        dbTemplate = {
          subject: data.subject,
          html_body: data.html_body,
          is_active: data.is_active ?? true,
        };
        templateCache.set(templateKey, { ...dbTemplate, cachedAt: now });
      } else if (error) {
        console.warn(`[EmailService] DB fetch failed for template "${templateKey}", falling back:`, error.message);
      }
    } catch (err) {
      console.warn(`[EmailService] Exception fetching template "${templateKey}", falling back:`, err);
    }
  }

  // If a template is marked is_active = false in the database, skip sending that email type
  if (dbTemplate && dbTemplate.is_active === false) {
    console.info(`[EmailService] Template "${templateKey}" is inactive (is_active = false). Skipping dispatch.`);
    return { subject: '', html: '', shouldSend: false };
  }

  const rawSubject = dbTemplate?.subject || fallback.subject;
  const rawBody = dbTemplate?.html_body || fallback.htmlBody;

  const populatedSubject = replacePlaceholders(rawSubject, variables);
  const populatedBody = replacePlaceholders(rawBody, variables);

  const finalHtml = populatedBody.includes('<!DOCTYPE') || populatedBody.includes('<html')
    ? populatedBody
    : getEmailWrapper(populatedSubject, populatedBody);

  return {
    subject: populatedSubject,
    html: finalHtml,
    shouldSend: true,
  };
}

const CONFIG_ID = '00000000-0000-0000-0000-000000000001';

interface SmtpDbConfig {
  provider_name: string;
  smtp_host: string | null;
  smtp_port: number;
  smtp_username: string | null;
  smtp_password_encrypted: string | null;
  smtp_from_name: string | null;
  smtp_from_email: string | null;
  smtp_secure: boolean;
}

interface CachedSmtpConfig {
  config: SmtpDbConfig | null;
  cachedAt: number;
}

let smtpConfigCache: CachedSmtpConfig | null = null;
const SMTP_CACHE_TTL_MS = 60 * 1000;

async function getSmtpDbConfig(): Promise<SmtpDbConfig | null> {
  const now = Date.now();
  if (smtpConfigCache && now - smtpConfigCache.cachedAt < SMTP_CACHE_TTL_MS) {
    return smtpConfigCache.config;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('smtp_settings')
      .select('provider_name, smtp_host, smtp_port, smtp_username, smtp_password_encrypted, smtp_from_name, smtp_from_email, smtp_secure')
      .eq('id', CONFIG_ID)
      .maybeSingle();

    const config = !error && data ? (data as SmtpDbConfig) : null;
    smtpConfigCache = { config, cachedAt: now };
    return config;
  } catch (err) {
    console.warn('[EmailService] Failed to load SMTP config from database:', err);
    return null;
  }
}

function resolveFromAddress(config: SmtpDbConfig | null): string {
  if (config?.smtp_from_email) {
    return config.smtp_from_name ? `${config.smtp_from_name} <${config.smtp_from_email}>` : config.smtp_from_email;
  }
  return process.env.EMAIL_FROM || 'Philz Signature <orders@philzsignature.com>';
}

async function sendViaNodemailer(config: SmtpDbConfig, payload: EmailPayload): Promise<boolean> {
  const password = config.smtp_password_encrypted ? decryptSecret(config.smtp_password_encrypted) : null;
  const transporter = nodemailer.createTransport({
    host: config.smtp_host!,
    port: config.smtp_port,
    secure: config.smtp_secure,
    auth: config.smtp_username ? { user: config.smtp_username, pass: password || '' } : undefined,
  });

  await transporter.sendMail({
    from: resolveFromAddress(config),
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
  return true;
}

async function sendViaResend(apiKey: string, config: SmtpDbConfig | null, payload: EmailPayload): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: resolveFromAddress(config),
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (res.ok) return true;
  const errorText = await res.text();
  console.warn(`[EmailService] Resend API responded with status ${res.status}:`, errorText);
  return false;
}

export async function dispatchEmail(payload: EmailPayload): Promise<boolean> {
  let sentViaApi = false;
  const dbConfig = await getSmtpDbConfig();
  const isCustomSmtp = Boolean(dbConfig?.smtp_host && dbConfig.provider_name?.toLowerCase() !== 'resend');
  const resendApiKey = process.env.RESEND_API_KEY;

  try {
    if (isCustomSmtp && dbConfig) {
      sentViaApi = await sendViaNodemailer(dbConfig, payload);
    } else if (resendApiKey) {
      sentViaApi = await sendViaResend(resendApiKey, dbConfig, payload);
    } else {
      console.error(`[EmailService] No SMTP config or RESEND_API_KEY available. Email "${payload.subject}" to ${payload.to} was NOT sent.`);
    }
  } catch (err) {
    console.warn('[EmailService] Dispatch error:', err);
  }

  // Record dispatch in database activity logs
  try {
    await supabaseAdmin.from('activity_logs').insert({
      action: 'transactional_email_dispatched',
      entity_type: payload.orderId ? 'order' : 'auth_security',
      entity_id: payload.orderId || payload.userId || payload.to,
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

  return sentViaApi;
}

/**
 * Sends a test email using the currently configured SMTP/Resend settings,
 * without swallowing errors — used by the admin "Send Test Email" action so
 * failures surface the exact underlying error to the admin for debugging.
 */
export async function sendTestEmail(to: string): Promise<void> {
  smtpConfigCache = null; // always use the freshest settings for a test send
  const dbConfig = await getSmtpDbConfig();
  const isCustomSmtp = Boolean(dbConfig?.smtp_host && dbConfig.provider_name?.toLowerCase() !== 'resend');
  const resendApiKey = process.env.RESEND_API_KEY;

  const payload: EmailPayload = {
    to,
    subject: 'Philz Signature — SMTP Test Email',
    html: `<p>This is a test email sent from the Philz Signature admin SMTP settings panel.</p><p>If you received this, your email configuration is working correctly.</p>`,
    text: 'This is a test email sent from the Philz Signature admin SMTP settings panel. If you received this, your email configuration is working correctly.',
    emailType: 'smtp_test',
  };

  if (isCustomSmtp && dbConfig) {
    await sendViaNodemailer(dbConfig, payload);
    return;
  }

  if (resendApiKey) {
    const ok = await sendViaResend(resendApiKey, dbConfig, payload);
    if (!ok) throw new Error('Resend API rejected the test email. Check RESEND_API_KEY and the from address.');
    return;
  }

  throw new Error('No email provider is configured: set up SMTP settings in the admin panel or configure RESEND_API_KEY in the environment.');
}

// =============================================================================
// CUSTOMER EMAILS (1 - 14)
// =============================================================================

/** 1. Welcome + Email Verification */
export async function sendWelcomeVerificationEmail(email: string, name: string, verificationUrl: string): Promise<void> {
  const fallback = {
    subject: `Welcome to Philz Signature — Verify Your Email`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    customer_name: name || 'Patron',
    verification_url: verificationUrl,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('welcome_verification', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Welcome to Philz Signature! Verify your email to activate your account: ${verificationUrl}\n(Link expires in 24 hours)`;
  await dispatchEmail({ to: email, subject: resolved.subject, html: resolved.html, text, emailType: 'welcome_verification' });
}

/** 2. Email Verified Confirmation */
export async function sendEmailVerifiedConfirmationEmail(email: string, name: string): Promise<void> {
  const fallback = {
    subject: `Account Activated — Philz Signature`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="gold-pill">Verified</span>
      <h1 class="heading">Your Account is Active</h1>
      <p class="paragraph">Dear {{customer_name}}, your email address has been successfully verified. You now enjoy full privileges to curate your private collection.</p>
    </div>
    <div class="button-container">
      <a href="{{shop_url}}" class="btn-gold">Explore The Collection</a>
    </div>`,
  };

  const variables = {
    customer_name: name || 'Patron',
    shop_url: `${APP_URL}/shop`,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('email_verified_confirmation', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Your Philz Signature account has been successfully verified. Discover our collection: ${APP_URL}/shop`;
  await dispatchEmail({ to: email, subject: resolved.subject, html: resolved.html, text, emailType: 'email_verified_confirmation' });
}

/** 3. New Login Alert */
export async function sendNewLoginAlertEmail(
  email: string,
  details: { date: string; time: string; device: string; ip: string; location?: string }
): Promise<void> {
  const fallback = {
    subject: `Security Alert: New Sign-In to Philz Signature`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    date: details.date,
    time: details.time,
    device: details.device,
    ip: details.ip,
    location: details.location || 'Nigeria',
    reset_password_url: `${APP_URL}/forgot-password`,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('new_login_alert', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Security Alert: A new sign-in to your Philz Signature account occurred on ${details.date} from ${details.device} (IP: ${details.ip}). If not you, secure your account at ${APP_URL}/forgot-password`;
  await dispatchEmail({ to: email, subject: resolved.subject, html: resolved.html, text, emailType: 'new_login_alert' });
}

/** 4. Password Changed Alert */
export async function sendPasswordChangedAlertEmail(email: string, details: { date: string; time: string; ip: string }): Promise<void> {
  const fallback = {
    subject: `Security Notice: Your Password Has Been Changed`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="gold-pill">Password Updated</span>
      <h1 class="heading">Password Changed Successfully</h1>
      <p class="paragraph">The password for your Philz Signature account was updated on {{date}} at {{time}} (IP: {{ip}}).</p>
    </div>
    <p class="paragraph">If you initiated this change, you may disregard this email. If you did not make this change, please contact Concierge immediately.</p>`,
  };

  const variables = {
    date: details.date,
    time: details.time,
    ip: details.ip,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('password_changed_alert', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Your Philz Signature password was changed on ${details.date} at ${details.time}. If you did not make this change, please contact us immediately.`;
  await dispatchEmail({ to: email, subject: resolved.subject, html: resolved.html, text, emailType: 'password_changed_alert' });
}

/** 5. Password Reset */
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const fallback = {
    subject: `Password Reset Instructions — Philz Signature`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="gold-pill">Account Recovery</span>
      <h1 class="heading">Reset Your Password</h1>
      <p class="paragraph">We received a request to reset your Philz Signature password. Click below to establish a new password.</p>
    </div>
    <div class="button-container">
      <a href="{{reset_url}}" class="btn-gold">Reset Password</a>
    </div>
    <p class="paragraph" style="text-align: center; font-size: 11px;">This link is valid for 30 minutes and can only be used once. If you did not request this, you may safely ignore this email.</p>`,
  };

  const variables = {
    reset_url: resetUrl,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('password_reset', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Reset your Philz Signature password: ${resetUrl} (Valid for 30 minutes, single use).`;
  await dispatchEmail({ to: email, subject: resolved.subject, html: resolved.html, text, emailType: 'password_reset' });
}

/** 6. Email Changed Notification (Sent to old and new address) */
export async function sendEmailChangedNotification(oldEmail: string, newEmail: string, details: { date: string; ip: string }): Promise<void> {
  const fallback = {
    subject: `Notice: Email Address Update on Philz Signature`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="gold-pill">Account Profile</span>
      <h1 class="heading">Email Address Updated</h1>
      <p class="paragraph">Your registered email address was changed from <strong>{{old_email}}</strong> to <strong>{{new_email}}</strong> on {{date}}.</p>
    </div>
    <p class="paragraph">If you performed this change, no further action is necessary. If this update was unauthorized, contact our boutique immediately.</p>`,
  };

  const variables = {
    old_email: oldEmail,
    new_email: newEmail,
    date: details.date,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('email_changed', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Your Philz Signature email address was updated from ${oldEmail} to ${newEmail} on ${details.date}. Contact support if unauthorized.`;
  await Promise.all([
    dispatchEmail({ to: oldEmail, subject: resolved.subject, html: resolved.html, text, emailType: 'email_changed_old' }),
    dispatchEmail({ to: newEmail, subject: resolved.subject, html: resolved.html, text, emailType: 'email_changed_new' }),
  ]);
}

/** 7. Order Received */
export async function sendOrderReceivedEmail(order: OrderEmailData, items: OrderItemEmailData[] = []): Promise<void> {
  const orderUrl = `${APP_URL}/track-order?orderNumber=${order.order_number}&email=${encodeURIComponent(order.email)}`;
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

  const shippingHtml = `
    ${shipping?.first_name || ''} ${shipping?.last_name || ''}<br/>
    ${shipping?.address_line1 || shipping?.streetAddress || ''}<br/>
    ${shipping?.city || ''}, ${shipping?.state || 'Lagos'}, ${shipping?.country || 'Nigeria'}
  `;

  const fallback = {
    subject: `Order Received: #${order.order_number} — Philz Signature`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    order_number: order.order_number,
    items_table: itemsRows,
    subtotal: formatNaira(order.subtotal),
    tax_row: Number(order.tax_amount || 0) > 0 ? `<tr><td class="info-label">Estimated Tax${order.tax_rate ? ` (${order.tax_rate}%)` : ''}</td><td class="info-value">${formatNaira(order.tax_amount!)}</td></tr>` : '',
    discount_row: Number(order.discount_amount || 0) > 0 ? `<tr><td class="info-label">Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}</td><td class="info-value">-${formatNaira(order.discount_amount)}</td></tr>` : '',
    shipping_amount: order.shipping_amount === 0 ? 'Complimentary' : formatNaira(order.shipping_amount),
    total_amount: formatNaira(order.total_amount),
    shipping_address_html: shippingHtml,
    track_order_url: orderUrl,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('order_received', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Order Received: #${order.order_number}\nSubtotal: ${formatNaira(order.subtotal)}${Number(order.tax_amount || 0) > 0 ? `\nTax: ${formatNaira(order.tax_amount!)}` : ''}\nDelivery: ${order.shipping_amount === 0 ? 'Complimentary' : formatNaira(order.shipping_amount)}\nTotal: ${formatNaira(order.total_amount)}\nTrack: ${orderUrl}`;
  await dispatchEmail({ to: order.email, subject: resolved.subject, html: resolved.html, text, emailType: 'order_received', orderId: order.id });
}

/** 8. Payment Confirmed */
export async function sendPaymentConfirmationEmail(order: OrderEmailData, payment: PaymentEmailDetails): Promise<void> {
  const orderUrl = `${APP_URL}/checkout/confirmation/${order.order_number}?email=${encodeURIComponent(order.email)}`;

  const fallback = {
    subject: `Payment Confirmed — Philz Signature Order #${order.order_number}`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    order_number: order.order_number,
    gateway: payment.gateway.toUpperCase(),
    reference: payment.reference,
    subtotal: formatNaira(order.subtotal),
    tax_row: Number(order.tax_amount || 0) > 0 ? `<tr><td class="info-label">Tax${order.tax_rate ? ` (${order.tax_rate}%)` : ''}</td><td class="info-value">${formatNaira(order.tax_amount!)}</td></tr>` : '',
    shipping_amount: order.shipping_amount === 0 ? 'Complimentary' : formatNaira(order.shipping_amount),
    amount_paid: formatNaira(payment.amountNaira),
    receipt_url: orderUrl,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('payment_confirmation', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Payment Confirmed for #${order.order_number}. Reference: ${payment.reference}, Amount: ${formatNaira(payment.amountNaira)}${Number(order.tax_amount || 0) > 0 ? `, Tax: ${formatNaira(order.tax_amount!)}` : ''}. View: ${orderUrl}`;
  await dispatchEmail({ to: order.email, subject: resolved.subject, html: resolved.html, text, emailType: 'payment_confirmation', orderId: order.id });
}

/** 9. Order Processing */
export async function sendOrderProcessingEmail(order: OrderEmailData): Promise<void> {
  const trackingUrl = `${APP_URL}/track-order?orderNumber=${order.order_number}&email=${encodeURIComponent(order.email)}`;

  const fallback = {
    subject: `Atelier In Progress: Order #${order.order_number} — Philz Signature`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    order_number: order.order_number,
    subtotal: formatNaira(order.subtotal),
    tax_row: Number(order.tax_amount || 0) > 0 ? `<tr><td class="info-label">Tax${order.tax_rate ? ` (${order.tax_rate}%)` : ''}</td><td class="info-value">${formatNaira(order.tax_amount!)}</td></tr>` : '',
    shipping_amount: order.shipping_amount === 0 ? 'Complimentary' : formatNaira(order.shipping_amount),
    total_amount: formatNaira(order.total_amount),
    track_order_url: trackingUrl,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('order_processing', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Your order #${order.order_number} is being bottled and inspected. Subtotal: ${formatNaira(order.subtotal)}${Number(order.tax_amount || 0) > 0 ? `, Tax: ${formatNaira(order.tax_amount!)}` : ''}, Total: ${formatNaira(order.total_amount)}. Track at: ${trackingUrl}`;
  await dispatchEmail({ to: order.email, subject: resolved.subject, html: resolved.html, text, emailType: 'order_processing', orderId: order.id });
}

/** 10. Order Shipped */
export async function sendOrderShippedEmail(
  order: OrderEmailData,
  shipping: { courier: string; trackingNumber: string; trackingUrl?: string }
): Promise<void> {
  const trackBtnUrl = shipping.trackingUrl || `${APP_URL}/track-order?orderNumber=${order.order_number}&email=${encodeURIComponent(order.email)}`;

  const fallback = {
    subject: `Consignment Dispatched: Order #${order.order_number} — Philz Signature`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    order_number: order.order_number,
    courier: shipping.courier,
    tracking_number: shipping.trackingNumber,
    track_courier_url: trackBtnUrl,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('order_shipped', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Consignment #${order.order_number} has been shipped via ${shipping.courier}. Tracking: ${shipping.trackingNumber}. Track: ${trackBtnUrl}`;
  await dispatchEmail({ to: order.email, subject: resolved.subject, html: resolved.html, text, emailType: 'order_shipped', orderId: order.id });
}

/** 11. Out for Delivery */
export async function sendOutForDeliveryEmail(
  order: OrderEmailData,
  delivery: { courier: string; estimatedTime?: string }
): Promise<void> {
  const trackUrl = `${APP_URL}/track-order?orderNumber=${order.order_number}&email=${encodeURIComponent(order.email)}`;

  const fallback = {
    subject: `Arriving Today: Order #${order.order_number} — Philz Signature`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    order_number: order.order_number,
    courier: delivery.courier,
    estimated_time: delivery.estimatedTime || 'Today',
    track_order_url: trackUrl,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('out_for_delivery', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Order #${order.order_number} is out for delivery today via ${delivery.courier}. Track: ${trackUrl}`;
  await dispatchEmail({ to: order.email, subject: resolved.subject, html: resolved.html, text, emailType: 'out_for_delivery', orderId: order.id });
}

/** 12. Delivered */
export async function sendOrderDeliveredEmail(order: OrderEmailData, reviewUrl?: string): Promise<void> {
  const targetReviewUrl = reviewUrl || `${APP_URL}/track-order?orderNumber=${order.order_number}&email=${encodeURIComponent(order.email)}`;

  const fallback = {
    subject: `Consignment Delivered — Philz Signature #${order.order_number}`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    order_number: order.order_number,
    review_url: targetReviewUrl,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('order_delivered', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Consignment #${order.order_number} has been delivered. Share your review: ${targetReviewUrl}`;
  await dispatchEmail({ to: order.email, subject: resolved.subject, html: resolved.html, text, emailType: 'order_delivered', orderId: order.id });
}

/** 13. Order Cancelled */
export async function sendOrderCancelledEmail(order: OrderEmailData, reason: string): Promise<void> {
  const fallback = {
    subject: `Order Cancelled: #${order.order_number} — Philz Signature`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    order_number: order.order_number,
    reason: reason || 'Customer request / Inventory unavailable',
    subtotal: formatNaira(order.subtotal),
    tax_row: Number(order.tax_amount || 0) > 0 ? `<tr><td class="info-label">Tax${order.tax_rate ? ` (${order.tax_rate}%)` : ''}</td><td class="info-value">${formatNaira(order.tax_amount!)}</td></tr>` : '',
    total_amount: formatNaira(order.total_amount),
    support_email: SUPPORT_EMAIL,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('order_cancelled', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Order #${order.order_number} has been cancelled. Reason: ${reason}. Please contact concierge if you have questions.`;
  await dispatchEmail({ to: order.email, subject: resolved.subject, html: resolved.html, text, emailType: 'order_cancelled', orderId: order.id });
}

/** 14. Refund Processed */
export async function sendRefundProcessedEmail(
  order: OrderEmailData,
  refund: { amountNaira: number; timeline: string; reference?: string }
): Promise<void> {
  const fallback = {
    subject: `Refund Processed: #${order.order_number} — Philz Signature`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    order_number: order.order_number,
    refund_amount: formatNaira(refund.amountNaira),
    timeline: refund.timeline || '3 - 5 Business Days',
    reference_row: refund.reference ? `<tr><td class="info-label">Reference</td><td class="info-value" style="font-family: monospace;">${refund.reference}</td></tr>` : '',
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('refund_processed', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Refund of ${formatNaira(refund.amountNaira)} processed for order #${order.order_number}. Timeline: ${refund.timeline}.`;
  await dispatchEmail({ to: order.email, subject: resolved.subject, html: resolved.html, text, emailType: 'refund_processed', orderId: order.id });
}

// =============================================================================
// ADMIN EMAILS (1 - 6)
// =============================================================================

/** 1. New Order Received Alert */
export async function sendAdminNewOrderEmail(order: OrderEmailData, adminEmail: string = ADMIN_NOTIFICATION_EMAIL): Promise<void> {
  const adminUrl = `${APP_URL}/admin/orders`;

  const fallback = {
    subject: `[Admin Alert] New Order Received: #${order.order_number} (${formatNaira(order.total_amount)})`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    order_number: order.order_number,
    customer_email: order.email,
    subtotal: formatNaira(order.subtotal),
    tax_row: Number(order.tax_amount || 0) > 0 ? `<tr><td class="info-label">Tax${order.tax_rate ? ` (${order.tax_rate}%)` : ''}</td><td class="info-value">${formatNaira(order.tax_amount!)}</td></tr>` : '',
    shipping_amount: order.shipping_amount === 0 ? 'Complimentary' : formatNaira(order.shipping_amount),
    total_amount: formatNaira(order.total_amount),
    items_count: String(order.items?.length || 'Multiple'),
    admin_orders_url: adminUrl,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('admin_new_order', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `[Admin Alert] New order #${order.order_number} placed by ${order.email} for ${formatNaira(order.total_amount)}.`;
  await dispatchEmail({ to: adminEmail, subject: resolved.subject, html: resolved.html, text, emailType: 'admin_new_order', orderId: order.id });
}

/** 2. High-Value Order Alert */
export async function sendAdminHighValueOrderEmail(
  order: OrderEmailData,
  thresholdNaira: number = 250000,
  adminEmail: string = ADMIN_NOTIFICATION_EMAIL
): Promise<void> {
  const adminUrl = `${APP_URL}/admin/orders`;

  const fallback = {
    subject: `[HIGH VALUE] Order #${order.order_number} Exceeds ${formatNaira(thresholdNaira)}`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    order_number: order.order_number,
    customer_email: order.email,
    subtotal: formatNaira(order.subtotal),
    tax_row: Number(order.tax_amount || 0) > 0 ? `<tr><td class="info-label">Tax${order.tax_rate ? ` (${order.tax_rate}%)` : ''}</td><td class="info-value">${formatNaira(order.tax_amount!)}</td></tr>` : '',
    total_amount: formatNaira(order.total_amount),
    threshold_amount: formatNaira(thresholdNaira),
    admin_orders_url: adminUrl,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('admin_high_value_order', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `[High Value Order] #${order.order_number} for ${formatNaira(order.total_amount)} placed by ${order.email}. Review at ${adminUrl}`;
  await dispatchEmail({ to: adminEmail, subject: resolved.subject, html: resolved.html, text, emailType: 'admin_high_value_order', orderId: order.id });
}

/** 3. Failed Payment Alert */
export async function sendAdminFailedPaymentEmail(
  details: { orderNumber: string; email: string; amountNaira: number; gateway: string; reason: string },
  adminEmail: string = ADMIN_NOTIFICATION_EMAIL
): Promise<void> {
  const fallback = {
    subject: `[Alert] Payment Failed: #${details.orderNumber} via ${details.gateway.toUpperCase()}`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    order_number: details.orderNumber,
    customer_email: details.email,
    amount: formatNaira(details.amountNaira),
    gateway: details.gateway.toUpperCase(),
    reason: details.reason,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('admin_failed_payment', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `[Payment Failed] Order #${details.orderNumber} for ${details.email} failed via ${details.gateway}. Reason: ${details.reason}`;
  await dispatchEmail({ to: adminEmail, subject: resolved.subject, html: resolved.html, text, emailType: 'admin_failed_payment' });
}

/** 4. Refund Requested Alert */
export async function sendAdminRefundRequestedEmail(
  details: { orderNumber: string; customerEmail: string; amountNaira: number; reason: string },
  adminEmail: string = ADMIN_NOTIFICATION_EMAIL
): Promise<void> {
  const adminUrl = `${APP_URL}/admin/orders`;

  const fallback = {
    subject: `[Action Required] Refund Requested for Order #${details.orderNumber}`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    order_number: details.orderNumber,
    customer_email: details.customerEmail,
    requested_amount: formatNaira(details.amountNaira),
    reason: details.reason,
    admin_orders_url: adminUrl,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('admin_refund_requested', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `Refund requested for order #${details.orderNumber} by ${details.customerEmail} for ${formatNaira(details.amountNaira)}. Reason: ${details.reason}`;
  await dispatchEmail({ to: adminEmail, subject: resolved.subject, html: resolved.html, text, emailType: 'admin_refund_requested' });
}

/** 5. New Customer Registered Alert */
export async function sendAdminNewCustomerRegisteredEmail(
  details: { email: string; name: string; registeredAt: string },
  adminEmail: string = ADMIN_NOTIFICATION_EMAIL
): Promise<void> {
  const adminUrl = `${APP_URL}/admin/customers`;

  const fallback = {
    subject: `[Client Registry] New Customer Registered: ${details.email}`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    customer_email: details.email,
    customer_name: details.name || 'Not provided',
    registered_at: details.registeredAt,
    admin_customers_url: adminUrl,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('admin_new_customer', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `New client registered: ${details.email} (${details.name}) on ${details.registeredAt}.`;
  await dispatchEmail({ to: adminEmail, subject: resolved.subject, html: resolved.html, text, emailType: 'admin_new_customer' });
}

/** 6. Low Inventory Alert */
export async function sendAdminLowInventoryAlertEmail(
  details: { productName: string; sku: string; currentStock: number; minThreshold: number },
  adminEmail: string = ADMIN_NOTIFICATION_EMAIL
): Promise<void> {
  const adminUrl = `${APP_URL}/admin/products`;

  const fallback = {
    subject: `[INVENTORY ALERT] Low Stock: ${details.productName} (${details.currentStock} left)`,
    htmlBody: `
    <div style="text-align: center; margin-bottom: 24px;">
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
  };

  const variables = {
    product_name: details.productName,
    sku: details.sku,
    current_stock: String(details.currentStock),
    threshold: String(details.minThreshold),
    admin_products_url: adminUrl,
    brand_name: BRAND_NAME,
    brand_tagline: BRAND_TAGLINE,
    support_email: SUPPORT_EMAIL,
    app_url: APP_URL,
  };

  const resolved = await resolveEmailTemplate('admin_low_inventory', variables, fallback);
  if (!resolved.shouldSend) return;

  const text = `[LOW INVENTORY] ${details.productName} (SKU: ${details.sku}) has only ${details.currentStock} units remaining (Threshold: ${details.minThreshold}). Manage at ${adminUrl}`;
  await dispatchEmail({ to: adminEmail, subject: resolved.subject, html: resolved.html, text, emailType: 'admin_low_inventory' });
}

/** Aggregator for payment confirmations (backward compatibility) */
export async function sendAllTransactionalEmails(
  order: OrderEmailData,
  items: OrderItemEmailData[],
  payment: PaymentEmailDetails
): Promise<void> {
  await Promise.allSettled([
    sendPaymentConfirmationEmail(order, payment),
    sendOrderReceivedEmail(order, items),
    sendAdminNewOrderEmail(order),
    Number(order.total_amount) >= 250000 ? sendAdminHighValueOrderEmail(order, 250000) : Promise.resolve(),
  ]);
}
