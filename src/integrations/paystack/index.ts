export interface PaystackInitConfig {
  publicKey: string;
  email: string;
  amountInKobo: number;
  reference: string;
  currency?: string;
  channels?: ('card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer')[];
  metadata?: Record<string, unknown>;
  onSuccess: (response: { reference: string; trxref: string; status: string }) => void;
  onClose: () => void;
}

export class PaystackClient {
  private publicKey: string;

  constructor(publicKey: string = '') {
    this.publicKey = publicKey;
  }

  setPublicKey(key: string): void {
    this.publicKey = key;
  }

  isConfigured(): boolean {
    return Boolean(this.publicKey && this.publicKey.startsWith('pk_'));
  }

  initializeTransaction(config: Omit<PaystackInitConfig, 'publicKey'>): void {
    if (!this.isConfigured()) {
      throw new Error('Paystack Public Key has not been configured in boutique admin settings');
    }
    // Stub ready for Phase 5 popup SDK / inline checkout integration
    console.info('[Paystack Integration Initialized]', {
      reference: config.reference,
      amount: config.amountInKobo / 100,
    });
  }
}

export const paystackClient = new PaystackClient();
