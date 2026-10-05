import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getGatewayCredentials } from '../_lib/gatewaySettings.js';
import { markOrderPaid } from '../_lib/confirmPayment.js';
import { triggerInventoryUpdate } from '../_lib/inventoryService.js';
import { sendAllTransactionalEmails } from '../_lib/emailService.js';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';

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
    const { secretKey, mode } = await getGatewayCredentials('paystack');

    // Parse Event JSON safely early for diagnostics
    let event: any = null;
    try {
      event = JSON.parse(rawBody.toString('utf8'));
    } catch {
      console.warn('[Paystack Webhook] Failed to parse JSON body');
    }

    const eventType = event?.event;
    const rawReference = event?.data?.reference;

    console.log(`[Paystack Webhook DEBUG] Incoming event received. Mode: ${mode}, Event Type: ${eventType}, Reference: ${rawReference}`);

    // Production-safe activity logging (never logs secret keys)
    try {
      await supabaseAdmin.from('activity_logs').insert({
        action: 'paystack_webhook_received',
        entity_type: 'payment',
        entity_id: rawReference || 'unknown',
        details: {
          timestamp: new Date().toISOString(),
          mode,
          event_type: eventType,
          reference: rawReference,
          has_signature: Boolean(req.headers['x-paystack-signature']),
        },
      });
    } catch (logErr) {
      console.warn('[Paystack Webhook] Non-critical activity log error:', logErr);
    }

    if (!secretKey) {
      console.error('[Paystack Webhook] Paystack secret key is not configured');
      return res.status(200).json({ success: false, reason: 'Paystack secret key is not configured' });
    }

    // 1. Verify x-paystack-signature header
    const signature = req.headers['x-paystack-signature'];
    if (!signature || typeof signature !== 'string') {
      console.warn('[Paystack Webhook DEBUG] Signature validation result: FAILED (missing x-paystack-signature header)');
      return res.status(401).json({ success: false, reason: 'Missing x-paystack-signature' });
    }

    const expectedSignature = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');

    if (signature.length !== expectedSignature.length) {
      console.warn('[Paystack Webhook DEBUG] Signature validation result: FAILED (length mismatch)');
      return res.status(401).json({ success: false, reason: 'Invalid signature length' });
    }

    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    const isValidSignature = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    console.log(`[Paystack Webhook DEBUG] Signature validation result: ${isValidSignature ? 'VALID' : 'INVALID'}`);

    if (!isValidSignature) {
      console.warn('[Paystack Webhook] Invalid HMAC signature rejected');
      return res.status(401).json({ success: false, reason: 'Invalid signature' });
    }

    // 2. Validate Event JSON
    if (!event) {
      console.warn('[Paystack Webhook DEBUG] Malformed JSON payload');
      return res.status(200).json({ received: true, error: 'Malformed JSON payload' });
    }

    console.log(`[Paystack Webhook DEBUG] Event type: ${eventType}, Reference: ${rawReference}`);

    // Filter event type - Paystack sends charge.success for successful payment
    if (eventType !== 'charge.success') {
      console.log(`[Paystack Webhook DEBUG] Ignoring non-charge event: ${eventType}`);
      return res.status(200).json({ received: true, ignored: true, event: eventType });
    }

    const eventData = event.data || {};
    const reference = eventData.reference;
    const webhookStatus = eventData.status;
    const webhookAmountKobo = eventData.amount;

    console.log(`[Paystack Webhook DEBUG] Processing charge.success for reference: ${reference}, Status: ${webhookStatus}, Amount(kobo): ${webhookAmountKobo}`);

    if (!reference || webhookStatus !== 'success') {
      console.warn(`[Paystack Webhook DEBUG] Non-success status (${webhookStatus}) or missing reference (${reference})`);
      return res.status(200).json({ received: true, reason: 'Non-success status or missing reference' });
    }

    // 3. Independent Verification via Paystack Verify Transaction API
    const apiVerification = await verifyWithPaystackApi(reference, secretKey);
    if (!apiVerification.ok || !apiVerification.data) {
      console.error(`[Paystack Webhook DEBUG] Paystack API verification failed for ${reference}:`, apiVerification.error);
      return res.status(200).json({
        received: true,
        success: false,
        reason: apiVerification.error || 'Secondary Paystack API verification failed',
      });
    }

    const verifiedData = apiVerification.data;
    if (verifiedData.status !== 'success') {
      console.warn(`[Paystack Webhook DEBUG] Paystack API returned transaction status: ${verifiedData.status}`);
      return res.status(200).json({ received: true, success: false, reason: `Paystack status: ${verifiedData.status}` });
    }

    // 4. Locate Order Record
    let { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .or(`order_number.eq.${reference},payment_reference.eq.${reference}`)
      .maybeSingle();

    // Fallback A: Check payment_transactions table (supports retries where orders.payment_reference may differ)
    if (!order) {
      try {
        const { data: tx } = await supabaseAdmin
          .from('payment_transactions')
          .select('order_id')
          .eq('reference', reference)
          .maybeSingle();
        if (tx?.order_id) {
          const { data: byTxOrderId } = await supabaseAdmin
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('id', tx.order_id)
            .maybeSingle();
          if (byTxOrderId) order = byTxOrderId;
        }
      } catch (txErr) {
        console.warn('[Paystack Webhook DEBUG] payment_transactions query error:', txErr);
      }
    }

    // Fallback B: Check event / verification metadata
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
      console.warn(`[Paystack Webhook DEBUG] Database lookup: No order record found for reference: ${reference}`);
      return res.status(200).json({ received: true, reason: 'Order not found' });
    }

    console.log(`[Paystack Webhook DEBUG] Located matching order: #${order.order_number} (ID: ${order.id}), Current Status: ${order.financial_status}`);

    // 5. Idempotency Check: Handle duplicate deliveries safely
    if (order.financial_status === 'paid') {
      console.log(`[Paystack Webhook DEBUG] Database update result: Idempotent delivery, Order ${order.order_number} already paid.`);
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

    console.log(`[Paystack Webhook DEBUG] Database update result for #${order.order_number}:`, updateOutcome.success ? 'SUCCESS (Marked Paid)' : `FAILED (${updateOutcome.reason})`);

    if (!updateOutcome.success) {
      console.error(`[Paystack Webhook] Order status update failed:`, updateOutcome.reason);
      return res.status(200).json({ received: true, success: false, reason: updateOutcome.reason });
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
    return res.status(200).json({ received: true, success: false, error: message });
  }
}
