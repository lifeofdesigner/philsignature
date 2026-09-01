import { useQuery } from '@tanstack/react-query';
import { collectionService } from '@/services/CollectionService';
import type { Collection } from '@/types/database';

export const useCollectionsData = () => {
  const query = useQuery<Collection[]>({
    queryKey: ['collections-directory'],
    queryFn: () => collectionService.getCollections(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 60,
  });

  return {
    collections: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

