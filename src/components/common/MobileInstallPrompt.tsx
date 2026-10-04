import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, PlusSquare, Sparkles, X, Check, Smartphone, Download } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';

export const MobileInstallPrompt: React.FC = () => {
  const location = useLocation();
  const {
    isEligible,
    isOpen,
    isIos,
    isStandalone,
    hasNativePrompt,
    promptInstall,
    dismiss,
  } = usePwaInstall();

  const [showIosSteps, setShowIosSteps] = useState<boolean>(false);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  // Guard against showing inside the Admin CMS, developer backdoor, desktop, or standalone PWA
  const isAdminOrDevRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/developer');
  if (isAdminOrDevRoute || !isEligible || isStandalone || !isOpen) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosSteps(true);
      return;
    }

    if (hasNativePrompt) {
      setIsInstalling(true);
      try {
        await promptInstall();
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Fallback instructions if native prompt not triggered yet on Android
      setShowIosSteps(true);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex flex-col justify-end">
        {/* Subtle backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={dismiss}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto"
        />

        {/* Premium Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-lg mx-auto bg-gradient-to-b from-[#141416]/98 to-[#0B0B0C]/98 backdrop-blur-2xl border-t border-x border-[#C5A880]/30 rounded-t-3xl shadow-[0_-12px_48px_rgba(0,0,0,0.85)] p-6 pt-5 pb-[calc(1.75rem+env(safe-area-inset-bottom,0px))] pointer-events-auto text-[#FAF8F5]"
        >
          {/* Elegant Top Handle */}
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 rounded-full bg-[#C5A880]/30" />
          </div>

          {/* Close button */}
          <button
            onClick={dismiss}
            aria-label="Dismiss app installation"
            className="absolute top-4 right-4 p-2 text-[#A1A1AA] hover:text-[#FAF8F5] transition-colors rounded-full hover:bg-white/5 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>

          {!showIosSteps ? (
            /* Main Install Teaser */
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {/* Luxury App Icon */}
                <div className="relative shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1C1A17] to-[#0A0A0A] border border-[#C5A880]/40 flex items-center justify-center shadow-lg p-2 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C5A880]/20 via-transparent to-transparent" />
                  <div className="w-full h-full rounded-xl border border-[#C5A880]/30 flex flex-col items-center justify-center">
                    <span className="font-serif text-[#C5A880] text-sm font-bold tracking-widest leading-none">PS</span>
                    <span className="text-[7px] text-[#E6D5B8] uppercase tracking-wider scale-90 mt-0.5">Atelier</span>
                  </div>
                </div>

                {/* Title & Badge */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full bg-[#C5A880]/15 text-[#C5A880] font-semibold border border-[#C5A880]/30">
                      <Sparkles className="w-2.5 h-2.5" />
                      Haute Experience
                    </span>
                  </div>
                  <h3 className="font-serif text-lg font-semibold tracking-wide text-[#FAF8F5] leading-snug">
                    Install Philz Signature
                  </h3>
                </div>
              </div>

              {/* Body Copy */}
              <p className="text-xs text-[#D4D4D8] leading-relaxed font-light pl-0.5">
                Install our app for faster browsing, exclusive offers, quicker checkout, and a premium shopping experience.
              </p>

              {/* Luxury Benefit Badges */}
              <div className="grid grid-cols-3 gap-2 py-1 text-center">
                <div className="py-2 px-1 rounded-lg bg-white/5 border border-white/5">
                  <span className="block text-[10px] text-[#C5A880] font-medium tracking-wide">Instant Load</span>
                  <span className="block text-[9px] text-[#A1A1AA]">Offline caching</span>
                </div>
                <div className="py-2 px-1 rounded-lg bg-white/5 border border-white/5">
                  <span className="block text-[10px] text-[#C5A880] font-medium tracking-wide">Priority Access</span>
                  <span className="block text-[9px] text-[#A1A1AA]">Rare batches</span>
                </div>
                <div className="py-2 px-1 rounded-lg bg-white/5 border border-white/5">
                  <span className="block text-[10px] text-[#C5A880] font-medium tracking-wide">Atelier Feel</span>
                  <span className="block text-[9px] text-[#A1A1AA]">Full screen mode</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={dismiss}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs tracking-wider uppercase font-medium text-[#A1A1AA] hover:text-[#FAF8F5] transition-all active:scale-[0.98] text-center"
                >
                  Not now
                </button>

                <button
                  type="button"
                  onClick={handleInstallClick}
                  disabled={isInstalling}
                  className="flex-[1.4] py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C5A880] to-[#B08D55] hover:brightness-110 active:scale-[0.98] text-black text-xs tracking-widest uppercase font-semibold transition-all shadow-[0_4px_20px_rgba(197,168,128,0.35)] flex items-center justify-center gap-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isInstalling ? 'Installing...' : 'Install'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* iOS Safari Step-by-Step Guide */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#C5A880]" />
                  <h4 className="font-serif text-sm font-semibold tracking-wide text-[#FAF8F5]">
                    Add to iPhone Home Screen
                  </h4>
                </div>
                <span className="text-[10px] text-[#C5A880] uppercase tracking-wider font-medium">Safari Guide</span>
              </div>

              <p className="text-xs text-[#D4D4D8]">
                Safari does not show an automatic prompt. Follow these 2 easy steps:
              </p>

              <div className="space-y-2.5">
                {/* Step 1 */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-[#FAF8F5] block">Step 1</span>
                    <span className="text-[#A1A1AA]">Tap the <strong className="text-[#FAF8F5]">Share</strong> button in the Safari navigation bar at the bottom.</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-[#C5A880]/20 border border-[#C5A880]/40 flex items-center justify-center text-[#C5A880] shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-[#FAF8F5] block">Step 2</span>
                    <span className="text-[#A1A1AA]">Scroll down and tap <strong className="text-[#FAF8F5]">Add to Home Screen</strong>.</span>
                  </div>
                </div>
              </div>

              {/* Step completion button */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowIosSteps(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-white/10 text-xs tracking-wider uppercase font-medium text-[#A1A1AA] hover:text-[#FAF8F5] transition-all text-center"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="flex-[1.4] py-3 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A880] text-black text-xs tracking-widest uppercase font-semibold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Got It</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
