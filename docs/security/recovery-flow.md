# Account Recovery & Password Reset Flow

## Overview
Password recovery is handled out-of-band via signed, single-use cryptographic recovery links dispatched to the patron's email address.

---

## Process Flow

```mermaid
sequenceDiagram
    autonumber
    actor Client as Patron
    participant UI as ForgotPasswordPage
    participant Service as AuthService
    participant Repo as AuthRepository
    participant Supa as Supabase Auth (Email Dispatch)
    participant ResetUI as ResetPasswordPage

    Client->>UI: Enters registered email
    UI->>Service: requestPasswordReset(email)
    Service->>Repo: resetPasswordForEmail(email, redirectUrl)
    Repo->>Supa: auth.resetPasswordForEmail()
    Supa-->>Client: Transmits email with signed recovery token
    UI-->>Client: Displays confirmation message
    Client->>ResetUI: Clicks recovery link in email
    ResetUI->>ResetUI: Prompts for new password with policy meter
    Client->>ResetUI: Submits new password
    ResetUI->>Service: updatePassword(newPassword)
    Service->>Service: Enforce 8+ chars, uppercase, lowercase, numbers, symbols
    Service->>Repo: updateUserPassword(newPassword)
    Repo->>Supa: auth.updateUser({ password })
    Supa-->>Repo: Password updated & old sessions terminated
    Service->>Repo: recordActivity(user.id, 'PASSWORD_UPDATE')
    ResetUI-->>Client: Redirects to /login with success notification
```

