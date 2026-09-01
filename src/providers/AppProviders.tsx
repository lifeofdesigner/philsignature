import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { ToastProvider } from './ToastProvider';
import { ModalProvider } from './ModalProvider';
import { LoadingProvider } from './LoadingProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <LoadingProvider>
            <ModalProvider>
              <ToastProvider>{children}</ToastProvider>
            </ModalProvider>
          </LoadingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  );
};

