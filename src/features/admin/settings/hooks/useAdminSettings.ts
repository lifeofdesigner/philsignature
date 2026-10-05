import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/SettingsService';

const QUERY_KEY = ['admin-settings-general'];

export interface GeneralSettingsForm {
  store_name: string;
  store_slogan: string;
  footer_text: string;
  copyright_text: string;
  concierge_email: string;
  concierge_phone: string;
  concierge_whatsapp: string;
  store_address: string;
  google_maps_url: string;
  currency_code: string;
  currency_symbol: string;
  company_registration_number: string;
  guest_checkout: string;
}

export const DEFAULT_GENERAL_SETTINGS: GeneralSettingsForm = {
  store_name: '',
  store_slogan: '',
  footer_text: '',
  copyright_text: '',
  concierge_email: '',
  concierge_phone: '',
  concierge_whatsapp: '',
  store_address: '',
  google_maps_url: '',
  currency_code: '',
  currency_symbol: '',
  company_registration_number: '',
  guest_checkout: 'enabled',
};

export const useAdminSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => settingsService.getAllSettings(),
  });

  const values = useMemo<GeneralSettingsForm>(() => {
    const map = new Map((settingsQuery.data ?? []).map((s) => [s.key, s.value]));
    const result = { ...DEFAULT_GENERAL_SETTINGS };
    for (const key of Object.keys(result) as (keyof GeneralSettingsForm)[]) {
      if (map.has(key)) {
        result[key] = String(map.get(key) ?? '');
      }
    }
    return result;
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (form: GeneralSettingsForm) =>
      Promise.all(
        (Object.keys(form) as (keyof GeneralSettingsForm)[]).map((key) =>
          settingsService.saveSetting(key, form[key])
        )
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['store-appearance'] });
    },
  });

  return {
    values,
    isLoading: settingsQuery.isLoading,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};
