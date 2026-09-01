# Storefront: Home Feature

## Purpose
The digital flagship entrance for PHILZ SIGNATURE. Features the editorial hero billboard, curated extrait drops, fragrance notes highlights, and VIP newsletter invitation.

## Flow
1. User arrives at `/`.
2. Hero section displays luxury headline and primary CTA.
3. Featured extraits and Private Reserve portfolios load from TanStack Query cache.
4. User clicks "Explore Creations" or selects an extrait flacon to navigate to the catalog.

## Dependencies
- `@/components/ui/button`
- `@/components/feedback/EmptyState`
- `@/services/ProductService`

## Database Tables
- `products`
- `collections`
- `cms_content` (key: `homepage_hero`)

## Future Improvements
- Interactive 3D WebGL flacon rotation.
- Video campaign loop background.

## Known Limitations
- Initial view displays curated reserve empty state pending Phase 4 connection.

