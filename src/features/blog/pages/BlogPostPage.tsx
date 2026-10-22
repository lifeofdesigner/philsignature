import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogPost, useRelatedBlogPosts } from '../hooks/useBlogPosts';
import { BlogCard } from '../components/BlogCard';
import { SEO } from '@/components/common/SEO';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { blogService } from '@/services/BlogService';
import { getEmbedUrl, getVideoThumbnail, detectPlatform } from '@/lib/videoEmbed';
import { Calendar, Clock, User, Eye, ChevronLeft, ArrowLeft, Share2, Play } from 'lucide-react';

export const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError, refetch } = useBlogPost(slug);
  const { data: relatedPosts = [] } = useRelatedBlogPosts(post?.category, slug, 3);
  const hasRecordedView = useRef<string | null>(null);
  const [playing, setPlaying] = useState(false);
  // Derive platform early so it's available to the effect below
  const platform = detectPlatform(post?.video_embed_url || '');

  // Increment views once per mount for this post
  useEffect(() => {
    if (post?.id && hasRecordedView.current !== post.id) {
      hasRecordedView.current = post.id;
      blogService.recordView(post.id).catch(() => {});
    }
  }, [post?.id]);

  // Load Instagram embed script when playing an Instagram video
  useEffect(() => {
    if (platform !== 'instagram' || !playing) return;
    const w = window as any;
    if (w.instgrm) {
      w.instgrm.Embeds.process();
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [platform, playing]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-20">
        <ErrorState
          title="Could Not Load Article"
          message="We were unable to load this story. Please try again."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <EmptyState
          title="Article Not Found"
          description="The journal post you are looking for does not exist or may have been unpublished."
          actionLabel="Return to Blog"
          onAction={() => window.location.assign('/blog')}
        />
      </div>
    );
  }

  const isVideo = post.content_type === 'video';
  const embedUrl = isVideo ? (getEmbedUrl(post.video_embed_url || '') || post.video_embed_url) : null;
  const thumbnail = isVideo ? (post.video_thumbnail_url || getVideoThumbnail(post.video_embed_url || '') || post.cover_image_url) : null;
  const wordCount = (post.content || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date(post.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  const pageTitle = post.seo_title || `${post.title} | Philz Signature Blog`;
  const pageDescription = post.seo_description || post.excerpt || '';
  const coverImage = post.cover_image_url || 'https://www.philzsignature.com/brand/philz-favicon.png';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt || '',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <article className="min-h-screen bg-luxury-black text-luxury-cream">
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={`/blog/${post.slug}`}
        ogType="article"
        ogImage={coverImage}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          'headline': post.title,
          'image': [coverImage],
          'datePublished': post.published_at || post.created_at,
          'dateModified': post.updated_at,
          'author': {
            '@type': 'Person',
            'name': post.author_name || 'Philz Signature',
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Philz Signature',
            'logo': {
              '@type': 'ImageObject',
              'url': 'https://www.philzsignature.com/brand/philz-favicon.png',
            },
          },
          'description': pageDescription,
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `https://www.philzsignature.com/blog/${post.slug}`,
          },
        }}
      />

      {/* Hero Cover Header */}
      <header className="relative w-full aspect-[21/9] min-h-[360px] sm:min-h-[460px] lg:min-h-[520px] bg-luxury-charcoal overflow-hidden flex items-end">
        <img
          src={coverImage}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover object-center brightness-75 scale-102"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />

        <div className="relative z-10 container mx-auto px-4 sm:px-8 lg:px-12 pb-10 sm:pb-14 space-y-4 max-w-4xl">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-luxury text-luxury-sand/80 hover:text-luxury-gold transition-colors font-medium mb-2"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back to Journal</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 text-[11px] uppercase tracking-luxury-wide font-semibold bg-luxury-gold text-black rounded-xs">
              {post.category}
            </span>
            {post.featured && (
              <span className="px-3 py-1 text-[11px] uppercase tracking-luxury-wide font-semibold bg-black/80 text-luxury-gold border border-luxury-gold/40 rounded-xs">
                Featured Story
              </span>
            )}
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-luxury-cream leading-tight">
            {post.title}
          </h1>

          {/* Meta details */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-luxury-sand/80 pt-2 border-t border-luxury-border">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-luxury-gold" />
              {post.author_name || 'Philz Signature'}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-luxury-gold" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-luxury-gold" />
              {readTime} min read
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-luxury-gold" />
              {(post.views || 0) + 1} views
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Video Embed Player — click-to-play with thumbnail */}
          {isVideo && embedUrl && (
            <div className="space-y-4">
              <div className="relative w-full max-w-[800px] mx-auto aspect-video rounded-sm overflow-hidden bg-luxury-black border border-luxury-border/60 shadow-2xl">
                {!playing && thumbnail ? (
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 w-full h-full group focus:outline-none"
                    aria-label="Play video"
                  >
                    <img
                      src={thumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-luxury-gold/90 group-hover:bg-luxury-gold flex items-center justify-center shadow-2xl transition-all group-hover:scale-105">
                        <Play className="h-7 w-7 text-black fill-black ml-1" />
                      </div>
                    </div>
                  </button>
                ) : (
                  <iframe
                    src={playing ? `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}autoplay=1` : embedUrl}
                    title={post.title}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          )}

          {/* Excerpt Lead */}
          {post.excerpt && (
            <p className="font-serif text-lg sm:text-xl text-luxury-sand font-normal leading-relaxed italic border-l-2 border-luxury-gold pl-5 py-1">
              {post.excerpt}
            </p>
          )}

          {/* Rich Body Content (articles only) */}
          {!isVideo && post.content && (
          <div
            className="blog-content prose prose-invert prose-gold max-w-none
              prose-headings:font-serif prose-headings:text-luxury-cream prose-headings:font-normal
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-luxury-gold
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-luxury-sand/90 prose-p:leading-relaxed prose-p:font-light prose-p:text-base sm:prose-p:text-lg
              prose-ul:text-luxury-sand/90 prose-li:font-light
              prose-strong:text-luxury-cream prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          )}

          {/* Tags & Share */}
          <div className="pt-8 border-t border-luxury-border/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">
                Tags:
              </span>
              {post.tags && post.tags.length > 0 ? (
                post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 text-xs bg-luxury-card border border-luxury-border/60 text-luxury-sand rounded-xs"
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-luxury-muted">Luxury Fragrance</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-luxury bg-luxury-card border border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold hover:text-black transition-colors rounded-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Article</span>
            </button>
          </div>

          {/* Bottom Back Button */}
          <div className="pt-6">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-luxury-card border border-luxury-border hover:border-luxury-gold text-luxury-cream hover:text-luxury-gold transition-colors text-xs uppercase tracking-luxury font-medium rounded-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to All Stories</span>
            </Link>
          </div>
        </div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 pt-16 border-t border-luxury-border/60 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-luxury text-luxury-gold font-semibold block">
                  Keep Exploring
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl text-luxury-cream mt-1">
                  Related Stories in {post.category}
                </h2>
              </div>
              <Link
                to="/blog"
                className="text-xs uppercase tracking-luxury text-luxury-sand hover:text-luxury-gold transition-colors font-medium hidden sm:block"
              >
                View all stories →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <BlogCard key={related.id} post={related} />
              ))}
            </div>
          </section>
        )}
      </main>
    </article>
  );
};
