import { Address } from '../../order/valueObjects/Address';
import type { ShippingStatus } from '@/types/database';

export interface ShipmentProps {
  id: string;
  orderId: string;
  trackingNumber?: string | null;
  carrier: string;
  status: ShippingStatus;
  destination: Address;
  estimatedDelivery?: string | null;
  dispatchedAt?: string | null;
  deliveredAt?: string | null;
}

export class ShipmentEntity {
  private props: ShipmentProps;

  constructor(props: ShipmentProps) {
    this.props = { ...props };
  }

  get id(): string {
    return this.props.id;
  }

  get trackingNumber(): string | null {
    return this.props.trackingNumber || null;
  }

  get status(): ShippingStatus {
    return this.props.status;
  }

  dispatch(trackingNumber: string): void {
    this.props.trackingNumber = trackingNumber;
    this.props.status = 'shipped';
    this.props.dispatchedAt = new Date().toISOString();
  }

  deliver(): void {
    this.props.status = 'delivered';
    this.props.deliveredAt = new Date().toISOString();
  }

  toDTO(): ShipmentProps {
    return { ...this.props };
  }
}
