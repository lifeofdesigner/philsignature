import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getGatewayCredentials } from '../../_lib/gatewaySettings';
import { markOrderPaid } from '../../_lib/confirmPayment';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const rawBody = await getRawBody(req);
  const { secretKey } = await getGatewayCredentials('paystack');
  if (!secretKey) {
    res.status(500).json({ success: false, reason: 'Paystack secret key is not configured' });
    return;
  }

  const signature = req.headers['x-paystack-signature'];
  const expected = crypto.createHmac('sha512', secretKey).update(rawBody).digest('hex');
  if (signature !== expected) {
    res.status(401).json({ success: false, reason: 'Invalid signature' });
    return;
  }

  const event = JSON.parse(rawBody.toString('utf8'));

  if (event.event === 'charge.success') {
    const { reference, amount, status } = event.data;
    if (status === 'success') {
      await markOrderPaid({
        orderNumber: reference,
        reference,
        gateway: 'paystack',
        amountNaira: amount / 100,
      });
    }
  }

  res.status(200).json({ received: true });
}
