/**
 * Admin Design Tokens
 *
 * Independent from the storefront's luxury theme (src/index.css luxury-*
 * tokens). Nothing here is derived from or shared with storefront branding.
 * Use these constants (or the matching Tailwind classes below) for any new
 * admin UI instead of reaching for luxury-* classes or raw hex values.
 */

export const adminColors = {
  surface: '#FFFFFF',
  surfaceMuted: '#F9FAFB',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',

  textPrimary: '#111111',
  textSecondary: '#374151',
  textMuted: '#6B7280',
  textOnDark: '#FFFFFF',

  primary: '#DC2626',
  primaryHover: '#B91C1C',
  danger: '#DC2626',
  dangerHover: '#B91C1C',
  success: '#16A34A',
  successHover: '#15803D',
  warning: '#D97706',

  focusRing: '#DC2626',
} as const;

export const adminRadius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
} as const;

export const adminShadow = {
  card: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  raised: '0 4px 12px 0 rgb(0 0 0 / 0.08)',
} as const;
