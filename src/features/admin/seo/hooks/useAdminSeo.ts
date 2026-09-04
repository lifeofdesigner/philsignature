import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/SettingsService';

const SETTINGS_KEY = 'seo_defaults';
const QUERY_KEY = ['admin-settings', SETTINGS_KEY];

export interface SeoDefaults {
  meta_title: string;
  meta_description: string;
  keywords: string;
  og_image_url?: string;
  twitter_handle?: string;
  canonical_url?: string;
  google_site_verification?: string;
  robots_txt?: string;
  sitemap_enabled?: boolean;
  structured_data_type?: string;
}

export const DEFAULT_SEO: SeoDefaults = {
  meta_title: 'PHILZ SIGNATURE | Haute Parfumerie & Luxury Fragrances',
  meta_description: 'Discover handcrafted artisanal perfumes, pure extrait de parfum, and bespoke olfactory creations in Nigeria.',
  keywords: 'perfume, luxury fragrance, extrait de parfum, Philz Signature, Lagos fragrance',
  og_image_url: '',
  twitter_handle: '@philzsignature',
  canonical_url: 'https://philzsignature.com',
  google_site_verification: '',
  robots_txt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /account/\nSitemap: https://philzsignature.com/sitemap.xml',
  sitemap_enabled: true,
  structured_data_type: 'Organization',
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
      settingsService.saveSetting(SETTINGS_KEY, config, 'Global SEO metadata and search engine indexing configurations'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    seo,
    isLoading: seoQuery.isLoading,
    save: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};
