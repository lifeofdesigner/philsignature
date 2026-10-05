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

  const archiveOrderMutation = useMutation({
    mutationFn: (orderId: string) => orderService.archiveOrder(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY }),
  });

  const unarchiveOrderMutation = useMutation({
    mutationFn: (orderId: string) => orderService.unarchiveOrder(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY }),
  });

  const bulkArchiveMutation = useMutation({
    mutationFn: ({ orderIds, archived }: { orderIds: string[]; archived?: boolean }) =>
      orderService.bulkArchiveOrders(orderIds, archived),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY }),
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: string) => orderService.deleteOrder(orderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY }),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (orderIds: string[]) => orderService.bulkDeleteOrders(orderIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_ORDERS_KEY }),
  });

  return {
    orders: ordersQuery.data ?? [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    refetch: ordersQuery.refetch,
    updateFulfillmentStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    confirmPayment: confirmPaymentMutation.mutateAsync,
    isConfirmingPayment: confirmPaymentMutation.isPending,
    archiveOrder: archiveOrderMutation.mutateAsync,
    unarchiveOrder: unarchiveOrderMutation.mutateAsync,
    bulkArchiveOrders: bulkArchiveMutation.mutateAsync,
    deleteOrder: deleteOrderMutation.mutateAsync,
    bulkDeleteOrders: bulkDeleteMutation.mutateAsync,
  };
};
