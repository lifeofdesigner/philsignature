import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export const ScentsFormulaSection: React.FC = () => {
  const pillars = [
    {
      numeral: 'I.',
      title: 'Rooted In Nature',
      description:
        'Pure botanical essences, rare wild-harvested resins, and sustainably sourced florals distilled at peak vitality.',
    },
    {
      numeral: 'II.',
      title: 'Crafted To Last',
      description:
        'Concentrated Extrait de Parfum formulation ensuring rich olfactory persistence lasting 18+ hours without fading.',
    },
    {
      numeral: 'III.',
      title: 'Combined Perfect Ingredients',
      description:
        'Harmonized oils sourced directly from the perfume capitals of Grasse, Madagascar, and the Arabian Peninsula.',
    },
    {
      numeral: 'IV.',
      title: 'Built To Embrace Elegance',
      description:
        'Architected to project a sophisticated, memorable sillage that commands quiet respect and deep admiration.',
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
              <span>SCENTS FORMULA</span>
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-3xl sm:text-5xl text-white font-normal leading-[1.15] tracking-tight"
            >
              Formulated for depth, intimacy and endurance.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xs sm:text-sm lg:text-base text-white/70 font-light leading-relaxed"
            >
              Philz Signature is formulated for depth and endurance. The scent does not announce itself loudly, then disappear. It settles into the skin slowly, staying close for hours, like something that truly belongs there.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="pt-4"
            >
              <Link to="/about">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-luxury text-luxury-gold hover:text-white transition-colors font-medium border-b border-luxury-gold pb-1 group cursor-pointer"
                >
                  <span>Explore The Artisanal Process</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: 4 Roman Numeral Pillars */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => (
              <motion.div
                key={pillar.numeral}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="p-6 sm:p-8 bg-neutral-950/80 border border-white/10 hover:border-luxury-gold/50 rounded-xs transition-all duration-300 shadow-xl space-y-3.5 group"
              >
                <span className="font-serif text-2xl sm:text-3xl text-luxury-gold font-light block group-hover:scale-105 transition-transform duration-300 origin-left">
                  {pillar.numeral}
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-white font-normal group-hover:text-luxury-gold transition-colors">
                  {pillar.title}
                </h3>
                <p className="text-xs text-white/60 font-light leading-relaxed">
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
