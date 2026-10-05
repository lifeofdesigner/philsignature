import { supabaseAdmin } from './supabaseAdmin.js';

interface OrderItemSummary {
  id?: string;
  order_id: string;
  product_id?: string | null;
  product_name: string;
  sku?: string | null;
  quantity: number;
}

export async function triggerInventoryUpdate(orderId: string): Promise<{
  success: boolean;
  itemsUpdated: number;
  details: Array<{ productId: string; quantity: number; remainingStock?: number }>;
}> {
  // 1. Idempotency Guard: Check if inventory allocation was already finalized for this order
  const { data: existingTimeline } = await supabaseAdmin
    .from('order_timeline')
    .select('id')
    .eq('order_id', orderId)
    .eq('status', 'inventory_updated')
    .maybeSingle();

  if (existingTimeline) {
    return { success: true, itemsUpdated: 0, details: [] };
  }

  // 2. Fetch all line items for this order
  const { data: items, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  if (itemsError || !items || items.length === 0) {
    return { success: true, itemsUpdated: 0, details: [] };
  }

  const updatedDetails: Array<{ productId: string; quantity: number; remainingStock?: number }> = [];

  for (const item of items as OrderItemSummary[]) {
    if (!item.product_id) continue;

    // A. Decrement product stock via RPC
    const { error: rpcError } = await supabaseAdmin.rpc('decrement_product_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    });

    // If RPC failed (e.g. stock was reserved or custom restriction), adjust safely
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, name, stock_quantity')
      .eq('id', item.product_id)
      .maybeSingle();

    if (rpcError && product) {
      const newStock = Math.max(0, product.stock_quantity - item.quantity);
      await supabaseAdmin
        .from('products')
        .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
        .eq('id', item.product_id);
    }

    // B. Decrement product variant stock if variant exists
    if (item.sku) {
      try {
        const { data: variant } = await supabaseAdmin
          .from('product_variants')
          .select('id, stock_quantity')
          .eq('product_id', item.product_id)
          .eq('sku', item.sku)
          .maybeSingle();

        if (variant) {
          const newVariantStock = Math.max(0, variant.stock_quantity - item.quantity);
          await supabaseAdmin
            .from('product_variants')
            .update({ stock_quantity: newVariantStock, updated_at: new Date().toISOString() })
            .eq('id', variant.id);
        }
      } catch (variantErr) {
        console.warn('Variant stock update skipped:', variantErr);
      }
    }

    const remainingStock = product ? product.stock_quantity : undefined;
    updatedDetails.push({
      productId: item.product_id,
      quantity: item.quantity,
      remainingStock,
    });

    // C. Low stock alert for luxury inventory management
    if (remainingStock !== undefined && remainingStock <= 5) {
      try {
        await supabaseAdmin.from('notifications').insert({
          type: 'inventory_alert',
          title: `Low Stock Alert: ${item.product_name}`,
          message: `Stock level for "${item.product_name}" is currently ${remainingStock} unit(s).`,
          link: '/admin/products',
          is_read: false,
        });
      } catch {
        // non-blocking
      }
    }
  }

  // 3. Add to timeline
  await supabaseAdmin.from('order_timeline').insert({
    order_id: orderId,
    status: 'inventory_updated',
    title: 'Inventory Records Updated',
    description: `Inventory allocation confirmed for ${items.length} line item(s).`,
  });

  // 4. Activity log
  try {
    await supabaseAdmin.from('activity_logs').insert({
      action: 'inventory_updated',
      entity_type: 'order',
      entity_id: orderId,
      details: { items: updatedDetails, timestamp: new Date().toISOString() },
    });
  } catch {
    // non-blocking
  }

  return { success: true, itemsUpdated: updatedDetails.length, details: updatedDetails };
}
