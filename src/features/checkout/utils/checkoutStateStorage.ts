import type { CheckoutAddressForm, CheckoutStep } from '../hooks/useCheckout';

export interface PreservedCheckoutState {
  addressForm: CheckoutAddressForm;
  selectedAddressId: string | null;
  selectedShippingMethodId: string;
  paymentMethod: 'paystack' | 'flutterwave' | 'korapay' | 'bank_transfer';
  orderNotes: string;
  couponCode: string;
  appliedCoupon: { code: string; discount: number; message: string } | null;
  currentStep: CheckoutStep;
  timestamp: number;
}

const STORAGE_KEY = 'philz_preserved_checkout_state';
const MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24 hours

export const checkoutStateStorage = {
  save(state: Omit<PreservedCheckoutState, 'timestamp'>): void {
    try {
      const payload: PreservedCheckoutState = {
        ...state,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota or disabled errors
    }
  },

  load(): PreservedCheckoutState | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PreservedCheckoutState;
      if (Date.now() - parsed.timestamp > MAX_AGE_MS) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  clear(): void {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  },
};
