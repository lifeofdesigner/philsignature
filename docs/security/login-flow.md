# Client Authentication & Login Flow

## Overview
This document details the multi-tier sequence when a patron or staff member signs into PHILZ SIGNATURE.

---

## 5-Tier Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Client as Patron / Admin
    participant UI as CustomerLoginPage
    participant Hook as useAuth()
    participant Service as AuthService
    participant Repo as AuthRepository
    participant Supa as Supabase Auth & PostgreSQL

    Client->>UI: Submits email & password
    UI->>Hook: login({ email, password })
    Hook->>Service: login(credentials)
    Service->>Service: Validate email syntax & presence
    Service->>Repo: signInWithPassword(credentials)
    Repo->>Supa: auth.signInWithPassword()
    Supa-->>Repo: Returns { user, session }
    Repo->>Supa: SELECT * FROM profiles WHERE id = user.id
    Supa-->>Repo: Returns Profile entity
    Service->>Service: Verify profile.is_active is true
    Service->>Repo: recordActivity(user.id, 'AUTH_LOGIN')
    Repo-->>Service: Profile & Session confirmed
    Service-->>Hook: Return { user, session, profile }
    Hook-->>UI: Update reactive AuthContext state
    UI-->>Client: Redirect to requested target or dashboard
```

---

## Error Handling
- **Invalid Credentials**: Returns standard generic message (*"Invalid credentials. Please verify and retry."*) to prevent account enumeration attacks.
- **Deactivated Profile**: Immediately revokes the newly issued session and displays an account notice.
