import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/OrderService';
import type { Order } from '@/types/database';

export function useCustomerOrders(customerId?: string) {
  return useQuery<Order[]>({
    queryKey: ['customer-orders', customerId],
    queryFn: () => (customerId ? orderService.getCustomerOrders(customerId) : Promise.resolve([])),
    enabled: Boolean(customerId),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useOrderDetail(orderNumber?: string, email?: string) {
  return useQuery<Order | null>({
    queryKey: ['order-detail', orderNumber, email],
    queryFn: () => (orderNumber ? orderService.trackOrder(orderNumber, email) : Promise.resolve(null)),
    enabled: Boolean(orderNumber),
    staleTime: 1000 * 60 * 2,
  });
}

