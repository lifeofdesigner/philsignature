import { supabaseAdmin } from './supabaseAdmin';

interface MarkOrderPaidParams {
  orderId?: string;
  orderNumber?: string;
  reference: string;
  gateway: string;
  amountNaira: number;
  toleranceNaira?: number;
}

export async function markOrderPaid(params: MarkOrderPaidParams) {
  const { orderId, orderNumber, reference, gateway, amountNaira, toleranceNaira = 1 } = params;

  let query = supabaseAdmin.from('orders').select('id, financial_status, total_amount');
  if (orderId) query = query.eq('id', orderId);
  else if (orderNumber) query = query.eq('order_number', orderNumber);
  else throw new Error('orderId or orderNumber is required');

  const { data: order, error } = await query.maybeSingle();
  if (error || !order) return { success: false, reason: 'Order not found' };

  if (order.financial_status === 'paid') return { success: true, alreadyConfirmed: true };

  if (Math.abs(amountNaira - Number(order.total_amount)) > toleranceNaira) {
    return {
      success: false,
      reason: `Amount mismatch: gateway reports ${amountNaira}, order total is ${order.total_amount}`,
    };
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({ financial_status: 'paid', payment_reference: reference, updated_at: new Date().toISOString() })
    .eq('id', order.id)
    .select()
    .single();

  if (updateError) return { success: false, reason: 'Verified but failed to update order' };

  await supabaseAdmin.from('order_timeline').insert({
    order_id: order.id,
    status: 'paid',
    title: 'Payment Confirmed',
    description: `Payment verified via ${gateway}. Reference: ${reference}.`,
  });

  return { success: true, order: updated };
}
