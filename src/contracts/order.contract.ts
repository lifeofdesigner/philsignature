import type { Order } from '@/types/database';

export interface OrderDetailResponseContract {
  success: boolean;
  data: Order | null;
  error?: string;
}

export interface OrderListResponseContract {
  success: boolean;
  data: Order[];
  total: number;
}

export interface OrderCreationResponseContract {
  success: boolean;
  orderNumber: string;
  data?: Order;
  paymentRedirectUrl?: string;
  message: string;
}

