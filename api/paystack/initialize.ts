import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getGatewayCredentials } from '../_lib/gatewaySettings.js';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { checkRateLimit } from '../_lib/rateLimit.js';

export interface InitializePaystackBody {
  orderId: string;
  orderNumber?: string;
  email: string;
  amount: number; // in NGN
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Generate a cryptographically secure, unique Paystack reference:
 * Format: PS_${timestamp}_${random}_${orderId/orderNumber}
 * e.g., PS_1728087600123_a1b2c3d4_PS-9201-4421
 */
export function generatePaystackReference(orderIdentifier: string): string {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  const sanitizedIdentifier = orderIdentifier
    .replace(/[^a-zA-Z0-9-_]/g, '')
    .slice(0, 24);
  return `PS_${timestamp}_${random}_${sanitizedIdentifier}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Prevent any browser or intermediary caching of payment initialization
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Rate limiting: 30 payment initialization requests per minute per IP
  if (!checkRateLimit(req, res, 30, 60000, 'paystack_init')) {
    return;
  }

  const { orderId, email, amount, callbackUrl, metadata = {} } = (req.body || {}) as InitializePaystackBody;

  if (!orderId || !email || !amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'orderId, email, and a positive amount are required to initialize payment.',
    });
  }

  try {
    // 1. Verify order exists and is not already paid
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, total_amount, financial_status, email, payment_attempts_count')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError) {
      console.error('[Paystack Init] Database error:', orderError);
      return res.status(500).json({ success: false, error: 'Database verification failed.' });
    }

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found.' });
    }

    if (order.financial_status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Order has already been confirmed as paid. No new payment needed.',
        alreadyPaid: true,
      });
    }

    // 2. Fetch configured Paystack secret key
    const { secretKey, mode } = await getGatewayCredentials('paystack');
    if (!secretKey) {
      console.error('[Paystack Init] Paystack secret key is missing');
      return res.status(500).json({
        success: false,
        error: 'Paystack is not configured on the boutique server. Please choose an alternate payment method.',
      });
    }

    // 3. Generate ALWAYS fresh, non-reusable transaction reference
    const freshReference = generatePaystackReference(order.order_number || order.id);

    const amountInKobo = Math.round(Number(amount) * 100);
    const origin = req.headers.origin || 'https://philzsignature.com';
    const finalCallbackUrl =
      callbackUrl ||
      `${origin}/payment/callback?reference=${encodeURIComponent(freshReference)}&email=${encodeURIComponent(email)}`;

    // 4. Initialize transaction securely directly with Paystack API
    const paystackPayload = {
      email: email.trim(),
      amount: amountInKobo,
      reference: freshReference,
      callback_url: finalCallbackUrl,
      metadata: {
        ...metadata,
        order_id: order.id,
        order_number: order.order_number,
        custom_fields: [
          {
            display_name: 'Order Number',
            variable_name: 'order_number',
            value: order.order_number,
          },
        ],
      },
    };

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paystackPayload),
    });

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status || !paystackData.data) {
      console.error('[Paystack Init] Paystack API rejected initialization:', paystackData);
      return res.status(400).json({
        success: false,
        error: paystackData.message || 'Paystack rejected transaction initialization.',
        gatewayResponse: paystackData,
      });
    }

    const { authorization_url, access_code, reference } = paystackData.data;

    // 5. Store every Paystack reference separately in payment_transactions table
    const nowIso = new Date().toISOString();
    try {
      await supabaseAdmin.from('payment_transactions').insert({
        order_id: order.id,
        order_number: order.order_number,
        reference: reference || freshReference,
        gateway: 'paystack',
        amount: Number(amount),
        currency: 'NGN',
        status: 'initialized',
        authorization_url,
        access_code,
        metadata: paystackPayload.metadata,
        gateway_response: paystackData.data,
        created_at: nowIso,
        updated_at: nowIso,
      });
    } catch (insertTxErr) {
      console.warn('[Paystack Init] Warning: payment_transactions insert non-blocking failure:', insertTxErr);
    }

    // 6. Update order with latest reference, attempt timestamp, and increment attempt counter
    try {
      await supabaseAdmin
        .from('orders')
        .update({
          payment_reference: reference || freshReference,
          last_payment_attempt_at: nowIso,
          payment_attempts_count: (order.payment_attempts_count || 0) + 1,
          updated_at: nowIso,
        })
        .eq('id', order.id);
    } catch (orderUpdateErr) {
      console.warn('[Paystack Init] Warning: order payment reference update error:', orderUpdateErr);
    }

    // 7. Add order timeline audit entry for payment attempt
    try {
      await supabaseAdmin.from('order_timeline').insert({
        order_id: order.id,
        status: 'pending',
        title: 'Payment Initialized',
        description: `Paystack checkout initialized with fresh reference ${reference || freshReference}.`,
      });
    } catch (timelineErr) {
      console.warn('[Paystack Init] Warning: timeline insertion error:', timelineErr);
    }

    return res.status(200).json({
      success: true,
      reference: reference || freshReference,
      authorizationUrl: authorization_url,
      accessCode: access_code,
      mode,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown payment initialization error';
    console.error('[Paystack Init] Fatal error:', message);
    return res.status(500).json({ success: false, error: message });
  }
}
