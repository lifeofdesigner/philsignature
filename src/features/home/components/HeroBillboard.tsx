import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { CmsHeroContent, CmsHeroSlide } from '@/services/CMSService';

export interface HeroBillboardProps {
  hero: CmsHeroContent;
}

export const HeroBillboard: React.FC<HeroBillboardProps> = ({ hero }) => {
  // Extract active slides or build default fallback
  const rawSlides = Array.isArray(hero.slides) && hero.slides.length > 0 ? hero.slides : undefined;
  const activeSlides: CmsHeroSlide[] = React.useMemo(() => {
    if (rawSlides) {
      const filtered = rawSlides.filter((s) => s.is_active).sort((a, b) => a.order - b.order);
      if (filtered.length > 0) return filtered;
    }
    return [
      {
        id: 'fallback-1',
        badge: hero.badge || 'Haute Parfumerie',
        headline: hero.headline || 'Luxury Perfumes That Last',
        subtitle: hero.subtitle || 'Handcrafted long-lasting perfumes made with the finest fragrance oils. Rich, elegant scents designed to make a statement.',
        primary_cta_text: hero.primary_cta_text || 'Shop Perfumes',
        primary_cta_url: hero.primary_cta_url || '/shop',
        secondary_cta_text: hero.secondary_cta_text || 'View Collections',
        secondary_cta_url: hero.secondary_cta_url || '/collections',
        desktop_image: hero.background_image || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=2000&q=90',
        mobile_image: hero.background_image || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=90',
        is_active: true,
        order: 1,
      },
    ];
  }, [rawSlides, hero]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Settings
  const autoplayEnabled = hero.settings?.autoplay ?? true;
  const intervalMs = Math.max(3000, hero.settings?.autoplay_interval_ms ?? 6000);
  const slideCount = activeSlides.length;

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  const handleGoTo = useCallback(
    (idx: number) => {
      setDirection(idx > currentIndex ? 1 : -1);
      setCurrentIndex(idx);
    },
    [currentIndex]
  );

  // Autoplay timer
  useEffect(() => {
    if (!autoplayEnabled || isPaused || slideCount <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoplayEnabled, isPaused, slideCount, intervalMs, handleNext]);

  // Keyboard navigation
  const containerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Only trigger if horizontal swipe is significantly stronger than vertical scroll
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    setIsPaused(false);
  };

  return (
    <section
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Perfume Collections"
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="relative min-h-[85vh] sm:min-h-[88vh] flex items-center justify-center overflow-hidden bg-luxury-black border-b border-luxury-border focus:outline-none select-none"
    >
      {/* Background Slides with AnimatePresence */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={`bg-${currentSlide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-0"
        >
          <picture className="w-full h-full block">
            {currentSlide.mobile_image && (
              <source media="(max-width: 640px)" srcSet={currentSlide.mobile_image} />
            )}
            <motion.img
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              transition={{ duration: intervalMs / 1000 + 1, ease: 'linear' }}
              src={currentSlide.desktop_image}
              alt={currentSlide.headline}
              className="w-full h-full object-cover object-center opacity-30 dark:opacity-40"
              loading="eager"
              fetchPriority="high"
            />
          </picture>

          {/* Theme Vignette Overlays for Flawless Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/75 to-luxury-black/35" />
          <div className="absolute inset-0 bg-radial-vignette opacity-60 dark:opacity-75 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Editorial Content with Staggered Entrance */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center max-w-4xl space-y-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`content-${currentSlide.id}`}
            initial={{ opacity: 0, y: direction * 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -direction * 14 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5 sm:space-y-6"
          >
            {/* Badge */}
            {currentSlide.badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 border border-luxury-gold/40 bg-luxury-charcoal/90 text-luxury-gold text-[10px] sm:text-xs uppercase tracking-luxury-wide font-medium backdrop-blur-sm shadow-sm rounded-xs"
              >
                <Sparkles className="h-3 w-3" />
                <span>{currentSlide.badge}</span>
              </motion.div>
            )}

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-luxury-cream font-normal tracking-tight leading-[1.15]"
            >
              {currentSlide.headline}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xs sm:text-sm md:text-base lg:text-lg text-luxury-sand font-light max-w-2xl mx-auto leading-relaxed px-2"
            >
              {currentSlide.subtitle}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 pt-2 sm:pt-4"
            >
              {currentSlide.primary_cta_text && (
                <Link to={currentSlide.primary_cta_url} className="w-full sm:w-auto">
                  <Button variant="luxury" size="lg" className="w-full sm:w-auto gap-2 text-xs min-h-[44px]">
                    <span>{currentSlide.primary_cta_text}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
              {currentSlide.secondary_cta_text && (
                <Link to={currentSlide.secondary_cta_url || '/collections'} className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-xs min-h-[44px]">
                    <span>{currentSlide.secondary_cta_text}</span>
                  </Button>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop & Tablet Previous/Next Minimal Chevron Buttons */}
      {slideCount > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous fragrance slide"
            className="hidden sm:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-luxury-black/60 border border-luxury-border/80 text-luxury-cream hover:text-luxury-gold hover:border-luxury-gold/50 backdrop-blur-md transition-all cursor-pointer shadow-lg group"
          >
            <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next fragrance slide"
            className="hidden sm:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-luxury-black/60 border border-luxury-border/80 text-luxury-cream hover:text-luxury-gold hover:border-luxury-gold/50 backdrop-blur-md transition-all cursor-pointer shadow-lg group"
          >
            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </>
      )}

      {/* Bottom Luxury Slider Controls & Progress Dashboard */}
      {slideCount > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-6 px-4">
          {/* Slide Indicator Bars with Animated Fill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {activeSlides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={`indicator-${slide.id}`}
                  type="button"
                  onClick={() => handleGoTo(idx)}
                  aria-label={`Go to slide ${idx + 1}: ${slide.headline}`}
                  className="relative h-1 sm:h-1.5 w-8 sm:w-12 bg-luxury-border/80 rounded-full overflow-hidden cursor-pointer transition-all"
                >
                  {isActive ? (
                    <motion.div
                      layoutId="activeSlideBar"
                      className="absolute inset-0 bg-luxury-gold"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{
                        duration: autoplayEnabled && !isPaused ? intervalMs / 1000 : 0.4,
                        ease: 'linear',
                      }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Minimalist Slide Counter */}
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-luxury-muted">
            <span className="text-luxury-gold font-semibold">0{currentIndex + 1}</span>
            <span>/</span>
            <span>0{slideCount}</span>
          </div>

          {/* Pause / Play Indicator Button */}
          {autoplayEnabled && (
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
              className="p-1 text-luxury-muted hover:text-luxury-gold transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )}
    </section>
  );
};

