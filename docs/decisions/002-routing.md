# ADR 002: Routing System & Shell Layouts

## Status
Accepted

## Context
Different application areas require drastically different layouts (luxury consumer storefront with announcement bar and minimalist navigation vs. data-dense admin with sidebar, topbar, and metrics vs. customer portal).

## Decision
Use React Router DOM with layout shells (`StoreShell`, `CustomerShell`, `AdminShell`). Routes are declared centrally in `src/routes/index.tsx` mapping directly to feature-level page entrypoints.

## Consequences
- Clean separation of public, customer, and admin concerns.
- Shell layouts wrap children through standard `<Outlet />`.

