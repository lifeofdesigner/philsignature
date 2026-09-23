import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { collectionService } from '@/services/CollectionService';

const ADMIN_COLLECTIONS_KEY = ['admin-collections'];

export const useAdminCollections = () => {
  const queryClient = useQueryClient();

  const collectionsQuery = useQuery({
    queryKey: ADMIN_COLLECTIONS_KEY,
    queryFn: () => collectionService.getCollectionsAdmin(),
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: (input: unknown) => collectionService.createCollection(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_COLLECTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin-collections-lookup'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: unknown }) => collectionService.updateCollection(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_COLLECTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin-collections-lookup'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => collectionService.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_COLLECTIONS_KEY });
      queryClient.invalidateQueries({ queryKey: ['admin-collections-lookup'] });
    },
  });

  return {
    collections: collectionsQuery.data ?? [],
    isLoading: collectionsQuery.isLoading,
    isError: collectionsQuery.isError,
    createCollection: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCollection: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCollection: deleteMutation.mutateAsync,
  };
};
