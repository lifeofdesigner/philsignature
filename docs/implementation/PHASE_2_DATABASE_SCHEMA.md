# Phase 2: Database Schema, Security & Seed Data

## Executive Summary
Phase 2 establishes the production-grade PostgreSQL relational schema on Supabase for PHILZ SIGNATURE. It enforces strict Row Level Security (RLS) across all 18 tables, installs stored triggers for auto-timestamping and review aggregations, configures digital storage buckets, and seeds the authentic luxury opening catalog.

---

## Migration Architecture

All migrations are located under `supabase/migrations/`:

| Migration File | Description |
| :--- | :--- |
| `001_initial_schema.sql` | 18 relational tables, foreign keys, check constraints, GIN/B-Tree indexes. |
| `002_security_rls.sql` | Security definer functions (`is_admin`, `is_super_admin`) and granular RLS policies. |
| `003_functions_and_triggers.sql` | `update_updated_at_column`, `handle_new_user`, `update_product_rating`, `decrement_product_stock`, `increment_product_stock`, `track_consignment`. |
| `004_storage_buckets.sql` | Buckets (`products`, `banners`, `cms`, `avatars`) and object security policies. |
| `005_seed_data.sql` | 4 Categories, 4 Collections, 7 Signature Extraits, Shipping Methods, Coupons, CMS Sections, Site Settings. |
| `apply_all.sql` | **Consolidated one-click execution script** for Supabase Dashboard SQL Editor. |

---

## 18 Core Relational Tables

1. **`profiles`**: Tied to `auth.users(id)`. Stores name, phone, role (`super_admin`, `staff`, `customer`), and active status.
2. **`categories`**: Formulation hierarchies (`Extrait de Parfum`, `Eau de Parfum`, `Home Fragrance`, `Body Elixir`).
3. **`collections`**: Brand portfolios (`The Private Reserve`, `The Oud Edition`, `Signature Classics`, `Discovery Sets`).
4. **`products`**: Haute parfumerie catalog with prices, stock levels, volume, concentration, and array-based olfactory pyramid notes (`top_notes`, `middle_notes`, `base_notes`).
5. **`product_images`**: Multi-asset photography gallery per flacon.
6. **`product_videos`**: Cinematic promotional fragrance reels.
7. **`coupons`**: Privilege promotions engine (percentage and fixed amounts with spend thresholds).
8. **`shipping_methods`**: Logistics tiers (Nationwide Express, Lagos Same-Day Courier, DHL International).
9. **`orders`**: Client acquisitions and fulfillment tracking with snapshot addresses and monetary breakdowns.
10. **`order_items`**: Line-item purchase snapshots.
11. **`order_timeline`**: Event stream for live package tracking.
12. **`reviews`**: Verified customer ratings (1-5) and olfactory testimonials.
13. **`wishlist`**: Saved flacon bookmarks.
14. **`customer_addresses`**: Multi-destination delivery address book.
15. **`cms_content`**: Editable visual sections (`announcement_bar`, `homepage_hero`, `brand_story`, `footer_config`).
16. **`site_settings`**: Global boutique key-value configuration.
17. **`media`**: Digital asset tracking registry for Supabase Storage.
18. **`activity_logs`**: Administrative audit trail for catalog and order mutations.

---

## Row Level Security (RLS) Rules
- **Public**: Can query active categories, active collections, published products, product imagery/videos, active shipping methods, active coupons, approved reviews, published CMS content, and public site settings.
- **Customers**: Can only read/update their own profile, read their own orders and timeline, manage their wishlist and saved addresses, and submit reviews for their purchases.
- **Admins (`staff` / `super_admin`)**: Full CRUD access on all tables, evaluated via `is_admin()` security definer function without recursion.

---

## The 7 Signature Extraits Seeded

1. **Beyond You** (Extrait de Parfum, 100ml, ₦185,000)
   - *Top*: Calabrian Bergamot, Pink Peppercorn, Elemi Resin
   - *Middle*: Rose Damascena, Frankincense Carterii, Tuscan Leather
   - *Base*: Cambodian Agarwood, Grey Ambergris, Laotian Benzoin
2. **Nomad** (Extrait de Parfum, 100ml, ₦175,000)
   - *Top*: Wild Cardamom, Grated Nutmeg, Persian Saffron
   - *Middle*: Atlas Cedarwood, Nagarmotha Cypriol, Florentine Iris
   - *Base*: Dark Tobacco Leaf, Patchouli Coeur, Bourbon Vanilla Bean
3. **Fierce Elixir** (Extrait de Parfum, 100ml, ₦195,000)
   - *Top*: Sicilian Blood Orange, Fresh Ginger Root, Dark Spiced Rum
   - *Middle*: Jasmine Sambac, Ceylon Cinnamon, Black Orchid
   - *Base*: Smoked Agarwood, Cashmeran Wood, Roasted Tonka Bean
4. **Hera** (Extrait de Parfum, 100ml, ₦165,000)
   - *Top*: Tunisian Neroli, Mandarin Essence, White Peach
   - *Middle*: Indian Tuberose, Ylang-Ylang Extra, Heliotrope
   - *Base*: Velvety White Musk, Mysore Sandalwood, Bourbon Vanilla Infusion
5. **Promise** (Extrait de Parfum, 100ml, ₦190,000)
   - *Top*: Crisp Green Apple, Cardamom Pods, Madagascar Clove
   - *Middle*: Taif Rose Essence, Turkish Rose Absolute, Cistus Labdanum
   - *Base*: Castoreum Accord, Mountain Oakmoss, Golden Ambergris
6. **Guidance** (Extrait de Parfum, 100ml, ₦180,000)
   - *Top*: Crisp Pear Nectar, Silver Incense, Roasted Hazelnut
   - *Middle*: Osmanthus Blossom, Bulgarian Rose, Golden Saffron
   - *Base*: Australian Sandalwood, Madagascar Vanilla, Akigalawood
7. **Oud en Botella** (Extrait de Parfum, 100ml, ₦220,000)
   - *Top*: French Cistus, Dewy Violet Leaf, Calabrian Bergamot
   - *Middle*: 25-Year Vintage Assam Oud, Birch Tar, Spanish Leather
   - *Base*: Civet Accord, Amber Resin, Roasted Java Vetiver

---

## How to Apply to Supabase
1. Open your project on [Supabase Dashboard](https://supabase.com/dashboard).
2. Navigate to the **SQL Editor**.
3. Copy the full contents of `supabase/migrations/apply_all.sql`.
4. Click **Run**.
5. All 18 tables, RLS policies, triggers, storage buckets, and seed records will be created instantly.
