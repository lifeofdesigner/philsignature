# PHILZ SIGNATURE Admin Portal Specifications

## The Shopify-Grade Experience
The admin panel is purpose-built for luxury brand managers and store operators.

### Absolute Principles
1. **Zero JSON Editing**: Administrators never inspect or edit raw JSON payloads.
2. **Visual Form Fields**: Color pickers, drag-and-drop media uploads, toggle switches, rich text editors, and select menus.
3. **High-Density Usability**: TanStack Table with search, status filters, sorting, bulk actions, and CSV export.
4. **Auto-Save & Toasts**: Instant visual confirmation when settings or products are saved.

### Admin Modules
1. **Dashboard**: Live sales, orders, conversion metrics, low stock indicators.
2. **Products**: Complete catalog CRUD, fragrance notes pyramid builder, image/video gallery, SEO.
3. **Collections**: Visual collection curation with hero banners and featured products.
4. **Categories**: Fragrance formulation classification.
5. **Orders**: Full lifecycle management (Pending -> Paid -> Processing -> Packed -> Shipped -> Delivered -> Cancelled -> Refunded), timeline generator, PDF invoice printing.
6. **Customers**: Customer directory, lifetime value metrics, order history.
7. **CMS**: Visual forms for Site Identity, Hero, About Us, Announcement Bar, Footer, FAQs, Social Links.
8. **Media Library**: Supabase Storage file browser and uploader.
9. **Coupons**: Percentage/Fixed discount builder, expiry date, usage limit tracker.
10. **Reviews**: Customer review moderation (Approve, Reject, Feature).
11. **Payments**: Gateway credentials, toggles for Paystack, Flutterwave, Bank Transfer, COD.
12. **Shipping**: Methods, flat rates, free shipping thresholds, nationwide zones.
13. **Analytics**: Revenue charts, top fragrances, customer geography.
14. **Users & Roles**: Team members, permissions, deactivation.
15. **Settings**: Store profile, WhatsApp concierge, currency, tax rates, timezone.
16. **SEO**: Page-by-page meta titles, descriptions, social share cards.

## Creating Admins & Users

Accounts are managed in Supabase Auth + a `profiles` table (`role`: `super_admin`, `staff`, or `customer`). There is no CLI seeder — provisioning is done through the app.

### Create the first / a new admin (super_admin or staff)
1. Ensure `.env` has `VITE_SUPABASE_SERVICE_ROLE_KEY` and `VITE_DEV_BOOTSTRAP_SECRET` set.
2. Run the dev server (`npm run dev`) and visit `/developer/bootstrap`.
3. Enter the passphrase (value of `VITE_DEV_BOOTSTRAP_SECRET`) to unlock the console.
4. Fill in the "Super Admin provisioning" form (email, password, first/last name, role) and submit.
   - This calls `DeveloperAdminRepository.createUser()` (`src/repositories/DeveloperAdminRepository.ts`), which uses the Supabase service-role client to create the auth user, waits for the `handle_new_user` trigger to create the matching `profiles` row, then sets `profiles.role`.

### Change an existing user's role
- From `/developer/bootstrap` (service-role console), or
- From `/admin/users` (`src/features/admin/users/pages/AdminUsersPage.tsx`) once logged in as an admin.

### Create a regular (customer) user
- Self-service signup at the storefront's signup page — creates the auth user and a `profiles` row defaulted to `role = customer`. No admin action needed.

