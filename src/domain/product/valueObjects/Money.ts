export class Money {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string = 'NGN') {
    if (amount < 0) {
      throw new Error('Monetary amount cannot be negative');
    }
    this.amount = Math.round(amount * 100) / 100;
    this.currency = currency;
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  format(locale: string = 'en-NG'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }

  add(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new Error(`Currency mismatch: cannot add ${other.currency} to ${this.currency}`);
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    if (other.currency !== this.currency) {
      throw new Error(`Currency mismatch: cannot subtract ${other.currency} from ${this.currency}`);
    }
    if (this.amount - other.amount < 0) {
      throw new Error('Resulting money amount cannot be negative');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(quantity: number): Money {
    if (quantity < 0) {
      throw new Error('Multiplier cannot be negative');
    }
    return new Money(this.amount * quantity, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }
}
