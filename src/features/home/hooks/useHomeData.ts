import { useQuery } from '@tanstack/react-query';
import { cmsService, type CmsHeroContent, type CmsStoryContent } from '@/services/CMSService';
import { collectionService } from '@/services/CollectionService';
import { productService } from '@/services/ProductService';
import type { Collection, Product } from '@/types/database';

export interface HomeDataResult {
  hero: CmsHeroContent;
  collections: Collection[];
  featuredProducts: Product[];
  story: CmsStoryContent;
}

export const useHomeData = () => {
  const query = useQuery<HomeDataResult>({
    queryKey: ['home-page-data'],
    queryFn: async () => {
      const [hero, collections, featuredProducts, story] = await Promise.all([
        cmsService.getHeroSection(),
        collectionService.getFeaturedCollections(),
        productService.getFeaturedProducts(4),
        cmsService.getStorySection(),
      ]);

      return {
        hero,
        collections,
        featuredProducts,
        story,
      };
    },
    staleTime: 1000 * 10, // 10 seconds
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

