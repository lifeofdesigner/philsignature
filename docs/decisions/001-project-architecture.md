# ADR 001: Project Architecture & Feature-First Structure

## Status
Accepted

## Context
A full-scale luxury perfume ecommerce site with Storefront, Customer Portal, and Shopify-Grade Admin CMS requires hundreds of components, services, and queries. A monolithic pages/components directory leads to high coupling and maintainability friction.

## Decision
We adopt a strict feature-first architecture (`src/features/*`) partitioned into `storefront/`, `customer/`, and `admin/`. Each feature encapsulates its own `components/`, `hooks/`, `services/`, `types/`, `schemas/`, `pages/`, and `README.md`.

## Consequences
- **Positive**: High cohesion, clear ownership boundaries, easy onboarding.
- **Negative**: Slightly deeper initial folder hierarchy, mitigated by standard TypeScript path aliases (`@/*`).

