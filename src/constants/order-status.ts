export const FINANCIAL_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const;

export const FULFILLMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PACKED: 'packed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export type AppFinancialStatus = (typeof FINANCIAL_STATUS)[keyof typeof FINANCIAL_STATUS];
export type AppFulfillmentStatus = (typeof FULFILLMENT_STATUS)[keyof typeof FULFILLMENT_STATUS];

