# Phase 2: Supabase Relational Database Schema & Luxury Catalog Seed

## Objective
Design and implement the full relational PostgreSQL database schema with automated triggers, Row Level Security (RLS) policies, and an authentic PHILZ SIGNATURE catalog seed.

## Key Deliverables
1. `supabase/schema.sql`: Complete DDL definitions for products, collections, categories, orders, order items, coupons, shipping, reviews, wishlist, addresses, profiles, roles, CMS, and settings.
2. `supabase/seed.sql`: Rich, authentic luxury catalog (Beyond You, Nomad, Fierce Elixir, Hera, Promise, Guidance, Oud en Botella, Royal Oud, Velvet Rose, home fragrance diffusers) with realistic olfactory pyramids, luxury prices, notes, and CMS copy.
3. RLS Policies: Public read access for published store items; authenticated user isolation for orders/wishlist; strict admin role authorization for management operations.
