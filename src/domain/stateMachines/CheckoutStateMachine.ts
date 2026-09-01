export type CheckoutState =
  | 'idle'
  | 'contact_info_entered'
  | 'delivery_address_set'
  | 'shipping_method_selected'
  | 'payment_method_selected'
  | 'payment_processing'
  | 'completed'
  | 'failed';

export class CheckoutStateMachine {
  private static readonly transitions: Record<CheckoutState, CheckoutState[]> = {
    idle: ['contact_info_entered'],
    contact_info_entered: ['idle', 'delivery_address_set'],
    delivery_address_set: ['contact_info_entered', 'shipping_method_selected'],
    shipping_method_selected: ['delivery_address_set', 'payment_method_selected'],
    payment_method_selected: ['shipping_method_selected', 'payment_processing'],
    payment_processing: ['completed', 'failed', 'payment_method_selected'],
    completed: [],
    failed: ['payment_method_selected'],
  };

  static canTransition(current: CheckoutState, next: CheckoutState): boolean {
    const allowed = this.transitions[current] || [];
    return allowed.includes(next);
  }

  static transition(current: CheckoutState, next: CheckoutState): CheckoutState {
    if (!this.canTransition(current, next)) {
      throw new Error(`Invalid checkout state transition: cannot change from "${current}" to "${next}"`);
    }
    return next;
  }
}

