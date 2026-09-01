import { orderRepository, type OrderRepository } from '@/repositories/OrderRepository';
import { createOrderSchema } from '@/schemas/order.schema';
import { ValidationError } from '@/errors/ValidationError';
import type { Order } from '@/types/database';

export class OrderService {
  constructor(private repo: OrderRepository = orderRepository) {}

  async trackOrder(orderNumber: string, email: string): Promise<Order | null> {
    if (!orderNumber || !email) {
      throw new ValidationError('Order number and email are required for consignment tracking');
    }
    return this.repo.findByOrderNumber(orderNumber, email);
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    if (!customerId) throw new ValidationError('Customer ID required');
    return this.repo.findByCustomerId(customerId);
  }

  async placeOrder(rawInput: unknown): Promise<Order> {
    const parseResult = createOrderSchema.safeParse(rawInput);
    if (!parseResult.success) {
      throw new ValidationError('Invalid order checkout details', parseResult.error.format());
    }
    const input = parseResult.data;

    // Mathematical integrity calculation on service tier
    const subtotal = input.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subtotal >= 150000 ? 0 : 5000;
    const discount = 0; // calculated with coupons
    const tax = 0;
    const total = subtotal + shipping - discount + tax;

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderNumber = `PS-${randomSuffix}`;

    return this.repo.create(input, {
      subtotal,
      shipping,
      discount,
      tax,
      total,
      orderNumber,
    });
  }
}

export const orderService = new OrderService();

