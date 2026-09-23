import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/OrderService';
import type { Order } from '@/types/database';

const ADMIN_ORDERS_KEY = ['admin-orders'];

export const useAdminOrders = () => {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ADMIN_ORDERS_KEY,
    queryFn: () => orderService.getAllOrdersAdmin(),
    staleTime: 1000 * 30,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, note }: { orderId: string; status: Order['fulfillment_status']; note?: string }) =>
      orderService.updateFulfillmentStatus(orderId, status, note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY }),
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: ({ orderId, reference, paymentMethod }: { orderId: string; reference: string; paymentMethod: string }) =>
      orderService.confirmPayment(orderId, reference, paymentMethod),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY }),
  });

  return {
    orders: ordersQuery.data ?? [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    updateFulfillmentStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    confirmPayment: confirmPaymentMutation.mutateAsync,
    isConfirmingPayment: confirmPaymentMutation.isPending,
  };
};
