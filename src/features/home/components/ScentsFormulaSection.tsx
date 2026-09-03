import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cmsService, CMSService } from '@/services/CMSService';

export const ScentsFormulaSection: React.FC = () => {
  const { data: storyData } = useQuery({
    queryKey: ['scents-formula-story'],
    queryFn: () => cmsService.getStorySection(),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });

  const story = storyData || CMSService.DEFAULT_STORY;

  const pillars = [
    {
      numeral: 'I.',
      title: 'Fragrance Should Be Personal',
      description:
        'Scent is one of the most powerful ways to express individuality. Everyone deserves to discover a fragrance that feels truly distinctive and personal.',
    },
    {
      numeral: 'II.',
      title: 'Quality Should Be Intentional',
      description:
        'From high-concentration perfume oils to rich home fragrances, our products are crafted with the finest fragrance oils for depth and remarkable sillage.',
    },
    {
      numeral: 'III.',
      title: 'Every Experience Should Be Memorable',
      description:
        'From personal daily wear to customized corporate gifts and private-label collections, every scent is designed to leave a lasting impression.',
    },
    {
      numeral: 'IV.',
      title: 'Behind Every Signature Is A Story',
      description:
        'Founded in 2018 by Philz the Perfumer, our journey continues to be guided by curiosity, creativity, and a passion for artisanal scent experiences.',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-black border-b border-white/10 relative overflow-hidden">
      <div className="container mx-auto px-6 sm:px-12 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Editorial Headline & Narrative */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] sm:text-xs uppercase tracking-luxury-wide text-luxury-gold font-medium flex items-center gap-1.5"
            >
              <Sparkles className="h-3 w-3" />
              <span>PHILOSOPHY & FORMULA</span>
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-3xl sm:text-5xl text-white font-normal leading-[1.15] tracking-tight"
            >
              A signature is something that belongs to you.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-sm text-white/70 font-light leading-relaxed max-w-md"
            >
              {story.body_paragraphs?.[1] ||
                'What began with a focus on personal fragrance has evolved into a broader scent lifestyle brand offering perfumes, perfume oils, home fragrances, gifting solutions and private-label services.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="pt-2"
            >
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury text-luxury-gold hover:text-white transition-colors group font-medium"
              >
                <span>Read Meet Philz The Perfumer</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column: 4 Authentic Philosophy Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {pillars.map((pillar, idx) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="p-6 sm:p-8 bg-neutral-950/80 border border-white/10 hover:border-luxury-gold/50 rounded-sm transition-all duration-300 space-y-4 shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif text-2xl sm:text-3xl text-luxury-gold/60 group-hover:text-luxury-gold font-light transition-colors">
                    {pillar.numeral}
                  </span>
                  <div className="h-[1px] w-12 bg-white/10 group-hover:bg-luxury-gold/40 transition-colors" />
                </div>

                <h3 className="font-serif text-lg sm:text-xl text-white font-normal group-hover:text-luxury-gold transition-colors">
                  {pillar.title}
                </h3>

                <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
