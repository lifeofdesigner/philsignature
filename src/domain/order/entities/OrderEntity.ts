import { Money } from '../../product/valueObjects/Money';
import { OrderNumber } from '../valueObjects/OrderNumber';
import { Address } from '../valueObjects/Address';
import type { OrderStatus, PaymentStatus, ShippingStatus } from '@/types/database';

export interface OrderItemProps {
  productId: string;
  productTitle: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface OrderProps {
  id: string;
  orderNumber: string;
  customerId?: string | null;
  guestEmail?: string | null;
  items: OrderItemProps[];
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export class OrderEntity {
  private props: OrderProps;

  constructor(props: OrderProps) {
    this.props = { ...props };
    this.recalculateTotals();
  }

  get id(): string {
    return this.props.id;
  }

  get orderNumber(): OrderNumber {
    return new OrderNumber(this.props.orderNumber);
  }

  get total(): Money {
    return new Money(this.props.total);
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get items(): readonly OrderItemProps[] {
    return this.props.items;
  }

  addItem(item: OrderItemProps): void {
    const existingIndex = this.props.items.findIndex((i) => i.productId === item.productId);
    if (existingIndex > -1) {
      this.props.items[existingIndex].quantity += item.quantity;
    } else {
      this.props.items.push({ ...item });
    }
    this.recalculateTotals();
  }

  recalculateTotals(): void {
    const subtotal = this.props.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    this.props.subtotal = subtotal;
    // Complimentary shipping threshold >= 150,000 NGN
    this.props.shipping = subtotal >= 150000 ? 0 : 5000;
    this.props.total = Math.max(0, this.props.subtotal + this.props.shipping - this.props.discount + this.props.tax);
    this.props.updatedAt = new Date().toISOString();
  }

  toDTO(): OrderProps {
    return { ...this.props };
  }
}
