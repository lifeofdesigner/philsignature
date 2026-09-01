export class Email {
  private readonly value: string;

  constructor(value: string) {
    const trimmed = value.trim().toLowerCase();
    if (!Email.isValid(trimmed)) {
      throw new Error(`Invalid email address: ${value}`);
    }
    this.value = trimmed;
  }

  static isValid(candidate: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate);
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}

