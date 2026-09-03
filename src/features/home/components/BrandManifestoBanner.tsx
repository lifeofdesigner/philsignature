import React from 'react';
import { motion } from 'framer-motion';

export const BrandManifestoBanner: React.FC = () => {
  return (
    <section className="py-24 sm:py-32 bg-black border-b border-white/10 relative overflow-hidden">
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
          ✦ THE PHILZ PHILOSOPHY
        </motion.span>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-serif italic text-2xl sm:text-4xl lg:text-5xl text-white font-light leading-[1.25] tracking-tight drop-shadow-sm"
        >
          &ldquo;There are scents that pass through you, and those that return you to yourself. Philz Signature is the latter.&rdquo;
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="pt-2 flex items-center justify-center gap-3"
        >
          <div className="h-[1px] w-8 bg-luxury-gold/40" />
          <span className="text-[10px] sm:text-xs tracking-luxury uppercase text-white/60 font-mono">
            Haute Parfumerie & Extrait De Parfum
          </span>
          <div className="h-[1px] w-8 bg-luxury-gold/40" />
        </motion.div>
      </div>
    </section>
  );
};
