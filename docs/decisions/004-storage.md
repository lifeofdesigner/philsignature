# ADR 004: Supabase Storage & Asset Segregation

## Status
Accepted

## Context
High-resolution fragrance flacon imagery, campaign video reels, and brand logos require performant, secure, and organized object storage.

## Decision
Create 4 segregated Supabase Storage buckets:
1. `products`: Flacon photographs, packaging, gallery shots (Public read, Admin write).
2. `banners`: Homepage hero images, collection banners (Public read, Admin write).
3. `branding`: Logos, crests, favicons, watermarks (Public read, Admin write).
4. `invoices`: Generated customer invoices and receipts (Authenticated customer read).

## Consequences
- Prevents cross-contamination of public brand assets and private customer documents.
- Simplifies CDN caching policies per bucket type.

