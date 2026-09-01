-- ==============================================================================
-- PHILZ SIGNATURE — 004_storage_buckets.sql
-- Storage Buckets & Storage Security Policies
-- ==============================================================================

-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('products', 'products', true),
    ('banners', 'banners', true),
    ('cms', 'cms', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- ------------------------------------------------------------------------------
-- STORAGE POLICIES: Public Read
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view product assets" ON storage.objects;
CREATE POLICY "Public can view product assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Public can view banner assets" ON storage.objects;
CREATE POLICY "Public can view banner assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Public can view CMS assets" ON storage.objects;
CREATE POLICY "Public can view CMS assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'cms');

DROP POLICY IF EXISTS "Public can view avatar assets" ON storage.objects;
CREATE POLICY "Public can view avatar assets"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- ------------------------------------------------------------------------------
-- STORAGE POLICIES: Admin Uploads & Deletions
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins manage product assets" ON storage.objects;
CREATE POLICY "Admins manage product assets"
    ON storage.objects FOR ALL
    USING (
        bucket_id IN ('products', 'banners', 'cms')
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "Users manage own avatars" ON storage.objects;
CREATE POLICY "Users manage own avatars"
    ON storage.objects FOR ALL
    USING (
        bucket_id = 'avatars'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

