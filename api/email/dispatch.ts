import type { VercelRequest, VercelResponse } from '@vercel/node';
import { checkRateLimit } from '../_lib/rateLimit';
import {
  sendWelcomeVerificationEmail,
  sendEmailVerifiedConfirmationEmail,
  sendNewLoginAlertEmail,
  sendPasswordChangedAlertEmail,
  sendPasswordResetEmail,
  sendEmailChangedNotification,
  sendOrderReceivedEmail,
  sendPaymentConfirmationEmail,
  sendOrderProcessingEmail,
  sendOrderShippedEmail,
  sendOutForDeliveryEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
  sendRefundProcessedEmail,
  sendAdminNewOrderEmail,
  sendAdminHighValueOrderEmail,
  sendAdminFailedPaymentEmail,
  sendAdminRefundRequestedEmail,
  sendAdminNewCustomerRegisteredEmail,
  sendAdminLowInventoryAlertEmail,
} from '../_lib/emailService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limit: 20 email requests per minute per IP
  if (!checkRateLimit(req, res, 20, 60000, 'email_dispatch')) {
    return;
  }

  const { type, payload } = req.body || {};

  if (!type || !payload) {
    return res.status(400).json({ error: 'type and payload are required' });
  }

  try {
    switch (type) {
      case 'welcome_verification':
        await sendWelcomeVerificationEmail(payload.email, payload.name, payload.verificationUrl);
        break;
      case 'email_verified_confirmation':
        await sendEmailVerifiedConfirmationEmail(payload.email, payload.name);
        break;
      case 'new_login_alert':
        await sendNewLoginAlertEmail(payload.email, payload.details);
        break;
      case 'password_changed_alert':
        await sendPasswordChangedAlertEmail(payload.email, payload.details);
        break;
      case 'password_reset':
        await sendPasswordResetEmail(payload.email, payload.resetUrl);
        break;
      case 'email_changed':
        await sendEmailChangedNotification(payload.oldEmail, payload.newEmail, payload.details);
        break;
      case 'order_received':
        await sendOrderReceivedEmail(payload.order, payload.items);
        break;
      case 'payment_confirmed':
        await sendPaymentConfirmationEmail(payload.order, payload.payment);
        break;
      case 'order_processing':
        await sendOrderProcessingEmail(payload.order);
        break;
      case 'order_shipped':
        await sendOrderShippedEmail(payload.order, payload.shipping);
        break;
      case 'out_for_delivery':
        await sendOutForDeliveryEmail(payload.order, payload.delivery);
        break;
      case 'order_delivered':
        await sendOrderDeliveredEmail(payload.order, payload.reviewUrl);
        break;
      case 'order_cancelled':
        await sendOrderCancelledEmail(payload.order, payload.reason);
        break;
      case 'refund_processed':
        await sendRefundProcessedEmail(payload.order, payload.refund);
        break;
      case 'admin_new_order':
        await sendAdminNewOrderEmail(payload.order);
        break;
      case 'admin_high_value_order':
        await sendAdminHighValueOrderEmail(payload.order, payload.thresholdNaira);
        break;
      case 'admin_failed_payment':
        await sendAdminFailedPaymentEmail(payload.details);
        break;
      case 'admin_refund_requested':
        await sendAdminRefundRequestedEmail(payload.details);
        break;
      case 'admin_new_customer':
        await sendAdminNewCustomerRegisteredEmail(payload.details);
        break;
      case 'admin_low_inventory':
        await sendAdminLowInventoryAlertEmail(payload.details);
        break;
      default:
        return res.status(400).json({ error: `Unknown email type: ${type}` });
    }

    return res.status(200).json({ success: true, type });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Dispatch failure';
    console.error(`[Email Dispatch Endpoint Error] (${type}):`, message);
    return res.status(500).json({ error: message });
  }
}
