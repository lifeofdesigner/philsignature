import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGatewayCredentials } from '../../_lib/gatewaySettings';
import { markOrderPaid } from '../../_lib/confirmPayment';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  const { webhookSecretHash } = await getGatewayCredentials('flutterwave');
  const receivedHash = req.headers['verif-hash'];

  if (!webhookSecretHash || receivedHash !== webhookSecretHash) {
    res.status(401).json({ success: false, reason: 'Invalid webhook signature' });
    return;
  }

  const event = req.body || {};

  if (event.event === 'charge.completed' && event.data?.status === 'successful') {
    const { tx_ref: reference, amount } = event.data;
    await markOrderPaid({
      orderNumber: reference,
      reference,
      gateway: 'flutterwave',
      amountNaira: amount,
    });
  }

  res.status(200).json({ received: true });
}
