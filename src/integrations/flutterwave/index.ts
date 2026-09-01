export interface FlutterwaveInitConfig {
  public_key: string;
  tx_ref: string;
  amount: number;
  currency: string;
  payment_options?: string;
  customer: {
    email: string;
    phone_number?: string;
    name: string;
  };
  customizations?: {
    title: string;
    description: string;
    logo: string;
  };
  callback: (response: unknown) => void;
  onclose: () => void;
}

export class FlutterwaveClient {
  private publicKey: string;

  constructor(publicKey: string = '') {
    this.publicKey = publicKey;
  }

  setPublicKey(key: string): void {
    this.publicKey = key;
  }

  isConfigured(): boolean {
    return Boolean(this.publicKey && this.publicKey.startsWith('FLWPUBK_'));
  }

  initializeTransaction(config: Omit<FlutterwaveInitConfig, 'public_key'>): void {
    if (!this.isConfigured()) {
      throw new Error('Flutterwave Public Key has not been configured in boutique admin settings');
    }
    console.info('[Flutterwave Integration Initialized]', {
      tx_ref: config.tx_ref,
      amount: config.amount,
    });
  }
}

export const flutterwaveClient = new FlutterwaveClient();
