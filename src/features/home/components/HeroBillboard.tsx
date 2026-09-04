import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CmsHeroContent, CmsHeroSlide } from '@/services/CMSService';

export interface HeroBillboardProps {
  hero: CmsHeroContent;
}

export const HeroBillboard: React.FC<HeroBillboardProps> = ({ hero }) => {
  // Extract active slides or build default luxury fallback
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
        desktop_image: hero.background_image || '/brand/hero-oud-luxury.jpg',
        mobile_image: hero.background_image || '/brand/hero-oud-luxury.jpg',
        featured_product_title: 'Perfume Body Oil',
        featured_product_subtitle: 'Private Reserve • 30ml',
        featured_product_price: '₦45,000',
        featured_product_image: '/media/products/perfume-oils/perfume-oil-1.jpg',
        featured_product_url: '/shop?category=perfume-body-oils',
        is_active: true,
        order: 1,
      },
      {
        id: 'fallback-2',
        badge: 'Private Reserve',
        headline: 'Rare Cambodian Oud & Amber',
        subtitle: 'Intense, smoky woods aged for decades and infused with royal Taif rose petals. An aura of pure prestige.',
        primary_cta_text: 'Discover Oud Line',
        primary_cta_url: '/shop',
        secondary_cta_text: 'Our Story',
        secondary_cta_url: '/about',
        desktop_image: '/brand/hero-private-reserve.jpg',
        mobile_image: '/brand/hero-private-reserve.jpg',
        featured_product_title: 'Oud Royal Extrait',
        featured_product_subtitle: 'Haute Parfumerie • 100ml',
        featured_product_price: '₦185,000',
        featured_product_image: '/media/products/perfume-oils/perfume-oil-2.jpg',
        featured_product_url: '/shop',
        is_active: true,
        order: 2,
      },
      {
        id: 'fallback-3',
        badge: 'The Extrait Collection',
        headline: 'Pure Elegance in Every Flacon',
        subtitle: 'Formulated at 35% extrait concentration. Exceptional sillage that lingers from morning to evening.',
        primary_cta_text: 'Shop Extraits',
        primary_cta_url: '/shop',
        secondary_cta_text: 'Client Favorites',
        secondary_cta_url: '/shop',
        desktop_image: '/brand/hero-extrait-collection.jpg',
        mobile_image: '/brand/hero-extrait-collection.jpg',
        featured_product_title: 'Scented Candle Duo',
        featured_product_subtitle: 'Artisanal Home • 300g',
        featured_product_price: '₦65,000',
        featured_product_image: '/media/products/diffuser-candles/diffuser-candle-1.jpg',
        featured_product_url: '/shop?category=scented-candles',
        is_active: true,
        order: 3,
      },
    ];
  }, [rawSlides, hero]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Settings
  const autoplayEnabled = hero.settings?.autoplay ?? true;
  const intervalMs = Math.max(3000, hero.settings?.autoplay_interval_ms ?? 6500);
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

  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight - 60,
      behavior: 'smooth',
    });
  };

  return (
    <section
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Philz Signature Luxury Fragrance Showcase"
      tabIndex={0}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="group relative h-screen min-h-[700px] w-full flex flex-col justify-between overflow-hidden bg-black focus:outline-none select-none"
    >
      {/* =========================================================================
          1. CINEMATIC FULLSCREEN BACKGROUND WITH KEN BURNS MOTION & VIDEO SUPPORT
         ========================================================================= */}
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={`bg-${currentSlide.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          {currentSlide.video_url ? (
            <video
              src={currentSlide.video_url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover object-center scale-105"
            />
          ) : (
            <picture className="w-full h-full block">
              {currentSlide.mobile_image && (
                <source media="(max-width: 640px)" srcSet={currentSlide.mobile_image} />
              )}
              <motion.img
                key={`img-${currentSlide.id}`}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1.12 }}
                transition={{ duration: 10, ease: 'easeOut' }}
                src={currentSlide.desktop_image}
                alt={currentSlide.headline}
                className="w-full h-full object-cover object-center"
                loading="eager"
                fetchPriority="high"
              />
            </picture>
          )}

          {/* Dynamic Multi-Layer Vignette Lighting for High-End Contrast & Warmth */}
          {/* Top Navbar Veil */}
          <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none z-10" />
          {/* Left-Side Typography Reading Shield */}
          <div className="absolute inset-y-0 left-0 w-full md:w-3/5 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none z-10" />
          {/* Bottom Ambient Fade */}
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none z-10" />
        </motion.div>
      </AnimatePresence>

      {/* Top Spacer for floating transparent header */}
      <div className="relative z-10 h-24 sm:h-28 w-full shrink-0" />

      {/* =========================================================================
          2. MAIN EDITORIAL CONTENT & FLOATING PRODUCT SHOWCASE
         ========================================================================= */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full flex-1 flex flex-col md:flex-row items-start md:items-end justify-center md:justify-between gap-8 pb-20 sm:pb-24">
        
        {/* Left-Aligned Editorial Headline & Narrative */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`content-${currentSlide.id}`}
            initial={{ opacity: 0, y: direction * 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -direction * 20 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl text-left space-y-4 sm:space-y-6"
          >
            {/* Eyebrow / Collection Tag */}
            {currentSlide.badge && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] uppercase tracking-[0.25em] font-medium text-luxury-gold drop-shadow-sm"
              >
                <Sparkles className="h-3 w-3 text-luxury-gold" />
                <span>{currentSlide.badge}</span>
              </motion.div>
            )}

            {/* Large Editorial Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl text-white font-normal tracking-tight leading-[1.08] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]"
            >
              {currentSlide.headline}
            </motion.h1>

            {/* Subtitle Paragraph */}
            {currentSlide.subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="text-xs sm:text-base lg:text-lg text-white/85 font-light max-w-xl leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              >
                {currentSlide.subtitle}
              </motion.p>
            )}

            {/* Dual Luxury Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3.5 sm:gap-5"
            >
              {currentSlide.primary_cta_text && (
                <Link to={currentSlide.primary_cta_url || '/shop'}>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-7 sm:px-8 py-3.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-[0.2em] hover:bg-luxury-gold hover:text-black transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.6)] cursor-pointer flex items-center gap-2 group"
                  >
                    <span>{currentSlide.primary_cta_text}</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                </Link>
              )}

              {currentSlide.secondary_cta_text && (
                <Link to={currentSlide.secondary_cta_url || '/collections'}>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-7 sm:px-8 py-3.5 rounded-full border border-white/30 hover:border-white bg-black/30 hover:bg-white/10 backdrop-blur-md text-white font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-md cursor-pointer"
                  >
                    {currentSlide.secondary_cta_text}
                  </motion.button>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Right-Floating Spotlight Product Card */}
        <AnimatePresence mode="wait">
          {currentSlide.featured_product_title && (
            <motion.div
              key={`product-card-${currentSlide.id}`}
              initial={{ opacity: 0, x: 30, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.92 }}
              transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="hidden md:block shrink-0"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Link
                  to={currentSlide.featured_product_url || currentSlide.primary_cta_url || '/shop'}
                  className="group block bg-black/60 hover:bg-black/80 backdrop-blur-2xl text-white p-4 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-white/20 hover:border-luxury-gold/70 transition-all duration-300 w-72 sm:w-80 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Flacon Thumbnail */}
                    <div className="w-16 h-20 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center p-1.5 shrink-0 border border-white/10 group-hover:border-luxury-gold/50 transition-colors">
                      <img
                        src={
                          currentSlide.featured_product_image ||
                          '/media/products/perfume-oils/perfume-oil-1.jpg'
                        }
                        alt={currentSlide.featured_product_title || 'Featured Fragrance'}
                        className="w-full h-full object-cover rounded-sm group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] text-luxury-gold font-mono uppercase tracking-widest block truncate font-medium">
                        {currentSlide.featured_product_subtitle || 'Haute Parfumerie • 100ml'}
                      </span>
                      <h4 className="font-serif text-sm sm:text-base font-normal text-white truncate group-hover:text-luxury-gold transition-colors mt-0.5">
                        {currentSlide.featured_product_title}
                      </h4>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10">
                        <span className="text-xs sm:text-sm font-medium text-white/90 font-mono">
                          {currentSlide.featured_product_price || '₦45,000'}
                        </span>
                        <div className="h-7 w-7 rounded-full bg-white/10 group-hover:bg-luxury-gold group-hover:text-black flex items-center justify-center transition-all duration-300">
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =========================================================================
          3. BOTTOM CONTROLS, PROGRESS INDICATOR & CENTERED SCROLL PROMPT
         ========================================================================= */}
      <div className="relative z-30 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 w-full pb-6 flex items-center justify-between pointer-events-auto">
        
        {/* Slide Counter & Progress Bars */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-white/80 tracking-wider">
            0{currentIndex + 1}
          </span>
          <div className="flex items-center gap-1.5">
            {activeSlides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleGoTo(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="h-1.5 rounded-full transition-all duration-500 cursor-pointer overflow-hidden bg-white/20 hover:bg-white/40"
                style={{ width: currentIndex === idx ? '32px' : '8px' }}
              >
                {currentIndex === idx && (
                  <motion.div
                    className="h-full bg-luxury-gold"
                    initial={{ width: '0%' }}
                    animate={{ width: isPaused ? '100%' : '100%' }}
                    transition={{ duration: intervalMs / 1000, ease: 'linear' }}
                  />
                )}
              </button>
            ))}
          </div>
          <span className="font-mono text-xs text-white/40 tracking-wider">
            0{slideCount}
          </span>

          {/* Autoplay Pause / Play Toggle */}
          {slideCount > 1 && (
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
              className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors ml-2"
            >
              {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </button>
          )}
        </div>

        {/* Centered Luxury Scroll Indicator */}
        <button
          type="button"
          onClick={scrollToNextSection}
          className="hidden sm:flex items-center gap-2 text-white/60 hover:text-luxury-gold transition-colors text-[10px] uppercase tracking-[0.24em] font-medium cursor-pointer"
        >
          <span>Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.div>
        </button>

        {/* Navigation Arrows */}
        {slideCount > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous slide"
              className="h-9 w-9 rounded-full bg-black/40 hover:bg-luxury-gold hover:text-black border border-white/20 hover:border-luxury-gold backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              className="h-9 w-9 rounded-full bg-black/40 hover:bg-luxury-gold hover:text-black border border-white/20 hover:border-luxury-gold backdrop-blur-md text-white flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="w-16" />
        )}
      </div>
    </section>
  );
};
