import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/SettingsService';

const SETTINGS_KEY = 'payment_gateways';
const QUERY_KEY = ['admin-settings', SETTINGS_KEY];

export interface PaymentGatewaysConfig {
  paystack_enabled: boolean;
  paystack_public_key: string;
  paystack_secret_key: string;
  flutterwave_enabled: boolean;
  flutterwave_public_key: string;
  flutterwave_secret_key: string;
  bank_transfer_enabled: boolean;
  bank_name: string;
  account_number: string;
  account_name: string;
}

export const DEFAULT_PAYMENT_CONFIG: PaymentGatewaysConfig = {
  paystack_enabled: true,
  paystack_public_key: '',
  paystack_secret_key: '',
  flutterwave_enabled: false,
  flutterwave_public_key: '',
  flutterwave_secret_key: '',
  bank_transfer_enabled: true,
  bank_name: '',
  account_number: '',
  account_name: '',
};

export const useAdminPayments = () => {
  const queryClient = useQueryClient();

  const configQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => settingsService.getSetting<Partial<PaymentGatewaysConfig>>(SETTINGS_KEY),
  });

  const saveMutation = useMutation({
    mutationFn: (config: PaymentGatewaysConfig) =>
      settingsService.saveSetting(SETTINGS_KEY, config, 'Payment gateway configuration'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const config = useMemo(
    () => ({ ...DEFAULT_PAYMENT_CONFIG, ...(configQuery.data || {}) }),
    [configQuery.data]
  );

  return {
    config,
    isLoading: configQuery.isLoading,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};
