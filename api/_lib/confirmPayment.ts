import { supabaseAdmin } from './supabaseAdmin';

export interface MarkOrderPaidParams {
  orderId?: string;
  orderNumber?: string;
  reference: string;
  gateway: string;
  amountNaira: number;
  toleranceNaira?: number;
  paystackDetails?: Record<string, unknown>;
}

export async function markOrderPaid(params: MarkOrderPaidParams) {
  const { orderId, orderNumber, reference, gateway, amountNaira, toleranceNaira = 2, paystackDetails } = params;

  let query = supabaseAdmin.from('orders').select('*, items:order_items(*)');
  if (orderId) query = query.eq('id', orderId);
  else if (orderNumber) query = query.eq('order_number', orderNumber);
  else throw new Error('orderId or orderNumber is required');

  const { data: order, error } = await query.maybeSingle();
  if (error || !order) return { success: false, reason: 'Order not found' };

  // IDEMPOTENCY: Safely return existing paid order without re-processing
  if (order.financial_status === 'paid') {
    return { success: true, alreadyConfirmed: true, order };
  }

  const orderTotal = Number(order.total_amount);
  if (Math.abs(amountNaira - orderTotal) > toleranceNaira) {
    return {
      success: false,
      reason: `Amount mismatch: gateway reports ${amountNaira}, order total is ${orderTotal}`,
      order,
    };
  }

  const verificationNote = `[${gateway.toUpperCase()} Webhook Verified] Ref: ${reference}, Amount: ₦${amountNaira.toLocaleString()} at ${new Date().toISOString()}`;
  const updatedAdminNotes = order.admin_notes
    ? `${order.admin_notes}\n${verificationNote}`
    : verificationNote;

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      financial_status: 'paid',
      payment_reference: reference,
      admin_notes: updatedAdminNotes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)
    .select('*, items:order_items(*)')
    .single();

  if (updateError) return { success: false, reason: 'Verified but failed to update order' };

  // Update payment_transactions row status if exists
  try {
    await supabaseAdmin
      .from('payment_transactions')
      .update({
        status: 'success',
        updated_at: new Date().toISOString(),
        gateway_response: paystackDetails || { status: 'success', reference },
      })
      .eq('reference', reference);
  } catch (txErr) {
    console.warn('payment_transactions status update skipped:', txErr);
  }

  // 1. Order Timeline Milestone
  await supabaseAdmin.from('order_timeline').insert({
    order_id: order.id,
    status: 'paid',
    title: 'Payment Confirmed',
    description: `Payment verified via ${gateway.toUpperCase()} (Single Source of Truth). Reference: ${reference}.`,
  });

  // 2. Activity Log
  try {
    await supabaseAdmin.from('activity_logs').insert({
      action: 'payment_confirmed',
      entity_type: 'order',
      entity_id: order.id,
      details: {
        gateway,
        reference,
        amountNaira,
        orderNumber: order.order_number,
        paystackDetails: paystackDetails || null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (logErr) {
    console.warn('Activity log insert skipped:', logErr);
  }

  // 3. Admin Notification
  try {
    await supabaseAdmin.from('notifications').insert({
      type: 'order_paid',
      title: `New Paid Order #${order.order_number}`,
      message: `Order #${order.order_number} (₦${orderTotal.toLocaleString()}) confirmed via ${gateway.toUpperCase()}.`,
      link: `/admin/orders`,
      is_read: false,
    });
  } catch (notifErr) {
    console.warn('Admin notification insert skipped:', notifErr);
  }

  // 4. Dispatch transactional communications (customer + admin notifications)
  try {
    const { sendAllTransactionalEmails } = await import('./emailService');
    await sendAllTransactionalEmails(
      updated,
      updated.items || [],
      {
        reference,
        amountNaira,
        gateway,
        paidAt: new Date().toISOString(),
      }
    );
  } catch (emailErr) {
    console.warn('Transactional email dispatch skipped/failed:', emailErr);
  }

  return { success: true, order: updated };
}
