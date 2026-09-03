import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Briefcase, Gift } from 'lucide-react';
import type { CmsStoryContent } from '@/services/CMSService';
import { WordReveal, FadeIn, LUXURY_EASE } from '@/components/common/MotionWrapper';

export interface BrandStorySectionProps {
  story: CmsStoryContent;
}

export const BrandStorySection: React.FC<BrandStorySectionProps> = ({ story }) => {
  return (
    <section className="py-24 sm:py-32 bg-black border-t border-b border-white/10 relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[350px] bg-luxury-gold/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-6 sm:px-12 lg:px-16 relative z-10 space-y-20 sm:space-y-28">
        
        {/* 1. Main Brand Story & Philosophy Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Editorial Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.9, ease: LUXURY_EASE }}
            className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] overflow-hidden bg-luxury-charcoal border border-white/10 rounded-sm shadow-2xl group"
          >
            <img
              src={story.image1_url || '/media/banners/banner-4.jpg'}
              alt="Philz Signature Perfumery Atelier"
              className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 p-5 bg-black/80 backdrop-blur-xl border border-white/15 rounded-xs">
              <span className="text-[10px] uppercase tracking-[0.25em] text-luxury-gold font-medium block">
                PHILZ SIGNATURE
              </span>
              <p className="font-serif text-sm sm:text-base text-white/95 italic mt-1 font-light">
                &ldquo;A signature is something that belongs to you.&rdquo;
              </p>
            </div>
          </motion.div>

          {/* Narrative Content */}
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-luxury-gold font-medium flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>ABOUT PHILZ SIGNATURE</span>
              </span>
              <WordReveal
                as="h2"
                text={story.title || 'ABOUT PHILZ SIGNATURE'}
                className="font-serif text-2xl sm:text-4xl lg:text-5xl text-white font-normal leading-tight tracking-tight"
              />
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-luxury-gold font-medium">
                {story.subtitle || 'A SIGNATURE IS SOMETHING THAT BELONGS TO YOU.'}
              </p>
            </div>

            <FadeIn delay={0.2} distance={16}>
              <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
                Founded in 2018, Philz Signature was created from a passion for fragrance and the belief that scent is one of the most powerful ways to express individuality.
              </p>
            </FadeIn>

            <FadeIn delay={0.3} distance={16}>
              <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                What began with a focus on personal fragrance has evolved into a broader scent lifestyle brand offering perfumes, perfume oils, home fragrances, gifting solutions and private-label services.
              </p>
            </FadeIn>

            {/* 3 Core Philosophy Points */}
            <FadeIn delay={0.4} distance={16}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xs hover:border-luxury-gold/40 transition-colors">
                  <div className="text-luxury-gold text-xs font-serif mb-1">✦ 01</div>
                  <div className="text-[11px] text-white/90 font-light">Fragrance should be personal.</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xs hover:border-luxury-gold/40 transition-colors">
                  <div className="text-luxury-gold text-xs font-serif mb-1">✦ 02</div>
                  <div className="text-[11px] text-white/90 font-light">Quality should be intentional.</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-xs hover:border-luxury-gold/40 transition-colors">
                  <div className="text-luxury-gold text-xs font-serif mb-1">✦ 03</div>
                  <div className="text-[11px] text-white/90 font-light">Every experience memorable.</div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.5} distance={16}>
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  to="/about#our-story"
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-luxury-gold hover:bg-luxury-gold-light text-black text-xs uppercase tracking-wider font-semibold transition-all shadow-md group cursor-pointer"
                >
                  <span>Read Our Story</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/about#perfumer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 hover:border-white text-white text-xs uppercase tracking-wider font-medium transition-all"
                >
                  <span>Meet The Perfumer</span>
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* 2. Bespoke Services Split (Private Label & Corporate Gifting) */}
        <div className="pt-8 border-t border-white/10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-luxury-gold font-medium">
              ✦ BESPOKE SCENT SOLUTIONS
            </span>
            <WordReveal
              as="h3"
              text="Private Label & Corporate Gifting"
              className="font-serif text-2xl sm:text-4xl text-white font-normal tracking-tight"
            />
            <p className="text-xs sm:text-sm text-white/70 font-light">
              Crafting unique fragrance identities and memorable corporate gifting hampers for visionary businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Service Card 1: Private Label */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, ease: LUXURY_EASE }}
              className="p-8 sm:p-10 bg-neutral-950 border border-white/10 hover:border-luxury-gold/50 rounded-sm transition-all duration-300 space-y-5 flex flex-col justify-between group shadow-xl"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-luxury-gold group-hover:bg-luxury-gold group-hover:text-black transition-colors">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h4 className="font-serif text-xl sm:text-2xl text-white font-normal group-hover:text-luxury-gold transition-colors">
                  Private Label Fragrance
                </h4>
                <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                  Ready to create your own fragrance brand? We formulate bespoke perfumes, perfume oils, candles, reed diffusers, and room sprays tailored to your brand vision.
                </p>
              </div>

              <Link
                to="/contact?subject=Private Label Fragrance Project"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury text-luxury-gold group-hover:text-white font-medium transition-colors pt-2"
              >
                <span>Start A Project</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Service Card 2: Corporate Gifting */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: 0.15, ease: LUXURY_EASE }}
              className="p-8 sm:p-10 bg-neutral-950 border border-white/10 hover:border-luxury-gold/50 rounded-sm transition-all duration-300 space-y-5 flex flex-col justify-between group shadow-xl"
            >
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-full bg-white/5 border border-white/15 flex items-center justify-center text-luxury-gold group-hover:bg-luxury-gold group-hover:text-black transition-colors">
                  <Gift className="h-5 w-5" />
                </div>
                <h4 className="font-serif text-xl sm:text-2xl text-white font-normal group-hover:text-luxury-gold transition-colors">
                  Corporate Gifting & Hampers
                </h4>
                <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                  Planning gifts for your company, VIP clients, or executive team? We create customized corporate fragrance gifts, luxury hampers, and branded scent packaging.
                </p>
              </div>

              <Link
                to="/contact?subject=Corporate Fragrance Gifting"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury text-luxury-gold group-hover:text-white font-medium transition-colors pt-2"
              >
                <span>Request A Quote</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
