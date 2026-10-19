import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Play } from 'lucide-react';
import type { BlogPost } from '@/types/database';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false }) => {
  const isVideo = post.content_type === 'video';
  const wordCount = (post.content || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const thumbnail = post.video_thumbnail_url || post.cover_image_url || '/products/philz-signature-official-bottle.jpg';

  if (featured) {
    return (
      <Link
        to={`/blog/${post.slug}`}
        className="group relative flex flex-col md:flex-row overflow-hidden rounded-xs border border-luxury-border/60 bg-luxury-card hover:border-luxury-gold/50 transition-all duration-300 shadow-xl"
      >
        <div className="md:w-1/2 aspect-[16/10] md:aspect-auto overflow-hidden bg-luxury-charcoal relative">
          <img
            src={thumbnail}
            alt={`${post.title} - Philz Signature Blog`}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-black/60 border-2 border-white/80 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>
            </div>
          )}
        </div>
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-[10px] uppercase tracking-luxury-wide font-semibold bg-luxury-gold/15 text-luxury-gold border border-luxury-gold/30 rounded-xs">
                {post.category}
              </span>
              {isVideo ? (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-purple-400 font-medium">
                  <Play className="w-2.5 h-2.5 fill-purple-400" /> Video
                </span>
              ) : (
                <span className="text-[11px] uppercase tracking-wider text-luxury-gold/80 font-medium">★ Featured Story</span>
              )}
            </div>
            <h3 className="font-serif text-xl sm:text-2xl text-luxury-cream group-hover:text-luxury-gold transition-colors leading-snug">
              {post.title}
            </h3>
            <p className="text-sm text-luxury-sand/80 line-clamp-3 leading-relaxed font-light">{post.excerpt}</p>
          </div>
          <div className="pt-4 border-t border-luxury-border/40 flex items-center justify-between text-xs text-luxury-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formattedDate}</span>
              {!isVideo && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{readTime} min read</span>}
            </div>
            <span className="inline-flex items-center gap-1 text-luxury-gold group-hover:translate-x-1 transition-transform">
              {isVideo ? 'Watch' : 'Read Story'} <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-xs border border-luxury-border/60 bg-luxury-card hover:border-luxury-gold/50 transition-all duration-300 shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-luxury-charcoal">
        <img
          src={thumbnail}
          alt={`${post.title} - Philz Signature`}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 text-[10px] uppercase tracking-luxury-wide font-semibold bg-black/80 backdrop-blur-md text-luxury-gold border border-luxury-border rounded-xs">
            {post.category}
          </span>
        </div>
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-black/60 border-2 border-white/80 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2.5">
          <h3 className="font-serif text-lg sm:text-xl text-luxury-cream group-hover:text-luxury-gold transition-colors leading-snug line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-luxury-sand/80 line-clamp-3 leading-relaxed font-light">{post.excerpt}</p>
        </div>
        <div className="pt-4 border-t border-luxury-border/40 flex items-center justify-between text-xs text-luxury-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formattedDate}</span>
            {!isVideo && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{readTime} min</span>}
          </div>
          <span className="text-luxury-gold group-hover:translate-x-0.5 transition-transform">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};
