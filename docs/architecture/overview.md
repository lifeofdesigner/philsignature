# Architecture Overview

## The 5-Layer Strict Hierarchy
PHILZ SIGNATURE follows a strict 5-layer decoupled architecture:

```
[ UI Layer (Components / Pages / Views) ]
                   │
                   ▼
[ Hook Layer (useProducts, useCart, useOrders) ]
                   │
                   ▼
[ Service Layer (ProductService, OrderService, etc.) ]
                   │
                   ▼
[ Repository Layer (ProductRepository, etc.) ]
                   │
                   ▼
[ Database / Provider Layer (Supabase PostgreSQL / Storage) ]
```

### Strict Rules of Isolation:
1. **Never Call Supabase From UI**: Components must never invoke `supabase.from()` or `supabase.storage`.
2. **Never Call Repositories Directly From UI**: Components call Custom Hooks or Services.
3. **Repository Responsibility**: Only repositories translate raw SQL/Supabase responses into domain entities and catch low-level Supabase exceptions.
4. **Service Responsibility**: Business validations, cross-entity calculations (e.g. tax, discount, shipping threshold), and coordinating multiple repositories.
5. **Hook Responsibility**: TanStack Query orchestration, cache invalidation, and UI loading/error state transformation.

