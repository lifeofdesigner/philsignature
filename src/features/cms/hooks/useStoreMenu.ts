import { useQuery } from '@tanstack/react-query';
import { cmsService, CMSService, type CmsMenuItem } from '@/services/CMSService';

export const useStoreMenu = () => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['store-navigation-menu'],
    queryFn: () => cmsService.getNavigationMenu(),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });

  const activeMenuItems: CmsMenuItem[] = (data?.items || CMSService.DEFAULT_NAVIGATION_MENU)
    .filter((item) => item.is_active)
    .sort((a, b) => a.order - b.order);

  return {
    items: activeMenuItems,
    isLoading,
    refetch,
  };
};
