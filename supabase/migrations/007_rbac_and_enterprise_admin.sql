-- ==============================================================================
-- PHILZ SIGNATURE — 007_rbac_and_enterprise_admin.sql
-- Database-driven RBAC, Feature Flags, Trash Bin, Version History, Notifications & Locks
-- ==============================================================================

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    group_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ROLE_PERMISSIONS JOIN TABLE
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- 4. FEATURE FLAGS TABLE
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TRASH BIN (SOFT DELETE REPOSITORY)
CREATE TABLE IF NOT EXISTS public.trash_bin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CMS VERSION HISTORY
CREATE TABLE IF NOT EXISTS public.cms_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    version_number INT NOT NULL DEFAULT 1,
    title TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. ADMIN NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ENTITY EDITING LOCKS (COLLABORATION CONFLICT PREVENTION)
CREATE TABLE IF NOT EXISTS public.entity_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    locked_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    locked_by_name TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(entity_type, entity_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_roles_key ON public.roles(key);
CREATE INDEX IF NOT EXISTS idx_permissions_key ON public.permissions(key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON public.feature_flags(key);
CREATE INDEX IF NOT EXISTS idx_trash_bin_entity ON public.trash_bin(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_cms_versions_entity ON public.cms_versions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_entity_locks_entity ON public.entity_locks(entity_type, entity_id);

-- RLS POLICIES
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trash_bin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_locks ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated staff, full access for super admin / staff
DROP POLICY IF EXISTS "Public read roles" ON public.roles;
CREATE POLICY "Public read roles" ON public.roles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read permissions" ON public.permissions;
CREATE POLICY "Public read permissions" ON public.permissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read role_permissions" ON public.role_permissions;
CREATE POLICY "Public read role_permissions" ON public.role_permissions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read feature_flags" ON public.feature_flags;
CREATE POLICY "Public read feature_flags" ON public.feature_flags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Staff read trash_bin" ON public.trash_bin;
CREATE POLICY "Staff read trash_bin" ON public.trash_bin FOR ALL USING (true);

DROP POLICY IF EXISTS "Staff manage cms_versions" ON public.cms_versions;
CREATE POLICY "Staff manage cms_versions" ON public.cms_versions FOR ALL USING (true);

DROP POLICY IF EXISTS "Users manage notifications" ON public.notifications;
CREATE POLICY "Users manage notifications" ON public.notifications FOR ALL USING (true);

DROP POLICY IF EXISTS "Staff manage entity_locks" ON public.entity_locks;
CREATE POLICY "Staff manage entity_locks" ON public.entity_locks FOR ALL USING (true);

-- SEED DEFAULT FEATURE FLAGS
INSERT INTO public.feature_flags (key, name, description, is_enabled) VALUES
('blog_enabled', 'Blog & Articles Module', 'Controls visibility of blog posts and editorial content', true),
('reviews_enabled', 'Customer Reviews & Rating', 'Controls customer review submission and moderation', true),
('coupons_enabled', 'Discounts & Privilege Codes', 'Enables discount code validation at checkout', true),
('instagram_feed_enabled', 'Instagram Live Feed', 'Displays live curated Instagram social feed', true),
('ai_assistant_enabled', 'AI Content Assistant', 'Provides in-CMS generative copy assistant', true),
('newsletter_enabled', 'Newsletter Subscriptions', 'Enables email list signup forms and campaigns', true),
('loyalty_program_enabled', 'V.I.P Loyalty Program', 'Enables customer reward points and VIP tiers', true)
ON CONFLICT (key) DO UPDATE SET is_enabled = EXCLUDED.is_enabled;

NOTIFY pgrst, 'reload schema';
