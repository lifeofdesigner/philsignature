# ADR 005: Media Library & Asset Management

## Status
Accepted

## Context
Non-technical administrators must upload and manage fragrance assets without interacting with technical storage APIs or viewing JSON metadata.

## Decision
Build a visual Media Library module in the Admin CMS that tracks all uploaded files in a dedicated `media` database table while streaming the binary files directly to Supabase Storage. Administrators browse assets via a grid view with category filters, copy CDN links with one click, and preview images before assigning them to products.

## Consequences
- Clean, intuitive Shopify-like asset experience.
- Track asset dimensions, MIME types, and file sizes automatically.

