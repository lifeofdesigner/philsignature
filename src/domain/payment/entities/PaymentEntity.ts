import { Money } from '../../product/valueObjects/Money';
import { TransactionRef } from '../valueObjects/TransactionRef';
import type { PaymentStatus } from '@/types/database';

export type PaymentGatewayType = 'paystack' | 'flutterwave' | 'korapay' | 'bank_transfer' | 'cash_on_delivery';

export interface PaymentProps {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  gateway: PaymentGatewayType;
  reference: string;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export class PaymentEntity {
  private props: PaymentProps;

  constructor(props: PaymentProps) {
    this.props = { ...props };
  }

  get id(): string {
    return this.props.id;
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get amount(): Money {
    return new Money(this.props.amount, this.props.currency);
  }

  get reference(): TransactionRef {
    return new TransactionRef(this.props.reference);
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  markSuccessful(): void {
    this.props.status = 'paid';
    this.props.updatedAt = new Date().toISOString();
  }

  markFailed(): void {
    this.props.status = 'failed';
    this.props.updatedAt = new Date().toISOString();
  }

  toDTO(): PaymentProps {
    return { ...this.props };
  }
}
