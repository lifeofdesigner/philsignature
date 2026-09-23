import { ValidationError } from '@/errors/ValidationError';
import { settingsService } from '@/services/SettingsService';

export interface BankTransferConfig {
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
  swiftBic?: string;
  currency: string;
  instructions: string;
}

export type SupportedGateway = 'paystack' | 'flutterwave' | 'korapay';

export interface GatewayCheckoutOptions {
  email: string;
  phone?: string;
  name: string;
  amount: number; // in NGN
  reference: string;
  metadata?: Record<string, unknown>;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

interface PaymentGatewaysPublicSettings {
  paystack_enabled: boolean;
  paystack_mode: 'test' | 'live';
  flutterwave_enabled: boolean;
  flutterwave_mode: 'test' | 'live';
  korapay_enabled: boolean;
  korapay_mode: 'test' | 'live';
  bank_transfer_enabled: boolean;
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_swift_code: string;
  bank_transfer_instructions: string;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        currency?: string;
        metadata?: Record<string, unknown>;
        callback: (response: { reference: string; status: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
    FlutterwaveCheckout?: (options: {
      public_key: string;
      tx_ref: string;
      amount: number;
      currency: string;
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
      callback: (data: { transaction_id: string; tx_ref: string; status: string }) => void;
      onclose: () => void;
    }) => void;
    Korapay?: {
      initialize: (options: {
        key: string;
        reference: string;
        amount: number;
        currency: string;
        customer: { name: string; email: string };
        onClose: () => void;
        onSuccess: (data: { reference: string; status: string }) => void;
      }) => void;
    };
  }
}

const GATEWAY_SCRIPTS: Record<SupportedGateway, string> = {
  paystack: 'https://js.paystack.co/v1/inline.js',
  flutterwave: 'https://checkout.flutterwave.com/v1/inline.js',
  korapay: 'https://korablobstorage.blob.core.windows.net/checkoutwidget/korapay-collections.min.js',
};

export class PaymentService {
  private publicSettingsCache: PaymentGatewaysPublicSettings | null = null;

  private async getPublicSettings(): Promise<PaymentGatewaysPublicSettings> {
    if (!this.publicSettingsCache) {
      const stored = await settingsService.getSetting<Partial<PaymentGatewaysPublicSettings>>('payment_gateways');
      this.publicSettingsCache = {
        paystack_enabled: stored?.paystack_enabled ?? true,
        paystack_mode: stored?.paystack_mode ?? 'test',
        flutterwave_enabled: stored?.flutterwave_enabled ?? false,
        flutterwave_mode: stored?.flutterwave_mode ?? 'test',
        korapay_enabled: stored?.korapay_enabled ?? false,
        korapay_mode: stored?.korapay_mode ?? 'test',
        bank_transfer_enabled: stored?.bank_transfer_enabled ?? true,
        bank_name: stored?.bank_name || 'Guaranty Trust Bank (GTBank)',
        account_number: stored?.account_number || '0829143892',
        account_name: stored?.account_name || 'PHILZ SIGNATURE HAUTE PARFUMS',
        bank_swift_code: stored?.bank_swift_code || '',
        bank_transfer_instructions:
          stored?.bank_transfer_instructions ||
          'Please transfer the exact total amount to the boutique account above. State your Order Number as the transfer narration / remarks. Your allocation will be secured immediately upon receipt.',
      };
    }
    return this.publicSettingsCache;
  }

  async getBankTransferConfig(): Promise<BankTransferConfig> {
    const settings = await this.getPublicSettings();
    return {
      bankName: settings.bank_name,
      accountName: settings.account_name,
      accountNumber: settings.account_number,
      swiftBic: settings.bank_swift_code || undefined,
      currency: 'NGN',
      instructions: settings.bank_transfer_instructions,
    };
  }

  /** Returns the public key + live/test mode for a gateway, needed client-side for its inline widget. */
  private async getPublicKey(gateway: SupportedGateway): Promise<{ key: string; mode: 'test' | 'live' } | null> {
    const settings = await this.getPublicSettings();
    const enabled = settings[`${gateway}_enabled` as keyof PaymentGatewaysPublicSettings];
    if (!enabled) return null;
    const mode = settings[`${gateway}_mode` as keyof PaymentGatewaysPublicSettings] as 'test' | 'live';

    const secretConfig = await settingsService.getSetting<Record<string, string>>('payment_gateway_secrets');
    const keyField = `${gateway}_${mode}_public_key`;
    const key = secretConfig?.[keyField] || '';
    if (!key) return null;
    return { key, mode };
  }

  private loadScript(src: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /** Verifies a completed transaction server-side and marks the order paid. Never trust client callbacks alone. */
  async verifyPayment(
    gateway: SupportedGateway,
    reference: string,
    orderId: string
  ): Promise<{ success: boolean; reason?: string }> {
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gateway, reference, orderId }),
    });
    return res.json();
  }

  async initializeCheckout(gateway: SupportedGateway, options: GatewayCheckoutOptions): Promise<void> {
    if (!options.email || !options.amount) {
      throw new ValidationError('Email and amount are required for a gateway transaction');
    }

    const publicKey = await this.getPublicKey(gateway);
    if (!publicKey) {
      throw new ValidationError(
        `${gateway.charAt(0).toUpperCase() + gateway.slice(1)} is not configured. Please choose a different payment method.`
      );
    }

    const loaded = await this.loadScript(GATEWAY_SCRIPTS[gateway]);
    if (!loaded) {
      throw new ValidationError(
        `Could not load the ${gateway} checkout. Please check your connection and try again, or choose a different payment method.`
      );
    }

    if (gateway === 'paystack') {
      if (!window.PaystackPop) throw new ValidationError('Paystack checkout failed to initialize.');
      const handler = window.PaystackPop.setup({
        key: publicKey.key,
        email: options.email,
        amount: Math.round(options.amount * 100),
        ref: options.reference,
        currency: 'NGN',
        metadata: options.metadata,
        callback: (response) => options.onSuccess(response.reference),
        onClose: () => options.onCancel(),
      });
      handler.openIframe();
      return;
    }

    if (gateway === 'flutterwave') {
      if (!window.FlutterwaveCheckout) throw new ValidationError('Flutterwave checkout failed to initialize.');
      window.FlutterwaveCheckout({
        public_key: publicKey.key,
        tx_ref: options.reference,
        amount: options.amount,
        currency: 'NGN',
        customer: {
          email: options.email,
          phone_number: options.phone,
          name: options.name,
        },
        customizations: {
          title: 'PHILZ SIGNATURE',
          description: `Order #${options.reference}`,
          logo: `${window.location.origin}/favicon.svg`,
        },
        callback: (data) => options.onSuccess(data.tx_ref || String(data.transaction_id)),
        onclose: () => options.onCancel(),
      });
      return;
    }

    if (gateway === 'korapay') {
      if (!window.Korapay) throw new ValidationError('Korapay checkout failed to initialize.');
      window.Korapay.initialize({
        key: publicKey.key,
        reference: options.reference,
        amount: options.amount,
        currency: 'NGN',
        customer: { name: options.name, email: options.email },
        onSuccess: (data) => options.onSuccess(data.reference),
        onClose: () => options.onCancel(),
      });
    }
  }
}

export const paymentService = new PaymentService();
