export class OrderNumber {
  private readonly value: string;

  constructor(value: string) {
    if (!OrderNumber.isValid(value)) {
      throw new Error(`Invalid order reference format: ${value}. Expected format: PS-XXXXXX`);
    }
    this.value = value.toUpperCase();
  }

  static isValid(candidate: string): boolean {
    return /^PS-[A-Z0-9]{4,10}$/i.test(candidate.trim());
  }

  static generate(): OrderNumber {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return new OrderNumber(`PS-${randomSuffix}`);
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}
