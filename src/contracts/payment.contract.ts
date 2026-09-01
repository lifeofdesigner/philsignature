export interface PaymentInitializationRequestContract {
  orderId: string;
  orderNumber: string;
  amount: number;
  email: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentInitializationResponseContract {
  success: boolean;
  reference: string;
  authorizationUrl?: string;
  accessCode?: string;
  message: string;
}

export interface PaymentVerificationResponseContract {
  success: boolean;
  status: 'completed' | 'failed' | 'pending' | 'abandoned';
  reference: string;
  amount: number;
  channel?: string;
  paidAt?: string;
  message: string;
}

