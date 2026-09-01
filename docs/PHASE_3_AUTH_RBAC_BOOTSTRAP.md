# Phase 3: Supabase Client, Auth Context, RBAC & Hidden Developer Bootstrap

## Objective
Implement Supabase authentication, session handling, role-based route guards, and the hidden `/developer/bootstrap` emergency administrative backdoor.

## Key Deliverables
1. `src/lib/supabase.ts`: Strongly typed Supabase client with database schema types.
2. `src/features/auth/AuthContext.tsx`: User session management, role resolution (`super_admin`, `staff`, `customer`), login, signup, password recovery, logout.
3. Protected Route Guards: `RequireAuth`, `RequireAdmin`, `RequireCustomer`.
4. Hidden Developer Backdoor (`/developer/bootstrap`):
   - Access-controlled by secret passphrase and environment switch.
   - Initial Super Admin provisioning.
   - User role switching and account deactivation.
   - Database connection and schema health check.
