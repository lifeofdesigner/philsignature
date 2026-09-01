# Production Deployment Guide

## Prerequisites
- Node.js >= 20.x
- Supabase Project URL & Anon Key
- Hosting Platform (Vercel, Netlify, Cloudflare Pages)

## Build Commands
```bash
# Clean install
npm ci

# Production Typecheck & Bundle
npm run build

# Preview Production Build Locally
npm run preview
```

## Environment Variables to Inject
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_NAME`
- `VITE_APP_URL`
- `VITE_DEV_BOOTSTRAP_SECRET`
- `VITE_ENABLE_DEV_BOOTSTRAP`

