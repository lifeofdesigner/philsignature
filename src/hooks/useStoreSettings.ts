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
        result[key] = String(map.get(key) ?? '');
      }
    }
    return result;
  }, [data]);

  return {
    settings,
    isLoading,
    refetch,
  };
};
