import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cmsService, CMSService } from '@/services/CMSService';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';

export const AboutPage: React.FC = () => {
  const { data: storyData, isLoading } = useQuery({
    queryKey: ['about-page-story'],
    queryFn: () => cmsService.getStorySection(),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  const story = storyData || CMSService.DEFAULT_STORY;

  const bodyParagraphs = story.body_paragraphs && story.body_paragraphs.length > 0
    ? story.body_paragraphs
    : [
        'Founded in 2018, Philz Signature was created from a passion for fragrance and the belief that scent is one of the most powerful ways to express individuality.',
        'What began with a focus on personal fragrance has evolved into a broader scent lifestyle brand offering perfumes, perfume oils, home fragrances, gifting solutions and private-label services.',
      ];

  const philosophyPoints = story.philosophy_points && story.philosophy_points.length > 0
    ? story.philosophy_points
    : [
        'Fragrance should be personal.',
        'Quality should be intentional.',
        'Every experience should be memorable.',
      ];

  const storyBody = story.story_body && story.story_body.length > 0
    ? story.story_body
    : [
        'At the heart of Philz Signature is Philz the Perfumer, whose passion for fragrance inspired the creation of a brand focused on helping people discover scents that feel personal and distinctive.',
        'Over the years, Philz Signature has continued to evolve—expanding from personal fragrance into home fragrance, corporate gifting and customized fragrance solutions for businesses.',
      ];

  const perfumerBody = story.perfumer_body && story.perfumer_body.length > 0
    ? story.perfumer_body
    : [
        'Philz the Perfumer is the founder and creative force behind Philz Signature.',
        'Driven by a passion for fragrance and entrepreneurship, he has built Philz Signature around a simple belief: Everyone deserves to have a scent that feels like their own.',
        'From fragrance creation to brand development, the journey continues to be guided by curiosity, creativity and a commitment to creating memorable scent experiences.',
      ];

  return (
    <div className="bg-black text-white min-h-screen">
      {/* 1. Hero Section: ABOUT PHILZ SIGNATURE */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-luxury-gold/5 blur-[160px] pointer-events-none rounded-full" />
        
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl text-center relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-luxury-gold/40 bg-luxury-gold/10 text-luxury-gold text-[10px] sm:text-xs uppercase tracking-[0.25em] font-medium"
          >
            <Sparkles className="h-3 w-3" />
            <span>ESTABLISHED 2018</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight"
          >
            {story.title || 'ABOUT PHILZ SIGNATURE'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs sm:text-sm uppercase tracking-[0.2em] text-luxury-gold font-medium"
          >
            {story.subtitle || 'A SIGNATURE IS SOMETHING THAT BELONGS TO YOU.'}
          </motion.p>

          <div className="space-y-4 pt-4 text-xs sm:text-sm text-white/80 font-light leading-relaxed max-w-2xl mx-auto">
            {bodyParagraphs.map((para: string, idx: number) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Philosophy Pillars */}
          <div className="pt-8">
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-4 font-medium">
              {story.philosophy_title || 'Our Philosophy'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {philosophyPoints.map((point: string, idx: number) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-sm p-5 hover:border-luxury-gold/40 transition-colors"
                >
                  <div className="text-luxury-gold text-xs font-serif mb-2">0{idx + 1}</div>
                  <div className="text-xs text-white/90 font-light leading-snug">{point}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Visual Split & OUR STORY */}
      <section id="our-story" className="py-20 sm:py-28 border-b border-white/10 bg-luxury-charcoal/30">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Image */}
            <div className="relative aspect-[4/3] rounded-sm overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={story.image1_url || '/media/banners/banner-4.jpg'}
                alt="Philz Signature Scent Atelier"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-medium block">
                  Olfactory Mastery
                </span>
                <p className="text-xs text-white/90 font-light mt-1">
                  Crafting experiences that leave a lasting impression.
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-medium block">
                ✦ THE EVOLUTION
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
                {story.story_title || 'OUR STORY'}
              </h2>

              <div className="space-y-4 text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                {storyBody.map((para: string, idx: number) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {story.story_goal && (
                <div className="p-4 border-l-2 border-luxury-gold bg-luxury-gold/5 rounded-r-sm">
                  <p className="font-serif text-sm sm:text-base text-white/90 italic">
                    &ldquo;{story.story_goal}&rdquo;
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. MEET PHILZ THE PERFUMER */}
      <section id="perfumer" className="py-20 sm:py-28 border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl text-center space-y-8">
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-medium block">
              ✦ THE FOUNDER & CREATIVE FORCE
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl text-white font-normal">
              {story.perfumer_title || 'MEET PHILZ THE PERFUMER'}
            </h2>
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-luxury-gold font-medium">
              {story.perfumer_subtitle || 'BEHIND EVERY SIGNATURE IS A STORY.'}
            </p>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-white/80 font-light leading-relaxed max-w-2xl mx-auto">
            {perfumerBody.map((para: string, idx: number) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Closing Statement */}
          <div className="pt-10 border-t border-white/10 max-w-md mx-auto text-center space-y-2">
            <div className="font-serif text-lg tracking-[0.25em] text-luxury-gold uppercase font-medium">
              {story.closing_brand || 'PHILZ SIGNATURE'}
            </div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/90 font-light">
              {story.closing_statement || 'Your scent. Your signature.'}
            </p>
          </div>

          {/* Quick CTA to Contact / Services */}
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-luxury-gold hover:bg-luxury-gold-light text-black text-xs uppercase tracking-wider font-semibold transition-all shadow-lg"
            >
              <span>Explore Bespoke Solutions</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs uppercase tracking-wider font-semibold transition-all"
            >
              <span>Shop Fragrance Wardrobe</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
