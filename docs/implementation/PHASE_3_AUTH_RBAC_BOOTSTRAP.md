# Phase 3: Authentication, Authorization & Identity Platform

## Executive Summary
Phase 3 implements the identity, authentication, role-based access control (RBAC), and developer bootstrap administration infrastructure for PHILZ SIGNATURE on Supabase.

---

## 5-Tier Architecture Enforced

```
UI Page (e.g. CustomerLoginPage)
   ↓
Hook (useAuth)
   ↓
Service (AuthService)
   ↓
Repository (AuthRepository)
   ↓
Supabase Auth & PostgreSQL profiles
```

- **Zero React components communicate directly with Supabase.**
- **No business logic in UI pages.**
- **Permission engine abstracts all capability evaluations.**

---

## Deliverables Summary

### 1. Repository & Service Layer
- `AuthRepository`: Encapsulates Supabase Auth calls, profiles lookups, role elevations, and audit logging.
- `AuthService`: Enforces 8+ character password policy, email validation, session lifecycle, and prevents demotion of the sole Super Admin.

### 2. Route Guards & Protection
- `GuestGuard`: Prevents authenticated patrons from accessing login or registration pages.
- `AuthGuard`: Protects customer accounts at `/account/*`.
- `StaffGuard`: Protects administrative cockpit at `/admin/*`.
- `RoleGuard`: Capability-based dynamic gatekeeper.

### 3. Identity UI Features
- `CustomerLoginPage`: Form validation, remember me, error banners, redirect preservation.
- `CustomerSignupPage`: Password complexity indicator, registration flow.
- `ForgotPasswordPage`: Secure recovery token dispatch.
- `ResetPasswordPage`: New password form with strength validation.
- `VerifyEmailPage`: Account confirmation notification.

### 4. Developer Bootstrap Console (`/developer/bootstrap`)
- Passphrase locked via `VITE_DEV_BOOTSTRAP_SECRET`.
- Diagnostic dashboard: Latency check, storage buckets verification (`products`, `banners`, `cms`, `avatars`), 18-table record counters, RLS status.
- Direct Super Admin provisioning.
- Live user directory with dynamic role promotion and demotion.

### 5. Security Documentation
- `docs/security/password-policy.md`
- `docs/security/session-policy.md`
- `docs/security/login-flow.md`
- `docs/security/recovery-flow.md`
- `docs/security/rbac-flow.md`
- `docs/security/permission-flow.md`

