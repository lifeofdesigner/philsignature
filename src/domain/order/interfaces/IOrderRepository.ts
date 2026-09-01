import type { Order } from '@/types/database';
import type { CreateOrderInput } from '@/schemas/order.schema';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string, email: string): Promise<Order | null>;
  findByCustomerId(customerId: string): Promise<Order[]>;
  create(input: CreateOrderInput, calculated: { subtotal: number; shipping: number; discount: number; tax: number; total: number; orderNumber: string }): Promise<Order>;
  updateStatus(id: string, status: string): Promise<Order>;
}
