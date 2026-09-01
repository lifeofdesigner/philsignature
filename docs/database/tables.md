# Database Tables Specification

Before any SQL is executed, this document formally specifies all 18 core relational tables:

1. **`profiles`**: User details linked to `auth.users(id)`.
   - Columns: `id (UUID PK)`, `email (TEXT)`, `first_name (TEXT)`, `last_name (TEXT)`, `phone (TEXT)`, `avatar_url (TEXT)`, `role (TEXT)`, `created_at (TIMESTAMPTZ)`, `updated_at (TIMESTAMPTZ)`.
2. **`categories`**: Formulation types (Extrait, EDP, Diffusers).
   - Columns: `id (UUID PK)`, `name (TEXT)`, `slug (TEXT UNIQUE)`, `description (TEXT)`, `image_url (TEXT)`, `display_order (INT)`, `is_active (BOOLEAN)`.
3. **`collections`**: Curated boutique lines.
   - Columns: `id (UUID PK)`, `name (TEXT)`, `slug (TEXT UNIQUE)`, `tagline (TEXT)`, `description (TEXT)`, `banner_url (TEXT)`, `is_featured (BOOLEAN)`.
4. **`products`**: Central fragrance catalog.
   - Columns: `id (UUID PK)`, `name (TEXT)`, `slug (TEXT UNIQUE)`, `sku (TEXT UNIQUE)`, `barcode (TEXT)`, `price (NUMERIC)`, `sale_price (NUMERIC)`, `stock_quantity (INT)`, `weight_grams (INT)`, `brand (TEXT)`, `category_id (UUID FK)`, `collection_id (UUID FK)`, `fragrance_family (TEXT)`, `top_notes (TEXT[])`, `middle_notes (TEXT[])`, `base_notes (TEXT[])`, `ingredients (TEXT)`, `how_to_use (TEXT)`, `status (TEXT)`, `is_featured (BOOLEAN)`, `is_bestseller (BOOLEAN)`, `is_new_arrival (BOOLEAN)`, `is_trending (BOOLEAN)`.
5. **`product_images`**: Multi-image gallery per product.
6. **`product_videos`**: Promotional video reels.
7. **`coupons`**: Discount promotions engine.
8. **`shipping_methods`**: Flat rates, free shipping thresholds, express tiers.
9. **`orders`**: Customer transactions and fulfillment tracking.
10. **`order_items`**: Line items snapshotting product price and quantity.
11. **`order_timeline`**: Event stream for tracking shipments.
12. **`reviews`**: Customer testimonials and star ratings (1-5).
13. **`wishlist`**: Customer product saves.
14. **`customer_addresses`**: Saved delivery locations.
15. **`cms_content`**: Visual editable sections (Announcement bar, Hero, Story, Footer).
16. **`site_settings`**: Global configuration key-values.
17. **`media`**: Digital asset tracking registry.
18. **`activity_logs`**: Admin action audit trails.

