import React from 'react';
import { Star } from 'lucide-react';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/common/MotionWrapper';

const TESTIMONIALS = [
  {
    quote: 'The perfume body oils are extraordinary. The sillage lasts all day and leaves an incredible impression without being overpowering.',
    author: 'Victoria D.',
    location: 'Lagos, Nigeria',
    scent: 'Perfume Body Oil • Unisex',
  },
  {
    quote: 'We commissioned customized corporate fragrance gift sets for our end-of-year executive clients. The presentation and scent quality were unmatched.',
    author: 'Adebayo O.',
    location: 'Victoria Island, Lagos',
    scent: 'Corporate Gifting & Hamper Project',
  },
  {
    quote: 'The reed diffusers and scented candles transformed the entire atmosphere of my home. Rich, soothing, and truly long-lasting.',
    author: 'Dr. Tariq M.',
    location: 'Ikoyi, Lagos',
    scent: 'Reed Diffuser & Candle Set',
  },
];

export const ClientTestimonials: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-luxury-black border-b border-luxury-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-5xl space-y-12">
        <FadeIn direction="up" distance={16}>
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
              ✦ Customer Experiences
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-luxury-cream font-normal">
              What Clients Say About Philz Signature
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
                    <span className="text-[10px] text-luxury-muted">• {t.location}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-luxury-gold font-mono block">
                    {t.scent}
                  </span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
