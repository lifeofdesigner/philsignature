import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY_DISMISSED = 'ps_pwa_install_dismissed_until';
const STORAGE_KEY_INSTALLED = 'ps_pwa_installed';
const STORAGE_KEY_PAGE_VIEWS = 'ps_pwa_page_views';
const DISMISS_DURATION_DAYS = 30;

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface UsePwaInstallResult {
  isEligible: boolean;
  isOpen: boolean;
  isIos: boolean;
  isStandalone: boolean;
  hasNativePrompt: boolean;
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unsupported'>;
  dismiss: () => void;
  openManual: () => void;
}

export function usePwaInstall(): UsePwaInstallResult {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);

  // Check client environment on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if running in standalone mode (already installed PWA)
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) {
      localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      return;
    }

    // 2. Check if user already installed previously
    if (localStorage.getItem(STORAGE_KEY_INSTALLED) === 'true') {
      return;
    }

    // 3. Check if user dismissed within last 30 days
    const dismissedUntil = localStorage.getItem(STORAGE_KEY_DISMISSED);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    // 4. Strict mobile browser detection (exclude desktop browsers)
    const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
    
    // Check for iPadOS spoofing macOS
    const isIpadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    const isActualMobile = isMobileDevice || isIpadOS;

    if (!isActualMobile) {
      // Do NOT show on desktop
      return;
    }

    // 5. Detect iOS Safari
    const isAppleIos = /iPhone|iPad|iPod/i.test(ua) || isIpadOS;
    setIsIos(isAppleIos);
    setIsEligible(true);

    // Track page views in session/local storage
    const currentViews = Number(sessionStorage.getItem(STORAGE_KEY_PAGE_VIEWS) || '0') + 1;
    sessionStorage.setItem(STORAGE_KEY_PAGE_VIEWS, String(currentViews));

    // Wait for either browsing duration (4.5s) or 2+ page views
    const delay = currentViews >= 2 ? 2500 : 4500;
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  // Listen for Chrome/Edge/Samsung Internet beforeinstallprompt event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
      setIsOpen(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger browser installation
  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unsupported'> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          localStorage.setItem(STORAGE_KEY_INSTALLED, 'true');
          setIsOpen(false);
          return 'accepted';
        } else {
          // If dismissed from browser dialog, dismiss sheet for 30 days
          const expiry = Date.now() + DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000;
          localStorage.setItem(STORAGE_KEY_DISMISSED, String(expiry));
          setIsOpen(false);
          return 'dismissed';
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      } finally {
        setDeferredPrompt(null);
      }
    }
    return 'unsupported';
  }, [deferredPrompt]);

  // Dismiss sheet for 30 days
  const dismiss = useCallback(() => {
    const expiry = Date.now() + DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY_DISMISSED, String(expiry));
    setIsOpen(false);
  }, []);

  const openManual = useCallback(() => {
    setIsOpen(true);
  }, []);

  return {
    isEligible,
    isOpen,
    isIos,
    isStandalone,
    hasNativePrompt: !!deferredPrompt,
    promptInstall,
    dismiss,
    openManual,
  };
}
