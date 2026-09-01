import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { permissionEngine } from '@/lib/permissionEngine';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { ROUTES } from '@/constants/routes';

export const StaffGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!permissionEngine.canAccessAdmin(profile)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (!permissionEngine.isSuperAdmin(profile)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
