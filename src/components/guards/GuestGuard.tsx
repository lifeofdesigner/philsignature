import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { permissionEngine } from '@/lib/permissionEngine';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { ROUTES } from '@/constants/routes';

export const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (user) {
    const from = (location.state as { from?: { pathname?: string } })?.from?.pathname;
    if (from && from !== ROUTES.LOGIN && from !== ROUTES.SIGNUP) {
      return <Navigate to={from} replace />;
    }

    if (permissionEngine.canAccessAdmin(profile)) {
      return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
    }

    return <Navigate to={ROUTES.ACCOUNT.DASHBOARD} replace />;
  }

  return <>{children}</>;
};
