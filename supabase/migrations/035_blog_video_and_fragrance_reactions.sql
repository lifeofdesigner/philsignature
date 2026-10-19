-- ==============================================================================
-- PHILZ SIGNATURE — 035_blog_video_and_fragrance_reactions.sql
-- Add video embed support to blog_posts and seed Fragrance Reactions posts
-- ==============================================================================

-- Add video/content-type columns
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS content_type text NOT NULL DEFAULT 'article';
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS video_embed_url text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS video_thumbnail_url text;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS featured_products uuid[];

-- Constraint: content_type must be 'article' or 'video'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'blog_posts_content_type_check'
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_content_type_check CHECK (content_type IN ('article', 'video'));
  END IF;
END;
$$;

-- Index for filtering by content type
CREATE INDEX IF NOT EXISTS idx_blog_posts_content_type ON public.blog_posts(content_type) WHERE published = true;

-- ==============================================================================
-- SEED 2 PLACEHOLDER FRAGRANCE REACTION VIDEO POSTS
-- ==============================================================================

INSERT INTO public.blog_posts (
    title,
    slug,
    excerpt,
    content,
    content_type,
    video_embed_url,
    cover_image_url,
    author_name,
    category,
    tags,
    published,
    featured,
    views,
    seo_title,
    seo_description,
    published_at
) VALUES
(
    'Fragrance Reaction #1',
    'fragrance-reaction-1',
    'Phil and his wife react to a new fragrance from the collection.',
    '',
    'video',
    '',
    'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800',
    'Philz Signature',
    'Fragrance Reactions',
    ARRAY['Fragrance Reaction', 'Video', 'Philz Signature'],
    true,
    true,
    0,
    'Fragrance Reaction #1 | Philz Signature',
    'Watch Phil and his wife react to a new fragrance from the Philz Signature collection.',
    NOW()
),
(
    'Fragrance Reaction #2',
    'fragrance-reaction-2',
    'Phil and his wife react to a new fragrance from the collection.',
    '',
    'video',
    '',
    'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800',
    'Philz Signature',
    'Fragrance Reactions',
    ARRAY['Fragrance Reaction', 'Video', 'Philz Signature'],
    true,
    true,
    0,
    'Fragrance Reaction #2 | Philz Signature',
    'Watch Phil and his wife react to a new fragrance from the Philz Signature collection.',
    NOW()
)
ON CONFLICT (slug) DO NOTHING;
