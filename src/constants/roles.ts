export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

