import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: 'Beyond You is an absolute revelation. The transition from spicy elemi to dark Cambodian agarwood has a commanding, aristocratic sillage that lasts all day.',
    author: 'Lady Victoria D.',
    location: 'Ikoyi, Lagos',
    scent: 'Beyond You • Extrait de Parfum',
  },
  {
    quote: 'Nomad captures the essence of nocturnal desert warmth like nothing else. The Florentine iris and aged tobacco blend into pure liquid velvet.',
    author: 'Chief Adebayo O.',
    location: 'Abuja, FCT',
    scent: 'Nomad • Extrait de Parfum',
  },
  {
    quote: 'Oud en Botella is in a league of its own. The vintage Assam agarwood depth is hypnotic. This is true bespoke perfumery.',
    author: 'Dr. Tariq M.',
    location: 'London / Victoria Island',
    scent: 'Oud en Botella • Private Reserve',
  },
];

export const ClientTestimonials: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-black border-b border-luxury-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl space-y-12">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Sensory Acclaim
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            Client Memoirs & Testimonials
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 bg-luxury-card border border-luxury-border/80 flex flex-col justify-between space-y-6 hover:border-luxury-gold/40 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-luxury-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-luxury-sand font-light italic leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-luxury-border/50 space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-white font-medium">
                  <span>{t.author}</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-luxury-gold" />
                </div>
                <div className="text-[10px] text-luxury-muted">{t.location}</div>
                <div className="text-[10px] text-luxury-gold font-mono">{t.scent}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

