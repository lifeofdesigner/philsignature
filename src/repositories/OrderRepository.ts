import { BaseRepository } from './BaseRepository';
import type { Order } from '@/types/database';
import type { CreateOrderInput } from '@/schemas/order.schema';

export class OrderRepository extends BaseRepository {
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

  async findByOrderNumber(orderNumber: string, email: string): Promise<Order | null> {
    try {
      const { data, error } = await this.client
        .from('orders')
        .select('*, items:order_items(*), timeline:order_timeline(*)')
        .ilike('order_number', orderNumber.trim())
        .ilike('email', email.trim())
        .single();

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
        .select('*, items:order_items(*)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) this.handleError(error, 'Failed to fetch customer orders');
      return (data as Order[]) || [];
    } catch (err) {
      this.handleError(err, 'Error fetching customer acquisitions');
    }
  }

  async create(input: CreateOrderInput, financialSummary: { subtotal: number; shipping: number; discount: number; tax: number; total: number; orderNumber: string }): Promise<Order> {
    try {
      const { data: order, error: orderError } = await this.client
        .from('orders')
        .insert({
          order_number: financialSummary.orderNumber,
          customer_id: input.customer_id,
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
        })
        .select()
        .single();

      if (orderError) this.handleError(orderError, 'Failed to insert order header');

      // Insert line items
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
      if (itemsError) this.handleError(itemsError, 'Failed to insert order line items');

      return order as Order;
    } catch (err) {
      this.handleError(err, 'Failed to create order in database');
    }
  }

  async updateStatus(id: string, updates: { financial_status?: string; fulfillment_status?: string }): Promise<Order> {
    try {
      const { data, error } = await this.client
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) this.handleError(error, `Failed to update order status ${id}`);
      return data as Order;
    } catch (err) {
      this.handleError(err, `Error updating order status ${id}`);
    }
  }
}

export const orderRepository = new OrderRepository();

