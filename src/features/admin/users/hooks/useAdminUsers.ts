import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/AuthService';
import { userService } from '@/services/UserService';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/database';

const ADMIN_USERS_KEY = ['admin-users'];

export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const usersQuery = useQuery({
    queryKey: ADMIN_USERS_KEY,
    queryFn: () => authService.listUsers(),
    staleTime: 1000 * 30,
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      authService.elevateUserRole(userId, role, currentUser?.id || ''),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });

  const activeMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      userService.setCustomerActiveStatus(userId, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    setRole: roleMutation.mutateAsync,
    isSettingRoleId: roleMutation.isPending ? roleMutation.variables?.userId : null,
    setActiveStatus: activeMutation.mutateAsync,
    isSettingActiveId: activeMutation.isPending ? activeMutation.variables?.userId : null,
  };
};
