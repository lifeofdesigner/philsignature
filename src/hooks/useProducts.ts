import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/ProductService';
import type { Product } from '@/types/database';

export const useProducts = (filter?: { categoryId?: string; collectionId?: string; family?: string; status?: string }) => {
  return useQuery<Product[]>({
    queryKey: ['products', 'list', filter],
    queryFn: () => productService.getCatalog(filter),
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery<Product | null>({
    queryKey: ['products', 'detail', slug],
    queryFn: () => productService.getProductBySlug(slug),
    enabled: Boolean(slug),
  });
};

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (input: unknown) => productService.createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: unknown }) => productService.updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

