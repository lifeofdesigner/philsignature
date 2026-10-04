import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseAdmin';

/**
 * Read-Only Transaction / Order Status Query Endpoint
 * Used by the live callback page (/payment/callback) to check whether
 * the Paystack webhook has verified the order.
 *
 * SAFETY GUARANTEE: This endpoint is strictly read-only.
 * It never marks an order as paid, preserving the webhook as
 * the single source of truth.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const referenceParam = (req.query.reference as string) || (req.query.trxref as string);
  if (!referenceParam || !referenceParam.trim()) {
    return res.status(400).json({ error: 'Transaction reference is required' });
  }

  const reference = referenceParam.trim();

  try {
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        order_number,
        financial_status,
        fulfillment_status,
        subtotal,
        shipping_amount,
        discount_amount,
        total_amount,
        email,
        phone,
        payment_method,
        payment_reference,
        created_at,
        shipping_address,
        items:order_items (
          id,
          product_name,
          sku,
          quantity,
          price,
          subtotal,
          product_image_url
        )
      `)
      .or(`order_number.eq.${reference},payment_reference.eq.${reference}`)
      .maybeSingle();

    if (error) {
      console.error('[Paystack Status] Database error:', error);
      return res.status(500).json({ error: 'Failed to retrieve order status' });
    }

    if (!order) {
      return res.status(200).json({ exists: false, reference });
    }

    // Return the verified order status to the callback page
    return res.status(200).json({
      exists: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        financialStatus: order.financial_status,
        fulfillmentStatus: order.fulfillment_status,
        totalAmount: Number(order.total_amount),
        email: order.email,
        phone: order.phone,
        paymentMethod: order.payment_method,
        paymentReference: order.payment_reference,
        createdAt: order.created_at,
        shippingAddress: order.shipping_address,
        items: order.items || [],
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Status lookup failed';
    console.error('[Paystack Status] Error:', message);
    return res.status(500).json({ error: message });
  }
}
