# Production Launch Checklist

- [ ] All RLS policies enabled and verified on Supabase tables.
- [ ] Supabase Storage buckets created and set to appropriate public/authenticated access.
- [ ] Environment variables verified and loaded in production hosting.
- [ ] Developer bootstrap disabled or secret rotated in production (`VITE_ENABLE_DEV_BOOTSTRAP=false`).
- [ ] Payment gateway test keys replaced with live keys in Admin Settings.
- [ ] DNS mapped to custom boutique domain with SSL active.
- [ ] 404 and Error boundaries thoroughly tested.
- [ ] Lighthouse performance, accessibility, and SEO audits scoring >90.

