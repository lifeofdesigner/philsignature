import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getGatewayCredentials } from '../../_lib/gatewaySettings.js';
import { markOrderPaid } from '../../_lib/confirmPayment.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const { secretKey } = await getGatewayCredentials('korapay');
  if (!secretKey) {
    res.status(500).json({ success: false, reason: 'Korapay secret key is not configured' });
    return;
  }

  const event = req.body || {};
  const signature = req.headers['x-korapay-signature'];
  const expected = crypto.createHmac('sha256', secretKey).update(JSON.stringify(event.data || {})).digest('hex');

  if (signature !== expected) {
    res.status(401).json({ success: false, reason: 'Invalid signature' });
    return;
  }

  if (event.event === 'charge.success' && event.data?.status === 'success') {
    const { reference, amount } = event.data;
    await markOrderPaid({
      orderNumber: reference,
      reference,
      gateway: 'korapay',
      amountNaira: amount,
    });
  }

  res.status(200).json({ received: true });
}
