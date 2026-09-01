# PHILZ SIGNATURE — Luxury Perfume House

**Haute Parfumerie & Artisanal Olfactory Creations**

An ultra-luxury perfume ecommerce web application engineered with **React 19, Vite, TypeScript, TailwindCSS, Radix UI, TanStack Query/Table, Framer Motion, and Supabase**.

---

## 🧭 Developer Onboarding Guide

### 1. Architectural Philosophy
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

- **Rule 1**: UI components NEVER call Supabase directly.
- **Rule 2**: Only Repositories interact with `@supabase/supabase-js`.
- **Rule 3**: Zero raw JSON editing for administrators; all CMS and product interactions use visual forms.

---

## 📂 Feature-First Folder Structure

```
src/
├── app/                    # Global app configuration and providers
├── components/
│   ├── ui/                 # Centralized luxury primitives (Button, Card, Dialog, etc.)
│   ├── feedback/           # ErrorState, LoadingState, EmptyState, Skeletons
│   ├── layouts/            # StoreShell, CustomerShell, AdminShell
│   └── common/             # Navbar, AnnouncementBar, Footer, AdminSidebar
├── constants/              # Central routes, roles, order statuses, storage buckets
├── errors/                 # AppError, SupabaseError, ValidationError, NetworkError
├── schemas/                # Pure Zod schemas (product, order, coupon, cms)
├── repositories/           # Repositories communicating with Supabase
├── services/               # Business logic, validations, tax & discount calculation
├── hooks/                  # TanStack Query hooks (useProducts, useOrders, useCMS)
├── lib/                    # Supabase client, query client, utility functions
├── styles/                 # Luxury tokens and Tailwind base layers
├── types/                  # TypeScript domain and database interfaces
└── features/               # Feature-first modular business domains
    ├── storefront/         # home, shop, collections, product, cart, checkout, tracking...
    ├── customer/           # dashboard, orders, addresses, wishlist, profile
    ├── admin/              # dashboard, products, categories, orders, customers, cms...
    ├── developer/          # bootstrap backdoor (/developer/bootstrap)
    └── system/             # not-found, unauthorized, maintenance
```

Each feature folder is completely self-contained with its own `pages/`, `index.ts`, and `README.md`.

---

## 🛠️ Commands & Scripts

```bash
# Clean install of all dependencies
npm install

# Start local development server (Vite)
npm run dev

# Run strict ESLint checks
npm run lint

# Production typecheck and build (TypeScript + Vite)
npm run build

# Preview production build locally
npm run preview
```

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase project URL (`https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Public anonymous JWT key |
| `VITE_APP_NAME` | `"PHILZ SIGNATURE"` |
| `VITE_DEV_BOOTSTRAP_SECRET` | Passphrase to unlock `/developer/bootstrap` |
| `VITE_ENABLE_DEV_BOOTSTRAP` | Toggle emergency developer backdoor (`true`/`false`) |

Detailed documentation: [Environment Guide](docs/environment.md).

---

## 🗄️ Supabase & Database Architecture
- [Database Tables](docs/database/tables.md)
- [Entity Relationships](docs/database/relationships.md)
- [Row Level Security](docs/database/rls.md)
- [Storage Buckets](docs/database/storage.md)
- [Stored Functions](docs/database/functions.md)
- [Triggers](docs/database/triggers.md)
- [Seed Strategy](docs/database/seed-strategy.md)

---

## 🔐 Emergency Developer Backdoor
Navigate to `/developer/bootstrap`.
- Requires `VITE_DEV_BOOTSTRAP_SECRET` passphrase.
- Hidden from sitemaps and navigation menus.
- Allows provisioning the initial Super Admin account, toggling roles, and testing Supabase schema health.

---

## 📚 Central Documentation Index
See [docs/MASTER_INDEX.md](docs/MASTER_INDEX.md) for complete technical specifications:
- [Architecture Overview](docs/architecture/overview.md)
- [Architecture Decision Records (ADRs)](docs/decisions/001-project-architecture.md)
- [Coding Standards](docs/coding-standards.md)
- [Git Standards](docs/git.md)
- [Testing Strategy](docs/testing.md)
- [Shopify-Grade Admin Guide](docs/ADMIN_GUIDE.md)
