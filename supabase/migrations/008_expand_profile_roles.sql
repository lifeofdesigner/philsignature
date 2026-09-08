-- Expand profiles.role CHECK constraint to match the full UserRole set used by RBAC.
-- Migration 001 only allowed ('super_admin', 'staff', 'customer'), so any newer role
-- (e.g. 'store_manager') assigned via the Users & Roles admin page was rejected by
-- the database with a check constraint violation.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (
  role IN (
    'super_admin',
    'admin',
    'administrator',
    'store_manager',
    'manager',
    'content_manager',
    'content_editor',
    'marketing',
    'customer_support',
    'finance',
    'inventory_staff',
    'sales_staff',
    'order_staff',
    'staff',
    'customer'
  )
);
