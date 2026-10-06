import React, { useState } from 'react';
import { useBlogPosts, useFeaturedBlogPosts } from '../hooks/useBlogPosts';
import { BlogCard } from '../components/BlogCard';
import { SEO } from '@/components/common/SEO';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Sparkles, BookOpen } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Fragrance Guide',
  'Luxury Living',
  'Behind the Scent',
  'Style & Scent',
];

export const BlogListPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [displayCount, setDisplayCount] = useState(9);

  const { data: featuredPosts, isLoading: isFeaturedLoading } = useFeaturedBlogPosts(3);
  const { data: postsData, isLoading: isPostsLoading, isError, refetch } = useBlogPosts({
    category: selectedCategory === 'All' ? undefined : selectedCategory,
    publishedOnly: true,
  });

  const isLoading = isFeaturedLoading || isPostsLoading;

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !postsData) {
    return (
      <div className="container mx-auto px-4 py-20">
        <ErrorState
          title="Could Not Load Stories"
          message="We were unable to load our blog journal. Please try refreshing."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const posts = postsData.posts;
  const visiblePosts = posts.slice(0, displayCount);
  const hasMore = posts.length > displayCount;

  return (
    <div className="min-h-screen bg-black text-luxury-cream py-14 sm:py-20">
      <SEO
        title="Insights & Stories | Philz Signature Blog"
        description="Explore luxury fragrance guides, artisanal scent notes, behind-the-scenes creations, and style journals from Nigeria's premier perfume house."
        canonical="/blog"
        ogType="website"
      />

      <div className="container mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-luxury-charcoal/80 border border-luxury-border rounded-full text-luxury-gold text-xs uppercase tracking-luxury font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Philz Signature Journal</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-luxury-cream tracking-tight">
            Insights & Stories
          </h1>
          <p className="text-sm sm:text-base text-luxury-sand/80 max-w-2xl mx-auto font-light leading-relaxed">
            Immerse yourself in the art of olfactory excellence, artisanal craftsmanship,
            and contemporary luxury living from Nigeria’s premier fragrance house.
          </p>
        </div>

        {/* Featured Posts Row (Only if on 'All' tab and featured posts exist) */}
        {selectedCategory === 'All' && featuredPosts && featuredPosts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-luxury-border/60 pb-3">
              <h2 className="text-xs uppercase tracking-luxury text-luxury-gold font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Featured Editorial
              </h2>
              <span className="text-xs text-luxury-muted font-light">Curated selections</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <BlogCard key={post.id} post={post} featured />
              ))}
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 border-y border-luxury-border/40 py-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setDisplayCount(9);
                }}
                className={`px-4 py-2 text-xs uppercase tracking-luxury-wide font-medium rounded-xs transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-luxury-gold text-black shadow-md shadow-luxury-gold/20'
                    : 'bg-luxury-card border border-luxury-border/60 text-luxury-sand/80 hover:border-luxury-gold/40 hover:text-luxury-cream'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* All Posts Grid */}
          {visiblePosts.length === 0 ? (
            <div className="text-center py-16 space-y-3 bg-luxury-card/30 border border-luxury-border/40 rounded-xs">
              <p className="font-serif text-lg text-luxury-cream">No stories found</p>
              <p className="text-sm text-luxury-muted">
                There are no articles in the "{selectedCategory}" category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {visiblePosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-8">
              <button
                type="button"
                onClick={() => setDisplayCount((prev) => prev + 6)}
                className="px-8 py-3 bg-luxury-card border border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold hover:text-black transition-all duration-300 text-xs uppercase tracking-luxury font-semibold rounded-xs shadow-lg"
              >
                Load More Stories
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
