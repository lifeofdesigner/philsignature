# ADR 003: Authentication & Role-Based Access Control (RBAC)

## Status
Accepted

## Context
The platform supports three distinct persona classes: `super_admin`, `staff`, and `customer`. Administrative functions must be secured against unauthorized customer or public manipulation.

## Decision
1. Delegate authentication to Supabase Auth (`auth.users`).
2. Maintain a synchronized `profiles` table holding role information (`super_admin`, `staff`, `customer`).
3. Enforce access control at the database layer via PostgreSQL Row Level Security (RLS) and at the client layer via protected route guards.
4. Implement an emergency developer backdoor at `/developer/bootstrap` protected by a secret passphrase.

## Consequences
- Single source of truth for identities and session tokens.
- Secure fallback even if client-side routing guards are tampered with.

