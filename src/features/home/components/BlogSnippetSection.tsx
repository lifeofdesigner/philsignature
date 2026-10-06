import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Calendar, Clock } from 'lucide-react';
import { useFeaturedBlogPosts } from '@/features/blog/hooks/useBlogPosts';

export const BlogSnippetSection: React.FC = () => {
  const { data: featuredPosts = [], isLoading } = useFeaturedBlogPosts(3);

  if (isLoading || featuredPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 sm:py-28 bg-black text-luxury-cream border-t border-luxury-border/40 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-luxury-gold/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 sm:px-8 lg:px-12 relative z-10 space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-luxury-border/60 pb-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-luxury-charcoal/80 border border-luxury-border rounded-full text-luxury-gold text-xs uppercase tracking-luxury font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Editorial Journal</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-luxury-cream tracking-tight">
              Insights & Stories
            </h2>
            <p className="text-sm sm:text-base text-luxury-sand/80 max-w-xl font-light">
              Explore the artistry of fragrance creation, notes breakdowns, and luxury scent lifestyles.
            </p>
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury text-luxury-gold hover:text-luxury-cream transition-colors font-semibold group self-start sm:self-end pb-1"
          >
            <span>View All Stories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3 Most Recent Featured Posts as Horizontal Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredPosts.map((post) => {
            const wordCount = (post.content || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
            const readTime = Math.max(1, Math.ceil(wordCount / 200));
            const formattedDate = post.published_at
              ? new Date(post.published_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

            return (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="group flex flex-col sm:flex-row lg:flex-col overflow-hidden rounded-xs border border-luxury-border/60 bg-luxury-card hover:border-luxury-gold/60 transition-all duration-400 shadow-xl hover:-translate-y-1"
              >
                {/* Image on left for sm/tablet, stacked on mobile & desktop columns */}
                <div className="sm:w-2/5 lg:w-full aspect-[16/10] sm:aspect-auto lg:aspect-[16/10] overflow-hidden bg-luxury-charcoal shrink-0">
                  <img
                    src={post.cover_image_url || '/products/philz-signature-official-bottle.jpg'}
                    alt={`${post.title} - Philz Signature`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
                    loading="lazy"
                  />
                </div>

                {/* Content on right */}
                <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 text-[9px] uppercase tracking-luxury-wide font-semibold bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30 rounded-xs">
                        {post.category}
                      </span>
                      <span className="text-[11px] text-luxury-muted flex items-center gap-1 font-light">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl text-luxury-cream group-hover:text-luxury-gold transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-luxury-sand/80 line-clamp-3 leading-relaxed font-light">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-luxury-border/40 flex items-center justify-between text-xs text-luxury-muted">
                    <span className="flex items-center gap-1 font-light">
                      <Clock className="w-3 h-3" />
                      {readTime} min read
                    </span>
                    <span className="text-luxury-gold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-medium">
                      Read <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
