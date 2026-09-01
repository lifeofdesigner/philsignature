import React from 'react';
import { Toaster as SonnerToaster } from 'sonner';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <>
      {children}
      <SonnerToaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161616',
            border: '1px solid #2A2A2A',
            color: '#FAF8F5',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: '13px',
          },
          className: 'luxury-toast',
        }}
      />
    </>
  );
};

