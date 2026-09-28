import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/SettingsService';

const PUBLIC_SETTINGS_KEY = 'payment_gateways';
const SECRET_SETTINGS_KEY = 'payment_gateway_secrets';
const QUERY_KEY = ['admin-settings', 'payment-gateways-full'];

export type GatewayMode = 'test' | 'live';

export interface PaymentGatewaysPublicConfig {
  paystack_enabled: boolean;
  paystack_mode: GatewayMode;
  paystack_callback_url: string;
  paystack_webhook_url: string;
  flutterwave_enabled: boolean;
  flutterwave_mode: GatewayMode;
  flutterwave_callback_url: string;
  flutterwave_webhook_url: string;
  korapay_enabled: boolean;
  korapay_mode: GatewayMode;
  korapay_webhook_url: string;
  bank_transfer_enabled: boolean;
  bank_name: string;
  account_number: string;
  account_name: string;
  bank_swift_code: string;
  bank_transfer_instructions: string;
}

export interface PaymentGatewaysSecretConfig {
  paystack_test_public_key: string;
  paystack_test_secret_key: string;
  paystack_live_public_key: string;
  paystack_live_secret_key: string;
  flutterwave_test_public_key: string;
  flutterwave_test_secret_key: string;
  flutterwave_test_webhook_secret_hash: string;
  flutterwave_live_public_key: string;
  flutterwave_live_secret_key: string;
  flutterwave_live_webhook_secret_hash: string;
  korapay_test_public_key: string;
  korapay_test_secret_key: string;
  korapay_live_public_key: string;
  korapay_live_secret_key: string;
}

export type PaymentGatewaysConfig = PaymentGatewaysPublicConfig & PaymentGatewaysSecretConfig;

export const DEFAULT_PUBLIC_CONFIG: PaymentGatewaysPublicConfig = {
  paystack_enabled: true,
  paystack_mode: 'test',
  paystack_callback_url: '',
  paystack_webhook_url: '',
  flutterwave_enabled: false,
  flutterwave_mode: 'test',
  flutterwave_callback_url: '',
  flutterwave_webhook_url: '',
  korapay_enabled: false,
  korapay_mode: 'test',
  korapay_webhook_url: '',
  bank_transfer_enabled: true,
  bank_name: '',
  account_number: '',
  account_name: '',
  bank_swift_code: '',
  bank_transfer_instructions: '',
};

export const DEFAULT_SECRET_CONFIG: PaymentGatewaysSecretConfig = {
  paystack_test_public_key: '',
  paystack_test_secret_key: '',
  paystack_live_public_key: '',
  paystack_live_secret_key: '',
  flutterwave_test_public_key: '',
  flutterwave_test_secret_key: '',
  flutterwave_test_webhook_secret_hash: '',
  flutterwave_live_public_key: '',
  flutterwave_live_secret_key: '',
  flutterwave_live_webhook_secret_hash: '',
  korapay_test_public_key: '',
  korapay_test_secret_key: '',
  korapay_live_public_key: '',
  korapay_live_secret_key: '',
};

export const DEFAULT_PAYMENT_CONFIG: PaymentGatewaysConfig = {
  ...DEFAULT_PUBLIC_CONFIG,
  ...DEFAULT_SECRET_CONFIG,
};

export const useAdminPayments = () => {
  const queryClient = useQueryClient();

  const configQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const [publicConfig, secretConfig] = await Promise.all([
        settingsService.getSetting<Partial<PaymentGatewaysPublicConfig>>(PUBLIC_SETTINGS_KEY),
        settingsService.getSetting<Partial<PaymentGatewaysSecretConfig>>(SECRET_SETTINGS_KEY),
      ]);
      return { publicConfig: publicConfig || {}, secretConfig: secretConfig || {} };
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (config: PaymentGatewaysConfig) => {
      const publicConfig: PaymentGatewaysPublicConfig = {
        paystack_enabled: config.paystack_enabled,
        paystack_mode: config.paystack_mode,
        paystack_callback_url: config.paystack_callback_url,
        paystack_webhook_url: config.paystack_webhook_url,
        flutterwave_enabled: config.flutterwave_enabled,
        flutterwave_mode: config.flutterwave_mode,
        flutterwave_callback_url: config.flutterwave_callback_url,
        flutterwave_webhook_url: config.flutterwave_webhook_url,
        korapay_enabled: config.korapay_enabled,
        korapay_mode: config.korapay_mode,
        korapay_webhook_url: config.korapay_webhook_url,
        bank_transfer_enabled: config.bank_transfer_enabled,
        bank_name: config.bank_name,
        account_number: config.account_number,
        account_name: config.account_name,
        bank_swift_code: config.bank_swift_code,
        bank_transfer_instructions: config.bank_transfer_instructions,
      };
      const secretConfig: PaymentGatewaysSecretConfig = {
        paystack_test_public_key: config.paystack_test_public_key,
        paystack_test_secret_key: config.paystack_test_secret_key,
        paystack_live_public_key: config.paystack_live_public_key,
        paystack_live_secret_key: config.paystack_live_secret_key,
        flutterwave_test_public_key: config.flutterwave_test_public_key,
        flutterwave_test_secret_key: config.flutterwave_test_secret_key,
        flutterwave_test_webhook_secret_hash: config.flutterwave_test_webhook_secret_hash,
        flutterwave_live_public_key: config.flutterwave_live_public_key,
        flutterwave_live_secret_key: config.flutterwave_live_secret_key,
        flutterwave_live_webhook_secret_hash: config.flutterwave_live_webhook_secret_hash,
        korapay_test_public_key: config.korapay_test_public_key,
        korapay_test_secret_key: config.korapay_test_secret_key,
        korapay_live_public_key: config.korapay_live_public_key,
        korapay_live_secret_key: config.korapay_live_secret_key,
      };
      await Promise.all([
        settingsService.saveSetting(PUBLIC_SETTINGS_KEY, publicConfig, 'Payment gateway configuration (public)'),
        settingsService.saveSetting(SECRET_SETTINGS_KEY, secretConfig, 'Payment gateway API credentials (admin-only)'),
      ]);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const config = useMemo<PaymentGatewaysConfig>(
    () => ({
      ...DEFAULT_PAYMENT_CONFIG,
      ...(configQuery.data?.publicConfig || {}),
      ...(configQuery.data?.secretConfig || {}),
    }),
    [configQuery.data]
  );

  return {
    config,
    isLoading: configQuery.isLoading,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};
