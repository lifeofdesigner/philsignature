import { BaseRepository } from './BaseRepository';
import type { Order } from '@/types/database';
import type { CreateOrderInput } from '@/schemas/order.schema';

export interface OrderFinancialSummary {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  orderNumber: string;
}

export class OrderRepository extends BaseRepository {
  async findAllAdmin(): Promise<Order[]> {
    try {
      const { data, error } = await this.client
        .from('orders')
        .select('*, items:order_items(*), timeline:order_timeline(*)')
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'Failed to fetch orders');
      return (data as Order[]) || [];
    } catch (err) {
      this.handleError(err, 'Error fetching orders');
    }
  }

  async updateFulfillmentStatus(orderId: string, status: Order['fulfillment_status']): Promise<Order> {
    try {
      const { data, error } = await this.client
        .from('orders')
        .update({ fulfillment_status: status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) this.handleError(error, `Failed to update fulfillment status for order ${orderId}`);
      return data as Order;
    } catch (err) {
      this.handleError(err, `Error updating order fulfillment status: ${orderId}`);
    }
  }

  async findById(id: string): Promise<Order | null> {
    try {
      const { data, error } = await this.client
        .from('orders')
        .select('*, items:order_items(*), timeline:order_timeline(*)')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        this.handleError(error, `Failed to load order ${id}`);
      }
      return data as Order;
    } catch (err) {
      this.handleError(err, `Error loading order ${id}`);
    }
  }

  async findByOrderNumber(orderNumber: string, email?: string): Promise<Order | null> {
    try {
      let query = this.client
        .from('orders')
        .select('*, items:order_items(*), timeline:order_timeline(*)')
        .ilike('order_number', orderNumber.trim());

      if (email && email.trim() !== '') {
        query = query.ilike('email', email.trim());
      }

      const { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        this.handleError(error, 'Order tracking query failed');
      }
      return data as Order;
    } catch (err) {
      this.handleError(err, 'Error tracking consignment');
    }
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    try {
      const { data, error } = await this.client
        .from('orders')
        .select('*, items:order_items(*), timeline:order_timeline(*)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'Failed to fetch customer orders');
      return (data as Order[]) || [];
    } catch (err) {
      this.handleError(err, 'Error fetching customer acquisitions');
    }
  }

  async create(input: CreateOrderInput, financialSummary: OrderFinancialSummary): Promise<Order> {
    let createdOrderId: string | null = null;
    const decrementedProducts: { productId: string; quantity: number }[] = [];

    try {
      // 1. Insert Order Header
      const { data: order, error: orderError } = await this.client
        .from('orders')
        .insert({
          order_number: financialSummary.orderNumber,
          customer_id: input.customer_id || null,
          email: input.email,
          phone: input.phone,
          financial_status: 'pending',
          fulfillment_status: 'pending',
          subtotal: financialSummary.subtotal,
          shipping_amount: financialSummary.shipping,
          discount_amount: financialSummary.discount,
          tax_amount: financialSummary.tax,
          total_amount: financialSummary.total,
          payment_method: input.payment_method,
          shipping_address: input.shipping_address,
          billing_address: input.billing_address || input.shipping_address,
          notes: input.notes || null,
          coupon_code: input.coupon_code || null,
        })
        .select()
        .single();

      if (orderError) this.handleError(orderError, 'Failed to insert order header');
      createdOrderId = order.id;

      // 2. Insert Line Items
      const itemsToInsert = input.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_slug: item.product_slug,
        product_image_url: item.product_image_url,
        sku: item.sku,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await this.client.from('order_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      // 3. Insert Initial Timeline
      const { error: timelineError } = await this.client.from('order_timeline').insert({
        order_id: order.id,
        status: 'pending',
        title: 'Order Transmitted to Atelier',
        description: `Order ${financialSummary.orderNumber} placed via ${input.payment_method}. Awaiting payment settlement.`,
      });
      if (timelineError) console.warn('Order timeline insert warning:', timelineError);

      // 4. Atomic Inventory Deduction (with transaction rollback on failure)
      for (const item of input.items) {
        const { error: stockError } = await this.client.rpc('decrement_product_stock', {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });

        if (stockError) {
          throw new Error(`Inventory allocation exhausted for ${item.product_name}: ${stockError.message}`);
        }
        decrementedProducts.push({ productId: item.product_id, quantity: item.quantity });
      }

      return order as Order;
    } catch (err) {
      // 5. TRANSACTION ROLLBACK ON FAILURE
      // If order was created, roll back inventory & delete order
      if (decrementedProducts.length > 0) {
        for (const dec of decrementedProducts) {
          try {
            await this.client.rpc('increment_product_stock', {
              p_product_id: dec.productId,
              p_quantity: dec.quantity,
            });
          } catch {
            // best effort rollback
          }
        }
      }

      if (createdOrderId) {
        try {
          await this.client.from('order_items').delete().eq('order_id', createdOrderId);
          await this.client.from('order_timeline').delete().eq('order_id', createdOrderId);
          await this.client.from('orders').delete().eq('id', createdOrderId);
        } catch {
          // best effort rollback
        }
      }

      this.handleError(err, 'Failed to complete order transaction in database');
    }
  }

  async updatePayment(orderId: string, reference: string, financialStatus: 'paid' | 'pending' | 'failed'): Promise<Order> {
    try {
      const { data, error } = await this.client
        .from('orders')
        .update({
          payment_reference: reference,
          financial_status: financialStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) this.handleError(error, `Failed to update payment status for order ${orderId}`);
      return data as Order;
    } catch (err) {
      this.handleError(err, `Error updating order payment reference: ${orderId}`);
    }
  }

  async addTimeline(orderId: string, status: string, title: string, description: string): Promise<void> {
    try {
      const { error } = await this.client.from('order_timeline').insert({
        order_id: orderId,
        status,
        title,
        description,
      });

      if (error) this.handleError(error, 'Failed to insert timeline milestone');
    } catch (err) {
      console.warn('Order timeline insertion non-critical error:', err);
    }
  }
}

export const orderRepository = new OrderRepository();
