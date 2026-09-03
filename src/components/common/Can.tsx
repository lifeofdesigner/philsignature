import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/database';
import { hasPermission, type Permission } from '@/lib/permissions';

export interface CanProps {
  perform?: Permission;
  role?: UserRole | UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ perform, role, children, fallback = null }) => {
  const { profile, role: currentRole } = useAuth();
  const userRole = (profile?.role || currentRole) as UserRole | undefined;

  if (!userRole) return <>{fallback}</>;
  if (userRole === 'super_admin') return <>{children}</>;

  if (role) {
    const rolesArray = Array.isArray(role) ? role : [role];
    if (!rolesArray.includes(userRole)) {
      return <>{fallback}</>;
    }
  }

  if (perform && !hasPermission(userRole, perform)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default Can;
