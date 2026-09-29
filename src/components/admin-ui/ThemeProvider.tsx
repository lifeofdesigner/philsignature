import * as React from 'react';
import { adminColors } from './tokens';

/**
 * AdminThemeProvider is the explicit entry point marking "admin has its own
 * design scope" — separate from the storefront's luxury/gold theme. It sets
 * color-scheme: light (admin is always light-themed, never inherits the
 * storefront's dark mode) and exposes the admin color tokens via context so
 * nested admin-ui components can consume them without re-importing tokens.ts.
 */
const AdminThemeContext = React.createContext(adminColors);

export const useAdminTheme = () => React.useContext(AdminThemeContext);

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AdminThemeContext.Provider value={adminColors}>
      <div style={{ colorScheme: 'light' }} className="contents">
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
};
