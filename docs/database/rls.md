# Row Level Security (RLS) Policy Specifications

## 1. Public Read Tables
- `products`: `SELECT` allowed for all users WHERE `status = 'published'`.
- `categories`, `collections`: `SELECT` allowed WHERE `is_active = true`.
- `product_images`, `product_videos`: `SELECT` allowed for all.
- `reviews`: `SELECT` allowed WHERE `status = 'approved'`.
- `cms_content`: `SELECT` allowed WHERE `is_published = true`.
- `shipping_methods`: `SELECT` allowed WHERE `is_active = true`.

## 2. Customer Isolated Tables
- `orders`: `SELECT` and `INSERT` allowed WHERE `auth.uid() = customer_id` (or anonymous order creation with guest email).
- `customer_addresses`: Full CRUD allowed ONLY WHERE `auth.uid() = customer_id`.
- `wishlist`: Full CRUD allowed ONLY WHERE `auth.uid() = customer_id`.
- `profiles`: `SELECT` and `UPDATE` allowed ONLY WHERE `auth.uid() = id`.

## 3. Administrative Full Access
- A PostgreSQL helper function `is_admin()` checks if `auth.uid()` has role `super_admin` or `staff` in `profiles`.
- All tables allow `ALL` operations for `is_admin() = true`.

