import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AppProviders } from '@/providers/AppProviders';
import { router } from '@/routes';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  );
};

export default App;

