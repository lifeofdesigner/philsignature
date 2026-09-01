# Password Security Policy

## Overview
PHILZ SIGNATURE enforces enterprise-grade password complexity rules across both client-side validation (`AuthService.validatePassword`) and Supabase Authentication server-side configurations.

---

## Password Complexity Standard
All passwords must satisfy the following criteria:
1. **Length**: Minimum of **8 characters** (recommended 12+).
2. **Uppercase Character**: At least one `[A-Z]` character.
3. **Lowercase Character**: At least one `[a-z]` character.
4. **Numeral**: At least one numerical digit `[0-9]`.
5. **Special Symbol**: At least one non-alphanumeric character `[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]`.

---

## Hashing & Storage
- Passwords never enter application state, browser caches, or logs.
- Supabase Auth utilizes **Argon2id** / **Bcrypt** cryptographic key derivation functions with high iteration counts and individual per-user cryptographic salts.
- Client applications transmit credentials solely over encrypted TLS 1.3 tunnels.

---

## Brute-Force & Rate Limiting Controls
- Maximum 5 consecutive failed login attempts before a dynamic 60-second backoff penalty is applied.
- IP-level and account-level throttling is handled at the Supabase Auth edge.

