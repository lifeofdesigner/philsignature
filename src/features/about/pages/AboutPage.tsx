import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cmsService, CMSService } from '@/services/CMSService';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';
import { PageTransition, WordReveal, FadeIn, LUXURY_EASE } from '@/components/common/MotionWrapper';

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
    <PageTransition className="bg-black text-white min-h-screen">
      {/* 1. Hero Section: ABOUT PHILZ SIGNATURE */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 border-b border-white/10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-luxury-gold/5 blur-[160px] pointer-events-none rounded-full" />
        
        <div className="container mx-auto px-4 sm:px-8 max-w-4xl text-center relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: LUXURY_EASE }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-luxury-gold/40 bg-luxury-gold/10 text-luxury-gold text-[10px] sm:text-xs uppercase tracking-[0.25em] font-medium"
          >
            <Sparkles className="h-3 w-3" />
            <span>ESTABLISHED 2018</span>
          </motion.div>

          <WordReveal
            as="h1"
            text={story.title || 'ABOUT PHILZ SIGNATURE'}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight"
          />

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: LUXURY_EASE }}
            className="text-xs sm:text-sm uppercase tracking-[0.2em] text-luxury-gold font-medium"
          >
            {story.subtitle || 'A SIGNATURE IS SOMETHING THAT BELONGS TO YOU.'}
          </motion.p>

          <FadeIn delay={0.3} distance={16}>
            <div className="space-y-4 pt-4 text-xs sm:text-sm text-white/80 font-light leading-relaxed max-w-2xl mx-auto">
              {bodyParagraphs.map((para: string, idx: number) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </FadeIn>

          {/* Philosophy Pillars */}
          <div className="pt-8">
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/50 mb-4 font-medium">
              {story.philosophy_title || 'Our Philosophy'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {philosophyPoints.map((point: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: LUXURY_EASE }}
                  className="p-5 bg-neutral-950/80 border border-white/10 hover:border-luxury-gold/50 rounded-sm space-y-2 transition-all duration-300"
                >
                  <div className="text-luxury-gold font-serif text-sm">✦ 0{idx + 1}</div>
                  <div className="font-serif text-base text-white font-normal">{point}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Story Section: OUR STORY */}
      <section id="our-story" className="py-20 sm:py-28 border-b border-white/10 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: LUXURY_EASE }}
              className="lg:col-span-5 relative aspect-[4/5] overflow-hidden bg-neutral-900 border border-white/10 rounded-sm shadow-2xl group"
            >
              <img
                src={story.image1_url || '/media/banners/banner-4.jpg'}
                alt="Philz Signature Heritage"
                className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </motion.div>

            {/* Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-luxury-gold font-medium block">
                ✦ BRAND HERITAGE
              </span>
              <WordReveal
                as="h2"
                text={story.story_title || 'OUR STORY'}
                className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight"
              />
              <div className="space-y-4 text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                {storyBody.map((para: string, idx: number) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
              {story.story_goal && (
                <div className="p-5 bg-luxury-gold/5 border-l-2 border-luxury-gold text-xs sm:text-sm text-luxury-cream font-serif italic">
                  &ldquo;{story.story_goal}&rdquo;
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Founder Section: MEET PHILZ THE PERFUMER */}
      <section id="perfumer" className="py-20 sm:py-28 border-b border-white/10 relative overflow-hidden bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Narrative */}
            <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-luxury-gold font-medium block">
                ✦ THE NOSE BEHIND THE BRAND
              </span>
              <WordReveal
                as="h2"
                text={story.perfumer_title || 'MEET PHILZ THE PERFUMER'}
                className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight"
              />
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-luxury-gold font-medium">
                {story.perfumer_subtitle || 'BEHIND EVERY SIGNATURE IS A STORY.'}
              </p>
              <div className="space-y-4 text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                {perfumerBody.map((para: string, idx: number) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>

              {/* Brand Signoff */}
              <div className="pt-6 border-t border-white/10 space-y-1">
                <div className="font-serif text-base text-white tracking-[0.2em] uppercase">
                  {story.closing_brand || 'PHILZ SIGNATURE'}
                </div>
                <div className="text-xs text-luxury-gold font-light italic">
                  {story.closing_statement || 'Your scent. Your signature.'}
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-luxury-gold hover:bg-luxury-gold-light text-black text-xs uppercase tracking-wider font-semibold transition-all shadow-md group"
                >
                  <span>Connect With Philz</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: LUXURY_EASE }}
              className="lg:col-span-5 relative aspect-[4/5] overflow-hidden bg-neutral-900 border border-white/10 rounded-sm shadow-2xl order-1 lg:order-2 group"
            >
              <img
                src={story.image2_url || '/media/lifestyle/lifestyle-1.jpg'}
                alt="Philz the Perfumer Atelier"
                className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};
