import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      className="group relative min-h-[92vh] sm:min-h-screen flex flex-col justify-end overflow-hidden bg-black focus:outline-none select-none"
    >
      {/* Background Slides with AnimatePresence */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={`bg-${currentSlide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-0"
        >
          {currentSlide.video_url ? (
            <video
              src={currentSlide.video_url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <picture className="w-full h-full block">
              {currentSlide.mobile_image && (
                <source media="(max-width: 640px)" srcSet={currentSlide.mobile_image} />
              )}
              <motion.img
                key={`img-${currentSlide.id}`}
                initial={{ scale: 1.06 }}
                animate={{ scale: isPaused ? 1.02 : 1.06 }}
                transition={{ duration: intervalMs / 1000 + 1, ease: 'linear' }}
                src={currentSlide.desktop_image}
                alt={currentSlide.headline}
                className="w-full h-full object-cover object-center"
                loading="eager"
                fetchPriority="high"
              />
            </picture>
          )}

          {/* Theme Vignette Overlays for Flawless Readability (ÁRUM Framer Styling) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Main Editorial Content & Floating Product Card Row (ÁRUM Framer Architecture) */}
      <div className="relative z-20 container mx-auto px-6 sm:px-12 lg:px-16 pb-16 sm:pb-24 pt-32 w-full flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        {/* Bottom-Left Editorial Typography */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`content-${currentSlide.id}`}
            initial={{ opacity: 0, y: direction * 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -direction * 16 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-xl text-left space-y-5"
          >
            {/* Badge */}
            {currentSlide.badge && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-block text-[11px] sm:text-xs uppercase tracking-luxury-wide font-medium text-luxury-gold"
              >
                ✦ {currentSlide.badge}
              </motion.span>
            )}

            {/* Editorial Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight leading-[1.12] drop-shadow-md"
            >
              {currentSlide.headline}
            </motion.h1>

            {/* Subtitle */}
            {currentSlide.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-xs sm:text-sm lg:text-base text-white/80 font-light max-w-lg leading-relaxed drop-shadow-sm"
              >
                {currentSlide.subtitle}
              </motion.p>
            )}

            {/* Minimalist Frosted Glass Action Button (ÁRUM Framer Style) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-2 flex items-center gap-4"
            >
              <Link to={currentSlide.primary_cta_url || '/shop'}>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-7 py-3 rounded-xs border border-white/40 bg-white/10 hover:bg-white hover:text-black hover:border-white backdrop-blur-md text-white text-xs font-semibold uppercase tracking-luxury transition-all duration-300 shadow-lg cursor-pointer"
                >
                  {currentSlide.primary_cta_text || 'Shop Now'}
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom-Right Floating Product Spotlight Card (Signature ÁRUM Framer Feature) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`product-card-${currentSlide.id}`}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full sm:w-auto self-stretch sm:self-auto"
          >
            <Link
              to={currentSlide.featured_product_url || currentSlide.primary_cta_url || '/shop'}
              className="group block bg-[#f6f4ef] text-black p-3.5 sm:p-4 rounded-xs shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/40 hover:border-luxury-gold transition-all duration-300 w-full sm:w-72 md:w-80 cursor-pointer"
            >
              <div className="flex items-center gap-3.5">
                {/* Product Thumbnail */}
                <div className="w-14 h-16 sm:w-16 sm:h-20 bg-[#eae6dc] rounded-xs overflow-hidden flex items-center justify-center p-1.5 shrink-0 border border-black/5">
                  <img
                    src={
                      currentSlide.featured_product_image ||
                      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=90'
                    }
                    alt={currentSlide.featured_product_title || 'Featured Creation'}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0 pr-1">
                  <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider block truncate">
                    {currentSlide.featured_product_subtitle || 'Haute Parfumerie • 100ml'}
                  </span>
                  <h4 className="font-serif text-sm sm:text-base font-semibold text-black truncate group-hover:text-[#A17836] transition-colors">
                    {currentSlide.featured_product_title || 'Oud Royal Extrait'}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs sm:text-sm font-semibold text-black font-mono">
                      {currentSlide.featured_product_price || '₦185,000'}
                    </span>
                  </div>
                </div>

                {/* Arrow Action Icon */}
                <div className="h-8 w-8 rounded-full bg-black/5 group-hover:bg-[#A17836] group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Arrows - Visible on Mouse Over */}
      {slideCount > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous fragrance slide"
            className="absolute left-3 sm:left-6 lg:left-10 top-1/2 -translate-y-1/2 z-30 h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-black/80 border border-luxury-gold/60 text-luxury-gold hover:text-white hover:border-luxury-gold hover:bg-black backdrop-blur-md transition-all duration-300 cursor-pointer shadow-[0_8px_25px_rgba(0,0,0,0.9)] active:scale-95 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 transition-transform hover:-translate-x-0.5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next fragrance slide"
            className="absolute right-3 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-30 h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-black/80 border border-luxury-gold/60 text-luxury-gold hover:text-white hover:border-luxury-gold hover:bg-black backdrop-blur-md transition-all duration-300 cursor-pointer shadow-[0_8px_25px_rgba(0,0,0,0.9)] active:scale-95 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 transition-transform hover:translate-x-0.5" />
          </button>
        </>
      )}

      {/* Bottom Minimalist Slide Indicator Dots & Pause Button */}
      {slideCount > 1 && (
        <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-4 px-4 pointer-events-auto">
          <div className="flex items-center gap-2">
            {activeSlides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={`indicator-${slide.id}`}
                  type="button"
                  onClick={() => handleGoTo(idx)}
                  aria-label={`Go to slide ${idx + 1}: ${slide.headline}`}
                  className="relative h-1 w-8 sm:w-10 bg-white/30 rounded-full overflow-hidden cursor-pointer transition-all"
                >
                  {isActive ? (
                    <motion.div
                      layoutId="activeSlideBar"
                      className="absolute inset-0 bg-white"
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

          {autoplayEnabled && (
            <button
              type="button"
              onClick={() => setIsPaused((p) => !p)}
              aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
              className="p-1 text-white/50 hover:text-white transition-colors cursor-pointer"
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </button>
          )}
        </div>
      )}
    </section>
  );
};

