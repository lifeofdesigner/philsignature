export interface AddressProps {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  phone: string;
}

export class Address {
  private readonly props: Readonly<AddressProps>;

  constructor(props: AddressProps) {
    if (!props.firstName || !props.lastName) {
      throw new Error('Full recipient name is required for delivery');
    }
    if (!props.addressLine1 || !props.city || !props.state) {
      throw new Error('Street address, city, and state are required');
    }
    if (!props.phone) {
      throw new Error('Recipient contact phone is mandatory for courier dispatch');
    }
    this.props = Object.freeze({ ...props });
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`.trim();
  }

  get formatted(): string {
    const lines = [
      this.fullName,
      this.props.addressLine1,
      this.props.addressLine2,
      `${this.props.city}, ${this.props.state}`,
      this.props.country,
      `Tel: ${this.props.phone}`,
    ];
    return lines.filter(Boolean).join('\n');
  }

  toDTO(): AddressProps {
    return { ...this.props };
  }
}

