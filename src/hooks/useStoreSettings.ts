import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/services/SettingsService';
import { DEFAULT_GENERAL_SETTINGS, type GeneralSettingsForm } from '@/features/admin/settings/hooks/useAdminSettings';

export const useStoreSettings = () => {
  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsService.getAllSettings(),
    staleTime: 1000 * 10, // 10 seconds
    refetchOnWindowFocus: true,
  });

  const settings = useMemo<GeneralSettingsForm>(() => {
    const map = new Map(data.map((s) => [s.key, s.value]));
    const result = { ...DEFAULT_GENERAL_SETTINGS };
    for (const key of Object.keys(result) as (keyof GeneralSettingsForm)[]) {
      if (map.has(key)) {
        const val = map.get(key);
        if (typeof val === 'string') {
          result[key] = val;
        } else if (typeof val === 'boolean') {
          result[key] = val ? 'enabled' : 'disabled';
        } else {
          result[key] = String(val ?? '');
        }
      }
    }
    return result;
  }, [data]);

  const guestCheckoutEnabled = useMemo(() => {
    const val = String(settings.guest_checkout || 'enabled').toLowerCase();
    return val === 'enabled' || val === 'true' || val === '1';
  }, [settings.guest_checkout]);

  return {
    settings,
    guestCheckoutEnabled,
    isLoading,
    refetch,
  };
};

export const isGuestCheckoutEnabled = (settings?: { guest_checkout?: string | boolean } | null): boolean => {
  if (!settings) return true;
  const val = String(settings.guest_checkout ?? 'enabled').toLowerCase();
  return val === 'enabled' || val === 'true' || val === '1';
};
