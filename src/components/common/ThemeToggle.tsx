import React from 'react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

/**
 * ThemeToggle is disabled and hidden because the customer-facing
 * storefront is permanently locked to Dark Theme.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = () => {
  return null;
};
