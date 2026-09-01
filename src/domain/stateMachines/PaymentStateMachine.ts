import type { PaymentStatus } from '@/types/database';

export class PaymentStateMachine {
  private static readonly transitions: Record<PaymentStatus, PaymentStatus[]> = {
    pending: ['paid', 'failed'],
    paid: ['refunded'],
    failed: ['pending'],
    refunded: [],
  };

  static canTransition(current: PaymentStatus, next: PaymentStatus): boolean {
    const allowed = this.transitions[current] || [];
    return allowed.includes(next);
  }

  static transition(current: PaymentStatus, next: PaymentStatus): PaymentStatus {
    if (!this.canTransition(current, next)) {
      throw new Error(`Invalid payment state transition: cannot change from "${current}" to "${next}"`);
    }
    return next;
  }
}
