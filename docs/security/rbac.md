# Security, Roles & Access Control (RBAC)

## User Roles Hierarchy
1. **`super_admin`**: Full system control (staff invitations, database operations, site settings, payments, orders).
2. **`staff`**: Operational management (orders fulfillment, product creation, coupon management, reviews moderation).
3. **`customer`**: Personal account, order history, wishlist, address book.

## Route Protection
- Client-side navigation guards verify user session and profile role before mounting protected layouts.
- Database Row Level Security acts as the immutable gatekeeper.

