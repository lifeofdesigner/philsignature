export const PAYMENT_GATEWAYS = {
  PAYSTACK: 'paystack',
  FLUTTERWAVE: 'flutterwave',
  BANK_TRANSFER: 'bank_transfer',
  COD: 'cod',
} as const;

export type AppPaymentGateway = (typeof PAYMENT_GATEWAYS)[keyof typeof PAYMENT_GATEWAYS];

