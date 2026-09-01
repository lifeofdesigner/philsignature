import React, { createContext, useContext, useState } from 'react';
import type { Profile, UserRole } from '@/types/database';

interface AuthContextType {
  user: Profile | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Scaffolding state ready for Supabase connection in Phase 3
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const role: UserRole | null = user?.role || null;
  const isAuthenticated = Boolean(user);
  const isAdmin = role === 'super_admin' || role === 'staff';

  const login = async (email: string) => {
    setIsLoading(true);
    // Placeholder login contract
    setUser({
      id: 'usr-temp',
      email,
      first_name: 'Noble',
      last_name: 'Client',
      phone: null,
      avatar_url: null,
      role: 'customer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setIsLoading(false);
  };

  const logout = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
