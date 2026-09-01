# Stored Procedures & PostgreSQL Functions

## Functions Planned for Phase 2:

1. **`is_admin(user_id UUID)`**:
   Returns boolean indicating if user has role `super_admin` or `staff` in `profiles`. Security definer.

2. **`handle_new_user()`**:
   Automatically creates a row in `profiles` whenever a user signs up through Supabase Auth (`auth.users`).

3. **`generate_order_number()`**:
   Generates consecutive, branded order identifiers in the format `PS-XXXXXX` (e.g. `PS-10024`).

4. **`update_stock_on_order()`**:
   Decrements inventory count in `products` when an order reaches `paid` status.

5. **`calculate_order_totals(order_id UUID)`**:
   Verifies subtotal, shipping, discount, and tax mathematically on the server before finalizing payment.

