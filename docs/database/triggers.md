# Database Triggers Specification

## Automated PostgreSQL Triggers

1. **`set_updated_at` Trigger**:
   Applied to all mutable tables (`products`, `categories`, `collections`, `orders`, `customer_addresses`, `profiles`, `coupons`, `cms_content`, `site_settings`).
   Automatically sets `updated_at = NOW()` prior to any `UPDATE`.

2. **`on_auth_user_created` Trigger**:
   Listens to `INSERT` on `auth.users`.
   Executes `handle_new_user()` to populate `public.profiles`.

3. **`on_order_status_change` Trigger**:
   Listens to `UPDATE` of `fulfillment_status` or `financial_status` on `orders`.
   Automatically appends an event to `order_timeline`.

