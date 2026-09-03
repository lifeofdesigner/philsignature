import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Instagram, Heart, MessageCircle, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { cmsService, CMSService, type CmsInstagramSection, type CmsInstagramPost } from '@/services/CMSService';

interface InstagramFeedSectionProps {
  customConfig?: Partial<CmsInstagramSection>;
}

export const InstagramFeedSection: React.FC<InstagramFeedSectionProps> = ({ customConfig }) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const { data: instagramData } = useQuery({
    queryKey: ['cms-instagram-section'],
    queryFn: () => cmsService.getInstagramSection(),
    staleTime: 1000 * 60 * 5,
  });

  const config = { ...(instagramData || CMSService.DEFAULT_INSTAGRAM), ...customConfig };

  if (config.enabled === false) {
    return null;
  }

  const posts = config.posts && config.posts.length > 0 ? config.posts : CMSService.DEFAULT_INSTAGRAM.posts;
  const displayPosts = posts.slice(activeSlideIndex, activeSlideIndex + (config.post_count || 6));
  const effectivePosts = displayPosts.length < (config.post_count || 6) ? posts.slice(0, config.post_count || 6) : displayPosts;

  const handlePrev = () => {
    setActiveSlideIndex((prev) => (prev === 0 ? Math.max(0, posts.length - 6) : Math.max(0, prev - 1)));
  };

  const handleNext = () => {
    setActiveSlideIndex((prev) => (prev + 6 >= posts.length ? 0 : prev + 1));
  };

  return (
    <section className="py-20 sm:py-28 bg-black border-t border-white/10 relative overflow-hidden select-none">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-luxury-gold/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 sm:mb-14 text-center sm:text-left">
          <div className="space-y-2">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-luxury-gold font-medium block"
            >
              ✦ SOCIAL SANCTUARY
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-2xl sm:text-4xl text-white font-normal tracking-tight"
            >
              {config.title || 'Follow Our Olfactory Journey'}
            </motion.h2>
            {config.subtitle && (
              <p className="text-xs sm:text-sm text-white/60 font-light max-w-lg">
                {config.subtitle}
              </p>
            )}
          </div>

          {/* Instagram Handle Link & Nav Buttons */}
          <div className="flex items-center gap-4 shrink-0">
            <motion.a
              href={config.profile_url || 'https://instagram.com/philzsignature'}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-luxury-gold hover:text-black transition-all border border-white/20 hover:border-luxury-gold text-xs uppercase tracking-wider font-semibold text-white shadow-lg backdrop-blur-md"
            >
              <Instagram className="h-4 w-4" />
              <span>{config.handle || '@philzsignature'}</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </motion.a>

            {/* Slider Navigation Arrows */}
            {config.layout === 'slider' && posts.length > 4 && (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="h-9 w-9 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:border-luxury-gold hover:bg-white/10 transition-all cursor-pointer"
                  aria-label="Previous posts"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="h-9 w-9 rounded-full border border-white/20 flex items-center justify-center text-white/80 hover:text-white hover:border-luxury-gold hover:bg-white/10 transition-all cursor-pointer"
                  aria-label="Next posts"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Posts Grid / Carousel */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
          {effectivePosts.map((post: CmsInstagramPost, idx: number) => (
            <motion.a
              key={post.id}
              href={post.post_url || config.profile_url || 'https://instagram.com/philzsignature'}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="group relative aspect-square rounded-xs overflow-hidden bg-luxury-charcoal/80 border border-white/10 hover:border-luxury-gold/60 shadow-xl transition-all duration-500 block"
            >
              {/* Post Image */}
              <img
                src={post.image_url}
                alt={post.caption || `Philz Signature Instagram Post ${idx + 1}`}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Hover Dark Frosted Overlay */}
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 z-10">
                <div className="flex items-center justify-between text-luxury-gold">
                  <Instagram className="h-4 w-4" />
                  <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                </div>

                {post.caption && (
                  <p className="text-[11px] text-white/90 font-light line-clamp-3 leading-snug">
                    {post.caption}
                  </p>
                )}

                {/* Social Metrics */}
                <div className="flex items-center justify-between text-xs font-mono text-white/80 pt-2 border-t border-white/15">
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-3.5 w-3.5 text-luxury-gold fill-luxury-gold/40" />
                    <span>{post.likes_count || 420 + idx * 85}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5 text-white/70" />
                    <span>{post.comments_count || 18 + idx * 7}</span>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
