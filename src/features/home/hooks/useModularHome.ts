import { useQuery } from '@tanstack/react-query';
import { cmsService, CMSService, type CmsHomepageSection } from '@/services/CMSService';

export const useModularHome = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['homepage-modular-layout'],
    queryFn: () => cmsService.getHomepageLayout(),
    staleTime: 1000 * 60 * 5,
  });

  const sections: CmsHomepageSection[] = (data?.sections || CMSService.DEFAULT_HOMEPAGE_SECTIONS)
    .filter((sec) => cmsService.isSectionCurrentlyVisible(sec))
    .sort((a, b) => a.order - b.order);

  return {
    sections,
    isLoading,
    refetch,
  };
};
