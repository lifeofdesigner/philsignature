# PHILZ SIGNATURE — Documentation Master Index

Welcome to the central architectural, technical, and engineering documentation repository for **PHILZ SIGNATURE**, an ultra-luxury perfume ecommerce web application.

---

## 🏛️ Architecture & Standards
- [Architecture Overview](architecture/overview.md) — Multi-tier UI-Hook-Service-Repository-Supabase flow.
- [Layer Responsibilities](architecture/layers.md) — Rules of isolation and dependency directions.
- [State Management](architecture/state-management.md) — Query caching, Contexts, and local state.
- [Coding Standards](coding-standards.md) — TypeScript, React 19, naming conventions, and file structures.
- [Testing Strategy](testing.md) — Unit, integration, E2E, and responsive verification protocols.
- [Git Standards](git.md) — Branching models, semantic commit conventions, and release tagging.
- [Environment Configuration](environment.md) — Complete environment variable dictionary and validation.

---

## 📐 Architecture Decision Records (ADRs)
- [ADR 001: Project Architecture](decisions/001-project-architecture.md) — Strict feature-first modular design.
- [ADR 002: Routing System](decisions/002-routing.md) — React Router v7 with enterprise shell layouts.
- [ADR 003: Authentication & RBAC](decisions/003-auth.md) — Supabase Auth and database role verification.
- [ADR 004: Storage & Assets](decisions/004-storage.md) — Supabase Storage bucketing and CDN caching.
- [ADR 005: Media Library](decisions/005-media.md) — Digital asset management with zero raw payload exposure.
- [ADR 006: Multi-Gateway Payments](decisions/006-payments.md) — Paystack, Flutterwave, Manual Bank Transfer, and COD.

---

## 🗄️ Database Documentation (Design Phase)
- [Schema Tables](database/tables.md) — Relational entity definitions and column constraints.
- [Entity Relationships](database/relationships.md) — Foreign keys, cardinality, and cascade rules.
- [Row Level Security (RLS)](database/rls.md) — Granular multi-tenant and role policies.
- [Storage Buckets](database/storage.md) — Bucket definitions, size restrictions, and MIME policies.
- [Stored Functions](database/functions.md) — Stored procedures and custom PostgreSQL functions.
- [Triggers](database/triggers.md) — Automatic `updated_at` and audit logging triggers.
- [Seed Strategy](database/seed-strategy.md) — Realistic luxury perfume catalog generation strategy.

---

## 🎨 Design System & UI Primitives
- [Design Tokens](design/tokens.md) — Obsidian, Alabaster, and Champagne Gold tokens.
- [Component Guidelines](design/components.md) — Headless Radix with CVA variants.
- [Button Component](design/Button.md)
- [Modal Dialog Component](design/Modal.md)
- [Data Table Component](design/DataTable.md)
- [Image Uploader Component](design/ImageUploader.md)
- [Rich Text Editor Component](design/RichTextEditor.md)

---

## 🔌 API, Services & Repositories
- [API Contracts](api/contracts.md) — Data schemas and communication protocols.
- [Service Layer](api/services.md) — Business logic encapsulation.
- [Repository Pattern](api/repositories.md) — Direct database isolation layer.

---

## 🚀 Deployment & Operations
- [Deployment Guide](deployment/guide.md) — Building and deploying on production infrastructure.
- [Production Checklist](deployment/production-checklist.md) — Pre-flight audit for performance and security.
- [Security & RBAC](security/rbac.md) — Granular permissions and developer backdoor protection.

---

## 🔒 Security Documentation Suite
- [Password Security Policy](security/password-policy.md) — Complexity criteria, Argon2id/Bcrypt hashing, rate limiting.
- [Session Policy](security/session-policy.md) — JWT lifetime, rotating refresh tokens, silent refresh, idle timeouts.
- [Client Login Flow](security/login-flow.md) — 5-tier sequence diagram, error handling, audit logging.
- [Account Recovery Flow](security/recovery-flow.md) — Cryptographic reset tokens, email dispatch, out-of-band updates.
- [RBAC Architecture](security/rbac-flow.md) — Customer, Staff, and Super Admin roles and boundaries.
- [Permission Engine](security/permission-flow.md) — Decoupled capability checks without hardcoded role strings.

---

## 🗺️ Implementation Phases
- [Phase 1: Foundation & Tooling](implementation/PHASE_1_FOUNDATION.md)
- [Phase 2: Database Schema & Seeds](implementation/PHASE_2_DATABASE_SCHEMA.md)
- [Phase 3: Auth, RBAC & Bootstrap](implementation/PHASE_3_AUTH_RBAC_BOOTSTRAP.md)
- [Phase 4: Storefront & Catalog Implementation](implementation/PHASE_4_STOREFRONT_CATALOG.md) | [Plan & Contracts](implementation/PHASE_4_IMPLEMENTATION_PLAN.md)
- [Phase 5: Checkout & Payments](implementation/PHASE_5_CHECKOUT_PAYMENTS_ORDERS.md)
- [Phase 6: Customer Portal](implementation/PHASE_6_CUSTOMER_PORTAL.md)
- [Phase 7: Admin Core E-Commerce](implementation/PHASE_7_ADMIN_CORE_ECOMMERCE.md)
- [Phase 8: Admin Visual CMS & Media](implementation/PHASE_8_ADMIN_CMS_MEDIA_SETTINGS.md)
- [Phase 9: Production Verification](implementation/PHASE_9_VERIFICATION_PRODUCTION.md)

