import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getGatewayCredentials } from '../_lib/gatewaySettings';
import { markOrderPaid } from '../_lib/confirmPayment';
import { triggerInventoryUpdate } from '../_lib/inventoryService';
import { sendAllTransactionalEmails } from '../_lib/emailService';
import { supabaseAdmin } from '../_lib/supabaseAdmin';

export const config = {
  api: { bodyParser: false },
};

function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Secondary verification: Call the Paystack Verify Transaction API
 * to independently confirm the status and amount directly with Paystack.
 */
async function verifyWithPaystackApi(
  reference: string,
  secretKey: string
): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `Paystack API status ${res.status}: ${errText}` };
    }

    const json = await res.json();
    if (!json.status || !json.data) {
      return { ok: false, error: json.message || 'Verification payload invalid' };
    }

    return { ok: true, data: json.data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error verifying with Paystack API';
    return { ok: false, error: message };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);
    const { secretKey } = await getGatewayCredentials('paystack');

    if (!secretKey) {
      console.error('[Paystack Webhook] Paystack secret key is not configured');
      return res.status(500).json({ success: false, reason: 'Paystack secret key is not configured' });
    }

    // 1. Verify x-paystack-signature header
    const signature = req.headers['x-paystack-signature'];
    if (!signature || typeof signature !== 'string') {
      console.warn('[Paystack Webhook] Missing x-paystack-signature header');
      return res.status(401).json({ success: false, reason: 'Missing x-paystack-signature' });
    }

    const expectedSignature = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');

    if (signature.length !== expectedSignature.length) {
      console.warn('[Paystack Webhook] Signature length mismatch');
      return res.status(401).json({ success: false, reason: 'Invalid signature length' });
    }

    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      console.warn('[Paystack Webhook] Invalid HMAC signature rejected');
      return res.status(401).json({ success: false, reason: 'Invalid signature' });
    }

    // 2. Parse Event JSON
    let event: any;
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch {
      return res.status(400).json({ error: 'Malformed JSON payload' });
    }

    // Filter event type - Paystack sends charge.success for successful payment
    if (event?.event !== 'charge.success') {
      return res.status(200).json({ received: true, ignored: true, event: event?.event });
    }

    const eventData = event.data || {};
    const reference = eventData.reference;
    const webhookStatus = eventData.status;
    const webhookAmountKobo = eventData.amount;

    if (!reference || webhookStatus !== 'success') {
      return res.status(200).json({ received: true, reason: 'Non-success status or missing reference' });
    }

    // 3. Independent Verification via Paystack Verify Transaction API
    const apiVerification = await verifyWithPaystackApi(reference, secretKey);
    if (!apiVerification.ok || !apiVerification.data) {
      console.error(`[Paystack Webhook] Paystack API verification failed for ${reference}:`, apiVerification.error);
      return res.status(400).json({
        success: false,
        reason: apiVerification.error || 'Secondary Paystack API verification failed',
      });
    }

    const verifiedData = apiVerification.data;
    if (verifiedData.status !== 'success') {
      console.warn(`[Paystack Webhook] Paystack API returned transaction status: ${verifiedData.status}`);
      return res.status(400).json({ success: false, reason: `Paystack status: ${verifiedData.status}` });
    }

    // 4. Locate Order Record
    let { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .or(`order_number.eq.${reference},payment_reference.eq.${reference}`)
      .maybeSingle();

    if (!order && (eventData.metadata?.order_id || verifiedData.metadata?.order_id)) {
      const orderId = eventData.metadata?.order_id || verifiedData.metadata?.order_id;
      const { data: byId } = await supabaseAdmin
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', orderId)
        .maybeSingle();
      if (byId) order = byId;
    }

    if (!order) {
      console.warn(`[Paystack Webhook] No database order record found for reference: ${reference}`);
      return res.status(200).json({ received: true, reason: 'Order not found' });
    }

    // 5. Idempotency Check: Handle duplicate deliveries safely
    if (order.financial_status === 'paid') {
      console.log(`[Paystack Webhook] Idempotent delivery: Order ${order.order_number} is already paid.`);
      return res.status(200).json({
        received: true,
        idempotent: true,
        already_processed: true,
        order_number: order.order_number,
      });
    }

    const verifiedAmountNaira = (verifiedData.amount || webhookAmountKobo) / 100;

    // 6. Update Order and Payment Records (Single Source of Truth)
    const updateOutcome = await markOrderPaid({
      orderId: order.id,
      orderNumber: order.order_number,
      reference,
      gateway: 'paystack',
      amountNaira: verifiedAmountNaira,
      paystackDetails: {
        id: verifiedData.id,
        channel: verifiedData.channel,
        currency: verifiedData.currency,
        paid_at: verifiedData.paid_at,
        customer: verifiedData.customer,
      },
    });

    if (!updateOutcome.success) {
      console.error(`[Paystack Webhook] Order status update failed:`, updateOutcome.reason);
      return res.status(400).json(updateOutcome);
    }

    const confirmedOrder = updateOutcome.order || order;

    // 7. Trigger Inventory Updates
    try {
      await triggerInventoryUpdate(confirmedOrder.id);
    } catch (invErr) {
      console.error('[Paystack Webhook] Error triggering inventory updates:', invErr);
    }

    // 8. Send All Transactional Emails (Payment confirmation, order confirmation, shipping updates)
    try {
      await sendAllTransactionalEmails(
        confirmedOrder,
        confirmedOrder.items || [],
        {
          reference,
          amountNaira: verifiedAmountNaira,
          gateway: 'paystack',
          paidAt: verifiedData.paid_at || new Date().toISOString(),
        }
      );
    } catch (emailErr) {
      console.error('[Paystack Webhook] Error sending transactional emails:', emailErr);
    }

    return res.status(200).json({
      received: true,
      success: true,
      order_number: confirmedOrder.order_number,
      reference,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal webhook processing error';
    console.error('[Paystack Webhook] Fatal error:', message);
    return res.status(500).json({ error: message });
  }
}
