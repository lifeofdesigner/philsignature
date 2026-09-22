import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/AuthService';
import { userService } from '@/services/UserService';
import { settingsService } from '@/services/SettingsService';
import { developerAdminService } from '@/services/DeveloperAdminService';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/database';
import {
  type Permission,
  ROLE_PERMISSIONS,
  getAllRolePermissions,
  setDynamicRolePermissions,
  resetRolePermissionsToDefault,
} from '@/lib/permissions';

const ADMIN_USERS_KEY = ['admin-users'];
const RBAC_MATRIX_KEY = ['rbac-matrix'];

export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const usersQuery = useQuery({
    queryKey: ADMIN_USERS_KEY,
    queryFn: () => authService.listUsers(),
    staleTime: 1000 * 30,
  });

  const rbacQuery = useQuery({
    queryKey: RBAC_MATRIX_KEY,
    queryFn: async () => {
      const stored = await settingsService.getSetting<Record<UserRole, Permission[]>>('role_permissions_matrix');
      if (stored && typeof stored === 'object') {
        setDynamicRolePermissions(stored);
        return getAllRolePermissions();
      }
      return getAllRolePermissions();
    },
    staleTime: 1000 * 60 * 5,
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

  const saveRbacMutation = useMutation({
    mutationFn: async (matrix: Record<UserRole, Permission[]>) => {
      setDynamicRolePermissions(matrix);
      await settingsService.saveSetting(
        'role_permissions_matrix',
        matrix,
        'Custom Role-Based Access Control matrix configured by Super Administrator'
      );
      return getAllRolePermissions();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RBAC_MATRIX_KEY });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (params: { email: string; password: string; firstName: string; lastName: string; role: UserRole }) =>
      developerAdminService.createUser(params),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY }),
  });

  const resetRbacMutation = useMutation({
    mutationFn: async () => {
      const def = resetRolePermissionsToDefault();
      await settingsService.saveSetting(
        'role_permissions_matrix',
        ROLE_PERMISSIONS,
        'Default system Role-Based Access Control matrix'
      );
      return def;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RBAC_MATRIX_KEY });
    },
  });

  return {
    users: usersQuery.data ?? [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    setRole: roleMutation.mutateAsync,
    isSettingRoleId: roleMutation.isPending ? roleMutation.variables?.userId : null,
    setActiveStatus: activeMutation.mutateAsync,
    isSettingActiveId: activeMutation.isPending ? activeMutation.variables?.userId : null,
    createUser: createUserMutation.mutateAsync,
    isCreatingUser: createUserMutation.isPending,
    canCreateUsers: developerAdminService.isAvailable(),
    rbacMatrix: rbacQuery.data ?? getAllRolePermissions(),
    isLoadingRbac: rbacQuery.isLoading,
    saveRbacMatrix: saveRbacMutation.mutateAsync,
    isSavingRbac: saveRbacMutation.isPending,
    resetRbacMatrix: resetRbacMutation.mutateAsync,
    isResettingRbac: resetRbacMutation.isPending,
  };
};
