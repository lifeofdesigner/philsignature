# Session Lifecycle & Token Policy

## Overview
Session management in PHILZ SIGNATURE operates on short-lived cryptographic JSON Web Tokens (JWT) coupled with rotating refresh tokens managed by Supabase Auth and `AuthProvider`.

---

## Token Specifications
- **Access Token (JWT)**:
  - Lifetime: **1 Hour (3,600 seconds)**.
  - Contains user ID (`sub`), role claims, and issue/expiry timestamps.
- **Refresh Token**:
  - Rotating single-use cryptographically random token.
  - Lifetime: **30 Days**.
  - Automatically rotated on each exchange; reused tokens trigger immediate family revocation.

---

## Session Lifecycle Mechanisms
1. **Silent Background Refresh**:
   - `authRepository.onAuthStateChange` listens for upcoming expiration and quietly fetches a fresh JWT without interrupting user actions.
2. **Automatic Session Recovery**:
   - On page load, `authService.getActiveSession()` reads the persistent session from secure local storage and re-establishes user state and profile.
3. **Secure Termination (Logout)**:
   - Calling `logout()` notifies Supabase Auth, invalidates the refresh token server-side, cleans client memory, and redirects the patron to public storefront routes.

