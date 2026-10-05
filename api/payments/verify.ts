import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGatewayCredentials, type GatewayName } from '../_lib/gatewaySettings.js';
import { markOrderPaid } from '../_lib/confirmPayment.js';

interface VerifyResult {
  ok: boolean;
  reason?: string;
  amountNaira?: number;
}

async function verifyPaystack(reference: string, secretKey: string): Promise<VerifyResult> {
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const body = await res.json();
  if (!res.ok || !body?.data) return { ok: false, reason: body?.message || 'Paystack verification request failed' };
  const { status, amount } = body.data;
  if (status !== 'success') return { ok: false, reason: `Paystack transaction status: ${status}` };
  return { ok: true, amountNaira: amount / 100 };
}

async function verifyFlutterwave(reference: string, secretKey: string): Promise<VerifyResult> {
  const res = await fetch(
    `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  const body = await res.json();
  if (!res.ok || !body?.data) return { ok: false, reason: body?.message || 'Flutterwave verification request failed' };
  const { status, amount } = body.data;
  if (status !== 'successful') return { ok: false, reason: `Flutterwave transaction status: ${status}` };
  return { ok: true, amountNaira: amount };
}

async function verifyKorapay(reference: string, secretKey: string): Promise<VerifyResult> {
  const res = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const body = await res.json();
  if (!res.ok || !body?.data) return { ok: false, reason: body?.message || 'Korapay verification request failed' };
  const { status, amount } = body.data;
  if (status !== 'success') return { ok: false, reason: `Korapay transaction status: ${status}` };
  return { ok: true, amountNaira: amount };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, reason: 'Method not allowed' });
    return;
  }

  // Rate limiting: 60 req/min for general API
  const { checkRateLimit } = await import('../_lib/rateLimit.js');
  if (!checkRateLimit(req, res, 60, 60000, 'verify_api')) {
    return;
  }

  const { gateway, reference, orderId } = req.body || {};
  if (!gateway || !reference || !orderId) {
    res.status(400).json({ success: false, reason: 'gateway, reference, and orderId are required' });
    return;
  }
  if (!['paystack', 'flutterwave', 'korapay'].includes(gateway)) {
    res.status(400).json({ success: false, reason: 'Unsupported gateway' });
    return;
  }

  const { secretKey } = await getGatewayCredentials(gateway as GatewayName);
  if (!secretKey) {
    res.status(500).json({ success: false, reason: 'Gateway secret key is not configured' });
    return;
  }

  let result: VerifyResult;
  try {
    if (gateway === 'paystack') result = await verifyPaystack(reference, secretKey);
    else if (gateway === 'flutterwave') result = await verifyFlutterwave(reference, secretKey);
    else result = await verifyKorapay(reference, secretKey);
  } catch (err) {
    res.status(502).json({ success: false, reason: err instanceof Error ? err.message : 'Gateway request failed' });
    return;
  }

  if (!result.ok || typeof result.amountNaira !== 'number') {
    res.status(200).json({ success: false, reason: result.reason || 'Verification failed' });
    return;
  }

  // The webhook is the single source of truth for Paystack payments.
  // We do not mark the order paid here for Paystack to prevent race conditions or trusting client requests.
  if (gateway === 'paystack') {
    res.status(200).json({
      success: true,
      pendingWebhook: true,
      amountNaira: result.amountNaira,
      message: 'Paystack transaction verified. Order confirmation is handled by webhook.',
    });
    return;
  }

  const outcome = await markOrderPaid({
    orderId,
    reference,
    gateway,
    amountNaira: result.amountNaira,
  });

  res.status(200).json(outcome);
}
