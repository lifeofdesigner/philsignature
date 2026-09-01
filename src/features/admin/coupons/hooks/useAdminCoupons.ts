import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { couponService } from '@/services/CouponService';

const ADMIN_COUPONS_KEY = ['admin-coupons'];

export const useAdminCoupons = () => {
  const queryClient = useQueryClient();

  const couponsQuery = useQuery({
    queryKey: ADMIN_COUPONS_KEY,
    queryFn: () => couponService.getAllCouponsAdmin(),
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: (input: unknown) => couponService.createCoupon(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_COUPONS_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: unknown }) => couponService.updateCoupon(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_COUPONS_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponService.deleteCoupon(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_COUPONS_KEY }),
  });

  return {
    coupons: couponsQuery.data ?? [],
    isLoading: couponsQuery.isLoading,
    isError: couponsQuery.isError,
    createCoupon: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCoupon: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCoupon: deleteMutation.mutateAsync,
  };
};
