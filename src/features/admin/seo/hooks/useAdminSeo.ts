import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/SettingsService';

const SETTINGS_KEY = 'seo_defaults';
const QUERY_KEY = ['admin-settings', SETTINGS_KEY];

export interface SeoDefaults {
  meta_title: string;
  meta_description: string;
  keywords: string;
}

export const DEFAULT_SEO: SeoDefaults = {
  meta_title: '',
  meta_description: '',
  keywords: '',
};

export const useAdminSeo = () => {
  const queryClient = useQueryClient();

  const seoQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => settingsService.getSetting<Partial<SeoDefaults>>(SETTINGS_KEY),
  });

  const seo = useMemo(() => ({ ...DEFAULT_SEO, ...(seoQuery.data || {}) }), [seoQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (config: SeoDefaults) =>
      settingsService.saveSetting(SETTINGS_KEY, config, 'Global SEO metadata defaults'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    seo,
    isLoading: seoQuery.isLoading,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};
