# Testing & Verification Strategy

## Testing Layers

### 1. Static Verification
- `npm run lint`: ESLint with strict TypeScript validation.
- `npm run build`: Type check via `tsc -b` and production bundle optimization with Vite.

### 2. Manual Verification Matrix
- **Device Viewports**: Mobile (375px), Tablet (768px), Laptop (1024px), Desktop (1440px+).
- **Navigation & Routing**: Deep links, 404 handling, 403 authorization stops.
- **Cart & Calculations**: Currency formatting, quantity increments, tax, coupon deductions.
- **Admin UX**: Visual forms, auto-saving feedback, image upload previews, CSV exports.

