import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Briefcase, Gift } from 'lucide-react';
import type { CmsStoryContent } from '@/services/CMSService';

export interface BrandStorySectionProps {
  story: CmsStoryContent;
}

export const BrandStorySection: React.FC<BrandStorySectionProps> = ({ story }) => {
  return (
    <section className="py-20 sm:py-28 bg-black border-t border-b border-white/10 relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[350px] bg-luxury-gold/5 blur-[150px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 sm:px-8 lg:px-12 relative z-10 space-y-16 sm:space-y-24">
        {/* 1. Main Brand Story & Philosophy Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Editorial Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] overflow-hidden bg-luxury-charcoal border border-white/10 rounded-sm shadow-2xl group"
          >
            <img
              src={story.image1_url || '/media/banners/banner-4.jpg'}
              alt="Philz Signature Perfumery Atelier"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 p-5 bg-black/80 backdrop-blur-md border border-white/15 rounded-xs">
              <span className="text-[10px] uppercase tracking-[0.25em] text-luxury-gold font-medium block">
                PHILZ SIGNATURE
              </span>
              <p className="font-serif text-sm sm:text-base text-white/95 italic mt-1 font-light">
                &ldquo;A signature is something that belongs to you.&rdquo;
              </p>
            </div>
          </motion.div>

          {/* Narrative Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-luxury-gold font-medium flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>ABOUT PHILZ SIGNATURE</span>
              </span>
              <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl text-white font-normal leading-tight tracking-tight">
                {story.title || 'ABOUT PHILZ SIGNATURE'}
              </h2>
              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-luxury-gold font-medium">
                {story.subtitle || 'A SIGNATURE IS SOMETHING THAT BELONGS TO YOU.'}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-white/80 font-light leading-relaxed">
              Founded in 2018, Philz Signature was created from a passion for fragrance and the belief that scent is one of the most powerful ways to express individuality.
            </p>

            <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
              What began with a focus on personal fragrance has evolved into a broader scent lifestyle brand offering perfumes, perfume oils, home fragrances, gifting solutions and private-label services.
            </p>

            {/* 3 Core Philosophy Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xs">
                <div className="text-luxury-gold text-xs font-serif mb-1">✦ 01</div>
                <div className="text-[11px] text-white/90 font-light">Fragrance should be personal.</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xs">
                <div className="text-luxury-gold text-xs font-serif mb-1">✦ 02</div>
                <div className="text-[11px] text-white/90 font-light">Quality should be intentional.</div>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xs">
                <div className="text-luxury-gold text-xs font-serif mb-1">✦ 03</div>
                <div className="text-[11px] text-white/90 font-light">Every experience memorable.</div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <Link
                to="/about#our-story"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-luxury-gold hover:bg-luxury-gold-light text-black text-xs uppercase tracking-wider font-semibold transition-all shadow-md"
              >
                <span>Read Our Story</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/about#perfumer"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-white/80 hover:text-luxury-gold transition-colors font-medium border-b border-white/20 pb-0.5"
              >
                <span>Meet the Perfumer</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* 2. Bespoke Services: Private Label & Corporate Gifting Preview Cards */}
        <div className="pt-8 border-t border-white/10">
          <div className="text-center space-y-2 mb-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-medium block">
              ✦ BESPOKE SCENT SOLUTIONS
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
              Private Label & Corporate Gifting
            </h3>
            <p className="text-xs text-white/60 font-light max-w-lg mx-auto">
              Customized olfactory branding, bespoke formulation, and curated corporate fragrance hampers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Private Label Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-luxury-charcoal/40 border border-white/10 rounded-sm p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-luxury-gold/50 transition-all shadow-xl group"
            >
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h4 className="font-serif text-xl text-white font-normal">Private Label Fragrance</h4>
                <p className="text-xs text-white/70 font-light leading-relaxed">
                  Ready to create your own fragrance collection? We offer turnkey white-label and private-label formulations for perfumes, body oils, reed diffusers, and luxury candles.
                </p>
              </div>
              <div>
                <Link
                  to="/contact?subject=Private Label Fragrance Project"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-luxury-gold group-hover:text-luxury-gold-light font-semibold"
                >
                  <span>Start a Project</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Corporate Gifting Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-luxury-charcoal/40 border border-white/10 rounded-sm p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-luxury-gold/50 transition-all shadow-xl group"
            >
              <div className="space-y-3">
                <div className="h-10 w-10 rounded-full bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold">
                  <Gift className="h-5 w-5" />
                </div>
                <h4 className="font-serif text-xl text-white font-normal">Corporate Gifting & Hampers</h4>
                <p className="text-xs text-white/70 font-light leading-relaxed">
                  Planning gifts for your company, clients, or executive team? Custom branding and luxury packaging can be incorporated for memorable VIP presentations.
                </p>
              </div>
              <div>
                <Link
                  to="/contact?subject=Corporate Fragrance Gifting"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-luxury-gold group-hover:text-luxury-gold-light font-semibold"
                >
                  <span>Request a Quote</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
