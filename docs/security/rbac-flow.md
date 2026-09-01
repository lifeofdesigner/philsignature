# Role-Based Access Control (RBAC) Architecture

## Role Taxonomy
The platform defines 3 explicit roles stored within `public.profiles.role`:

1. **`customer`**:
   - Standard client patron.
   - Privileges: Storefront browsing, wishlist management, cart checkout, own order history, own address management, review submission.
   - Prohibitions: Admin cockpit, user administration, product modification, CMS management.

2. **`staff`**:
   - Boutique operational personnel.
   - Privileges: All customer privileges + Admin CMS access, product catalog management, order fulfillment and tracking updates, inventory edits, customer directory views, review moderation.
   - Prohibitions: User role elevation/demotion, destructive settings modifications, financial gateway reconfiguration.

3. **`super_admin`**:
   - Executive brand administrators.
   - Privileges: Full platform authority, financial settings, staff role management, Super Admin creation, system database maintenance.

---

## Role Guard Protection
All routes within `/admin/*` are shielded by `<StaffGuard>` and validated against `PermissionEngine.canAccessAdmin()`.
Attempting unauthorized entry triggers an instant redirect to `/unauthorized`.
