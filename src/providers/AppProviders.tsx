import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { AppearanceThemeSync } from './AppearanceThemeSync';
import { RealtimeSyncProvider } from './RealtimeSyncProvider';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';
import { ModalProvider } from './ModalProvider';
import { LoadingProvider } from './LoadingProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <QueryProvider>
      <RealtimeSyncProvider>
        <ThemeProvider defaultTheme="system">
          <AppearanceThemeSync />
          <AuthProvider>
            <LoadingProvider>
              <ModalProvider>
                <ToastProvider>{children}</ToastProvider>
              </ModalProvider>
            </LoadingProvider>
          </AuthProvider>
        </ThemeProvider>
      </RealtimeSyncProvider>
    </QueryProvider>
  );
};

