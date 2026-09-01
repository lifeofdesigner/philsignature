import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/UserService';
import { orderService } from '@/services/OrderService';

const ADMIN_CUSTOMERS_KEY = ['admin-customers'];
const ADMIN_ORDERS_KEY = ['admin-orders'];

export interface CustomerWithStats {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  orderCount: number;
  lifetimeSpend: number;
}

export const useAdminCustomers = () => {
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: ADMIN_CUSTOMERS_KEY,
    queryFn: () => userService.getAllCustomers(),
    staleTime: 1000 * 30,
  });

  const ordersQuery = useQuery({
    queryKey: ADMIN_ORDERS_KEY,
    queryFn: () => orderService.getAllOrdersAdmin(),
    staleTime: 1000 * 30,
  });

  const customers = useMemo<CustomerWithStats[]>(() => {
    const orders = ordersQuery.data ?? [];
    return (customersQuery.data ?? []).map((c) => {
      const customerOrders = orders.filter((o) => o.customer_id === c.id);
      const lifetimeSpend = customerOrders
        .filter((o) => o.financial_status === 'paid')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);
      return { ...c, orderCount: customerOrders.length, lifetimeSpend };
    });
  }, [customersQuery.data, ordersQuery.data]);

  const toggleActiveMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      userService.setCustomerActiveStatus(userId, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_CUSTOMERS_KEY }),
  });

  return {
    customers,
    isLoading: customersQuery.isLoading || ordersQuery.isLoading,
    isError: customersQuery.isError,
    setActiveStatus: toggleActiveMutation.mutateAsync,
    isUpdatingId: toggleActiveMutation.isPending ? toggleActiveMutation.variables?.userId : null,
  };
};
