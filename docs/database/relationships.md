# Entity Relationships & Cardinality

## Foreign Key Topology

```
categories (1) ──────────< (N) products
collections (1) ─────────< (N) products
products (1) ────────────< (N) product_images
products (1) ────────────< (N) product_videos
products (1) ────────────< (N) reviews
products (1) ────────────< (N) wishlist
profiles (1) ────────────< (N) orders
profiles (1) ────────────< (N) customer_addresses
profiles (1) ────────────< (N) reviews
profiles (1) ────────────< (N) wishlist
orders (1) ──────────────< (N) order_items
orders (1) ──────────────< (N) order_timeline
products (1) ────────────< (N) order_items
```

## Cascade & Deletion Policies
- `product_images`: `ON DELETE CASCADE` when product is removed.
- `order_items`: `ON DELETE RESTRICT` to protect financial audit history.
- `orders`: `ON DELETE RESTRICT` - orders are never hard-deleted, only marked `cancelled`.
- `customer_addresses`: `ON DELETE CASCADE` when user profile is deleted.

