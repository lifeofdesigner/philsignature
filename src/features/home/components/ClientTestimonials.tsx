import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/common/MotionWrapper';

const TESTIMONIALS = [
  {
    quote: 'Beyond You is an absolute masterpiece. The scent has a commanding presence and lasts from morning till night. People kept asking me what I was wearing.',
    author: 'Victoria D.',
    location: 'Ikoyi, Lagos',
    scent: 'Beyond You • 100ml',
  },
  {
    quote: 'Nomad is easily one of the best perfumes in my collection. Warm, rich, and very smooth. The compliments have been non-stop.',
    author: 'Chief Adebayo O.',
    location: 'Abuja, FCT',
    scent: 'Nomad • 100ml',
  },
  {
    quote: 'Oud en Botella is in a league of its own. The depth of the oud is incredible. You can immediately tell it is made with genuine, premium oils.',
    author: 'Dr. Tariq M.',
    location: 'Victoria Island, Lagos',
    scent: 'Oud en Botella • 100ml',
  },
];

export const ClientTestimonials: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-luxury-black border-b border-luxury-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl space-y-12">
        <FadeIn direction="up" distance={16}>
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
              What Our Customers Say
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-luxury-cream font-normal">
              Customer Reviews
            </h2>
          </div>
        </FadeIn>

        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {TESTIMONIALS.map((t, idx) => (
            <StaggerItem key={idx}>
              <div
                className="h-full p-6 sm:p-8 bg-luxury-card border border-luxury-border rounded-sm shadow-xs flex flex-col justify-between space-y-6 hover:border-luxury-gold/40 transition-colors"
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
                  <div className="flex items-center gap-1.5 text-xs text-luxury-cream font-medium">
                    <span>{t.author}</span>
                    <ShieldCheck className="h-3.5 w-3.5 text-luxury-gold" />
                  </div>
                  <div className="text-[10px] text-luxury-muted">{t.location}</div>
                  <div className="text-[10px] text-luxury-gold/80 font-mono tracking-wider pt-0.5">{t.scent}</div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
