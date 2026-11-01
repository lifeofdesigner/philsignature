import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { getCallerProfile, isStaffTier, isSuperAdmin, logAdminAction } from '../_lib/requireAdmin.js';
import { checkRateLimit } from '../_lib/rateLimit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!checkRateLimit(req, res, 60, 60000, 'admin_api')) {
    return;
  }

  const caller = await getCallerProfile(req);
  if (!caller || !isStaffTier(caller.role)) {
    res.status(403).json({ error: 'Not authorized' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const action = (req.query.action || req.body?.action) as string | undefined;

  // CONFIRM PAYMENT (staff + admin + super_admin)
  if (action === 'confirm-payment') {
    const { orderId, reference } = req.body || {};
    if (!orderId) {
      res.status(400).json({ error: 'orderId is required' });
      return;
    }

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .maybeSingle();

    if (orderErr || !order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.financial_status === 'paid') {
      res.status(200).json({ success: true, order, alreadyConfirmed: true });
      return;
    }

    const ref = reference || `MANUAL-${caller.email || 'admin'}-${Date.now()}`;
    const nextFulfillment = order.fulfillment_status === 'pending' ? 'processing' : order.fulfillment_status;

    const { data: updated, error: updateErr } = await supabaseAdmin
      .from('orders')
      .update({
        financial_status: 'paid',
        fulfillment_status: nextFulfillment,
        payment_reference: ref,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select('*, items:order_items(*)')
      .single();

    if (updateErr) {
      res.status(500).json({ error: updateErr.message });
      return;
    }

    await supabaseAdmin.from('order_timeline').insert({
      order_id: orderId,
      status: 'paid',
      title: 'Payment Confirmed',
      description: `Payment confirmed successfully via MANUAL BANK TRANSFER (Ref: ${ref}). Order verified and now being processed.`,
    });

    await logAdminAction(caller, 'CONFIRM_BANK_TRANSFER', 'order', orderId, { reference: ref }, req);

    try {
      const { sendPaymentConfirmationEmail } = await import('../_lib/emailService.js');
      await sendPaymentConfirmationEmail(updated, {
        reference: ref,
        amountNaira: Number(updated.total_amount),
        gateway: 'Manual Bank Transfer',
        paidAt: new Date().toISOString(),
      });
    } catch (emailErr) {
      console.warn('Payment confirmed email dispatch error:', emailErr);
    }

    res.status(200).json({ success: true, order: updated });
    return;
  }

  // ARCHIVE (admin + super_admin)
  if (action === 'archive') {
    const { orderId } = req.body || {};
    if (!orderId) {
      res.status(400).json({ error: 'orderId is required' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ archived: true, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAdminAction(caller, 'ARCHIVE_ORDER', 'order', orderId, undefined, req);
    res.status(200).json({ success: true });
    return;
  }

  // UNARCHIVE (admin + super_admin)
  if (action === 'unarchive') {
    const { orderId } = req.body || {};
    if (!orderId) {
      res.status(400).json({ error: 'orderId is required' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ archived: false, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAdminAction(caller, 'UNARCHIVE_ORDER', 'order', orderId, undefined, req);
    res.status(200).json({ success: true });
    return;
  }

  // BULK ARCHIVE (admin + super_admin)
  if (action === 'bulk-archive') {
    const { orderIds, archived } = req.body || {};
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      res.status(400).json({ error: 'orderIds array is required' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .update({ archived: archived !== false, updated_at: new Date().toISOString() })
      .in('id', orderIds);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAdminAction(caller, 'BULK_ARCHIVE_ORDERS', 'order', undefined, { orderIds, archived: archived !== false }, req);
    res.status(200).json({ success: true });
    return;
  }

  // DELETE (super_admin only - permanent)
  if (action === 'delete') {
    if (!isSuperAdmin(caller.role)) {
      res.status(403).json({ error: 'Only a Super Administrator can permanently delete orders' });
      return;
    }

    const { orderId } = req.body || {};
    if (!orderId) {
      res.status(400).json({ error: 'orderId is required' });
      return;
    }

    await supabaseAdmin.from('order_items').delete().eq('order_id', orderId);
    await supabaseAdmin.from('order_timeline').delete().eq('order_id', orderId);
    const { error } = await supabaseAdmin.from('orders').delete().eq('id', orderId);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAdminAction(caller, 'DELETE_ORDER', 'order', orderId, undefined, req);
    res.status(200).json({ success: true });
    return;
  }

  // BULK DELETE (super_admin only - permanent)
  if (action === 'bulk-delete') {
    if (!isSuperAdmin(caller.role)) {
      res.status(403).json({ error: 'Only a Super Administrator can permanently delete orders' });
      return;
    }

    const { orderIds } = req.body || {};
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      res.status(400).json({ error: 'orderIds array is required' });
      return;
    }

    await supabaseAdmin.from('order_items').delete().in('order_id', orderIds);
    await supabaseAdmin.from('order_timeline').delete().in('order_id', orderIds);
    const { error } = await supabaseAdmin.from('orders').delete().in('id', orderIds);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    await logAdminAction(caller, 'BULK_DELETE_ORDERS', 'order', undefined, { orderIds }, req);
    res.status(200).json({ success: true });
    return;
  }

  res.status(400).json({ error: 'Invalid or missing action parameter' });
}
