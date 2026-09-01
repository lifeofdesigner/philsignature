import type { OrderStatus } from '@/types/database';

export class OrderStateMachine {
  private static readonly transitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['processing', 'cancelled'],
    processing: ['packed', 'cancelled'],
    packed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  static canTransition(current: OrderStatus, next: OrderStatus): boolean {
    const allowed = this.transitions[current] || [];
    return allowed.includes(next);
  }

  static transition(current: OrderStatus, next: OrderStatus): OrderStatus {
    if (!this.canTransition(current, next)) {
      throw new Error(`Invalid order state transition: cannot change from "${current}" to "${next}"`);
    }
    return next;
  }

  static isTerminal(status: OrderStatus): boolean {
    return status === 'delivered' || status === 'cancelled';
  }

  static getAllowedTransitions(current: OrderStatus): OrderStatus[] {
    return [...(this.transitions[current] || [])];
  }
}

