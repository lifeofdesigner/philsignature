export class TransactionRef {
  private readonly value: string;

  constructor(value: string) {
    if (!value || value.trim().length < 6) {
      throw new Error('Transaction reference must be at least 6 characters long');
    }
    this.value = value.trim();
  }

  static generate(prefix: string = 'TXN'): TransactionRef {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return new TransactionRef(`${prefix}_${timestamp}_${random}`.toUpperCase());
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}

