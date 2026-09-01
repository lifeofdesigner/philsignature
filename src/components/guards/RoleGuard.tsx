import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types/database';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  checkCapability?: (userContext: ReturnType<typeof useAuth>) => boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles, checkCapability }) => {
  const auth = useAuth();
  const { user, profile, isLoading } = auth;

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (checkCapability && !checkCapability(auth)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

