import { useQuery } from '@tanstack/react-query';
import { cmsService, CMSService, type CmsAppearanceConfig } from '@/services/CMSService';

export const useStoreAppearance = () => {
  const { data, isLoading, refetch } = useQuery<CmsAppearanceConfig>({
    queryKey: ['store-appearance'],
    queryFn: () => cmsService.getAppearance(),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
  });

  return {
    appearance: data || CMSService.DEFAULT_APPEARANCE,
    isLoading,
    refetch,
  };
};
