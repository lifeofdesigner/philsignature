import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { cmsService, CMSService } from '@/services/CMSService';

export const BrandManifestoBanner: React.FC = () => {
  const { data: storyData } = useQuery({
    queryKey: ['brand-manifesto-story'],
    queryFn: () => cmsService.getStorySection(),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });

  const story = storyData || CMSService.DEFAULT_STORY;

  return (
    <section className="py-20 sm:py-28 bg-black border-b border-white/10 relative overflow-hidden">
      {/* Subtle Golden Glow Gradient in Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-luxury-gold/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-6 sm:px-12 max-w-4xl text-center relative z-10 space-y-6">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-luxury-gold font-medium block"
        >
          ✦ THE PHILZ SIGNATURE PHILOSOPHY
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-serif italic text-2xl sm:text-4xl lg:text-5xl text-white font-light leading-[1.25] tracking-tight drop-shadow-sm"
        >
          &ldquo;{story.subtitle || 'A SIGNATURE IS SOMETHING THAT BELONGS TO YOU.'}&rdquo;
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-xs sm:text-sm text-white/80 font-light max-w-2xl mx-auto leading-relaxed"
        >
          {story.body_paragraphs?.[0] || 'Founded in 2018, Philz Signature was created from a passion for fragrance and the belief that scent is one of the most powerful ways to express individuality.'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="pt-2 flex items-center justify-center gap-3"
        >
          <div className="h-[1px] w-8 bg-luxury-gold/40" />
          <span className="text-[10px] sm:text-xs tracking-luxury uppercase text-luxury-gold font-mono font-medium">
            {story.closing_statement || 'Your scent. Your signature.'}
          </span>
          <div className="h-[1px] w-8 bg-luxury-gold/40" />
        </motion.div>
      </div>
    </section>
  );
};
