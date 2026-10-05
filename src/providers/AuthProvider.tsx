import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { Profile, UserRole } from '@/types/database';
import type { Session, User } from '@supabase/supabase-js';
import { authService } from '@/services/AuthService';
import { authRepository, type SignInCredentials, type SignUpCredentials } from '@/repositories/AuthRepository';
import { permissionEngine } from '@/lib/permissionEngine';
import { setDynamicRolePermissions, type Permission } from '@/lib/permissions';
import { settingsService } from '@/services/SettingsService';
import { orderService } from '@/services/OrderService';

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  canAccessAdmin: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageCMS: boolean;
  canManageUsers: boolean;
  canEditSettings: boolean;
  canDeleteMedia: boolean;
  canViewAnalytics: boolean;
  login: (credentials: SignInCredentials) => Promise<void>;
  register: (credentials: SignUpCredentials) => Promise<void>;
  logout: () => Promise<void>;
  signOutAllDevices: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const prof = await authRepository.getProfile(user.id);
    setProfile(prof);
  }, [user]);

  // Sync the super admin's saved RBAC matrix from the DB into the in-memory
  // permission engine on every app boot, so role changes apply to all staff
  // sessions immediately instead of only the browser that saved them.
  useEffect(() => {
    let isMounted = true;
    settingsService
      .getSetting<Record<UserRole, Permission[]>>('role_permissions_matrix')
      .then((stored) => {
        if (isMounted && stored && typeof stored === 'object') {
          setDynamicRolePermissions(stored);
        }
      })
      .catch((err) => console.error('[AuthProvider] Failed to sync RBAC matrix:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial Session Recovery
    const initAuth = async () => {
      try {
        const { session: initialSession, user: initialUser, profile: initialProfile } =
          await authService.getActiveSession();

        if (isMounted) {
          setSession(initialSession);
          setUser(initialUser);
          setProfile(initialProfile);
        }
      } catch (err) {
        console.error('[AuthProvider] Initial session recovery error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // 2. Reactive Listener for Auth State & Token Refresh
    const { data: authListener } = authRepository.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);

      if (currentUser) {
        const prof = await authRepository.getProfile(currentUser.id);
        if (isMounted) setProfile(prof);
      } else {
        if (isMounted) setProfile(null);
      }

      if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setSession(null);
        }
      }

      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // NOTE: login/register/logout intentionally do NOT toggle `isLoading`.
  // `isLoading` represents initial session bootstrap only (gates GuestGuard/AuthGuard's
  // skeleton). Toggling it during these actions previously unmounted the calling page
  // mid-request, discarding any error state set in its catch block. Per-action pending
  // state (e.g. a submit button spinner) is the caller's local responsibility.
  const login = useCallback(async (credentials: SignInCredentials) => {
    const { user: loggedInUser, session: newSession, profile: userProfile } =
      await authService.login(credentials);
    setUser(loggedInUser);
    setSession(newSession);
    setProfile(userProfile);

    // Link any previous guest orders placed with this email address
    if (loggedInUser?.id && loggedInUser?.email) {
      orderService.linkGuestOrders(loggedInUser.id, loggedInUser.email).catch(() => null);
    }
  }, []);

  const register = useCallback(async (credentials: SignUpCredentials) => {
    const { user: registeredUser, session: newSession } = await authService.register(credentials);
    setUser(registeredUser);
    setSession(newSession);
    if (registeredUser) {
      const prof = await authRepository.getProfile(registeredUser.id);
      setProfile(prof);
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout(user?.id);
    setUser(null);
    setProfile(null);
    setSession(null);
  }, [user]);

  const signOutAllDevices = useCallback(async () => {
    await authService.signOutAllDevices(user?.id);
    setUser(null);
    setProfile(null);
    setSession(null);
  }, [user]);

  const resetPassword = useCallback(async (email: string) => {
    await authService.requestPasswordReset(email);
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const updatedUser = await authService.updatePassword(newPassword);
    setUser(updatedUser);
  }, []);

  // Role and Permission Engine computation
  const role: UserRole | null = profile?.role || null;
  const isAuthenticated = Boolean(user && session);
  const isAdmin = permissionEngine.isSuperAdmin(profile);
  const canAccessAdmin = permissionEngine.canAccessAdmin(profile);
  const canManageProducts = permissionEngine.canManageProducts(profile);
  const canManageOrders = permissionEngine.canManageOrders(profile);
  const canManageCMS = permissionEngine.canManageCMS(profile);
  const canManageUsers = permissionEngine.canManageUsers(profile);
  const canEditSettings = permissionEngine.canEditSettings(profile);
  const canDeleteMedia = permissionEngine.canDeleteMedia(profile);
  const canViewAnalytics = permissionEngine.canViewAnalytics(profile);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      session,
      role,
      isLoading,
      isAuthenticated,
      isAdmin,
      canAccessAdmin,
      canManageProducts,
      canManageOrders,
      canManageCMS,
      canManageUsers,
      canEditSettings,
      canDeleteMedia,
      canViewAnalytics,
      login,
      register,
      logout,
      signOutAllDevices,
      resetPassword,
      updatePassword,
      refreshProfile,
    }),
    [
      user,
      profile,
      session,
      role,
      isLoading,
      isAuthenticated,
      isAdmin,
      canAccessAdmin,
      canManageProducts,
      canManageOrders,
      canManageCMS,
      canManageUsers,
      canEditSettings,
      canDeleteMedia,
      canViewAnalytics,
      login,
      register,
      logout,
      signOutAllDevices,
      resetPassword,
      updatePassword,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const useAuth = useAuthContext;
