# PHILZ SIGNATURE Architecture

## System Overview
PHILZ SIGNATURE is an ultra-luxury perfume ecommerce web application engineered with a modern, high-performance, single-page architecture built strictly with:
- **Framework**: React 19 + Vite 6 + TypeScript 5
- **Styling & Design System**: Tailwind CSS v3 with luxury tokens, Radix UI headless primitives, Framer Motion transitions
- **Backend & Database**: Supabase (PostgreSQL with Row Level Security, Supabase Storage, Supabase Auth)
- **Data Fetching & State**: TanStack Query (React Query v5) + Context API for Auth and UI states
- **Form Management**: React Hook Form with Zod schema validation
- **Data Presentation**: TanStack Table for Shopify-grade Admin data tables
- **Routing**: React Router DOM (v7)

---

## Provider Hierarchy
```tsx
<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <UIProvider>
              <RouterProvider router={router} />
              <Toaster />
            </UIProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
</ErrorBoundary>
```

---

## Directory Architecture
```
src/
├── assets/                 # Brand assets, SVGs, static luxury patterns
├── config/                 # Environment validation (Zod) and site metadata
├── lib/                    # Supabase client, query client, utilities
├── types/                  # Domain TypeScript interfaces (database, catalog, orders)
├── styles/                 # Global styles, Tailwind base layers, typography
├── providers/              # Composite provider hierarchy
├── components/
│   ├── ui/                 # Atomic luxury primitives (Button, Input, Card, Modal, etc.)
│   ├── feedback/           # ErrorState, LoadingState, EmptyState, UnauthorizedState
│   ├── layouts/            # Shell layouts (StoreShell, CustomerShell, AdminShell)
│   └── common/             # Global components (Navbar, AnnouncementBar, Footer, etc.)
├── features/               # Feature-first modular business logic
│   ├── catalog/            # Products, collections, notes pyramid, filters
│   ├── cart/               # Cart drawer, calculations, coupon discounts
│   ├── checkout/           # Multi-gateway checkout, Paystack, Flutterwave, Transfer
│   ├── customer/           # Dashboard, orders, invoices, addresses
│   ├── admin/              # Shopify-grade admin modules and data tables
│   ├── cms/                # Visual page content forms, preview, settings
│   └── auth/               # Customer login, registration, password recovery
└── pages/                  # Route-level page components
```

---

## Security & Access Control
- **Public Routes**: Home, Shop, Product Details, Collections, About, Contact, FAQ, Cart, Checkout, Order Tracking.
- **Protected Customer Routes**: `/account/*` requires active Supabase session.
- **Protected Admin Routes**: `/admin/*` requires role `super_admin` or `staff`.
- **Developer Backdoor**: `/developer/bootstrap` strictly guarded by passphrase validation, environment toggle, and local host verification.

