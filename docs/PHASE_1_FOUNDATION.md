# Phase 1: Project Foundation, Tooling, Luxury Theme System & Shell Architecture

## Objective
Establish the foundational infrastructure, dependency stack, luxury design tokens, provider tree, layout shells, and type-safe environment configuration for PHILZ SIGNATURE.

## Key Deliverables
1. **Tooling & Setup**: React 19, Vite, TypeScript 5, Tailwind CSS, PostCSS, Autoprefixer, ESLint.
2. **Design Tokens**: Luxury color palette (Obsidian, Charcoal, Alabaster, Champagne Gold), typography pairings, custom utility classes.
3. **Provider Tree**: `AppProviders` orchestrating QueryClient, Auth, Theme, Toast (Sonner), Modal, and Loading state.
4. **Shell Layouts**:
   - `StoreShell`: Public luxury layout with Announcement Bar, Navbar, and Footer.
   - `CustomerShell`: Authenticated customer account layout with tabbed sidebar.
   - `AdminShell`: Shopify-grade dashboard layout with collapsible navigation and quick actions.
5. **Feedback States**: Reusable `ErrorState`, `LoadingState`, `EmptyState`, `UnauthorizedState`, `MaintenanceState`.
6. **Config & Environment**: Zod-validated environment schema (`src/config/env.ts`).
7. **Scaffolding**: Complete feature-first directory architecture ready for Supabase integration.
