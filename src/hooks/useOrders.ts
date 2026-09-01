import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService, type PlaceOrderParams } from '@/services/OrderService';
import type { Order } from '@/types/database';

export const useCustomerOrders = (customerId?: string) => {
  return useQuery<Order[]>({
    queryKey: ['orders', 'customer', customerId],
    queryFn: () => (customerId ? orderService.getCustomerOrders(customerId) : Promise.resolve([])),
    enabled: Boolean(customerId),
  });
};

export const useTrackOrder = (orderNumber: string, email: string) => {
  return useQuery<Order | null>({
    queryKey: ['orders', 'track', orderNumber, email],
    queryFn: () => orderService.trackOrder(orderNumber, email),
    enabled: Boolean(orderNumber && email),
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PlaceOrderParams) => orderService.placeOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

