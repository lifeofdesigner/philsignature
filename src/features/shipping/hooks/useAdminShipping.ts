import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shippingService } from '@/services/ShippingService';

const ADMIN_SHIPPING_KEY = ['admin-shipping-methods'];

export const useAdminShipping = () => {
  const queryClient = useQueryClient();

  const methodsQuery = useQuery({
    queryKey: ADMIN_SHIPPING_KEY,
    queryFn: () => shippingService.getAllMethodsAdmin(),
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: (input: unknown) => shippingService.createMethod(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_SHIPPING_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: unknown }) => shippingService.updateMethod(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_SHIPPING_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => shippingService.deleteMethod(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_SHIPPING_KEY }),
  });

  return {
    methods: methodsQuery.data ?? [],
    isLoading: methodsQuery.isLoading,
    isError: methodsQuery.isError,
    createMethod: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateMethod: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteMethod: deleteMutation.mutateAsync,
  };
};
