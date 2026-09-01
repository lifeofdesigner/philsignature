export interface ProductCreatedPayload {
  productId: string;
  title: string;
  sku: string;
  price: number;
  initialStock: number;
  timestamp: string;
}

export interface OrderPlacedPayload {
  orderId: string;
  orderNumber: string;
  customerId?: string | null;
  total: number;
  itemCount: number;
  timestamp: string;
}

export interface PaymentCompletedPayload {
  paymentId: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  gateway: string;
  reference: string;
  timestamp: string;
}

export interface CMSUpdatedPayload {
  key: string;
  section: string;
  title: string;
  timestamp: string;
}

export interface InventoryChangedPayload {
  productId: string;
  sku: string;
  previousStock: number;
  newStock: number;
  reason: 'sale' | 'restock' | 'adjustment' | 'return';
  timestamp: string;
}

export type DomainEventMap = {
  'ProductCreated': ProductCreatedPayload;
  'OrderPlaced': OrderPlacedPayload;
  'PaymentCompleted': PaymentCompletedPayload;
  'CMSUpdated': CMSUpdatedPayload;
  'InventoryChanged': InventoryChangedPayload;
};

export type DomainEventName = keyof DomainEventMap;
export type EventHandler<T> = (payload: T) => void | Promise<void>;

