import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const SCROLL_SHOW_THRESHOLD = 480;

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_SHOW_THRESHOLD);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="Scroll back to top"
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 10 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-40 right-4 sm:right-6 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-luxury-black/90 hover:bg-luxury-gold border border-luxury-gold/40 hover:border-luxury-gold text-luxury-gold hover:text-black backdrop-blur-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-pointer transition-colors"
        >
          <ArrowUp className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
