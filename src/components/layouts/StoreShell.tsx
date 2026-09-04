import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnnouncementBar } from '@/components/common/AnnouncementBar';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileFooterNav } from '@/components/common/MobileFooterNav';
import { ScrollToTopButton } from '@/components/common/ScrollToTopButton';
import { cn } from '@/lib/utils';

export const StoreShell: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-black text-luxury-cream relative selection:bg-luxury-gold selection:text-black">
      {/* Floating Header Overlay (Sits directly inside the Hero on Homepage) */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full pointer-events-none">
        <div className="pointer-events-auto">
          <AnnouncementBar />
          <Navbar />
        </div>
      </header>

      {/* Main Viewport Content */}
      <main
        className={cn(
          'flex-1 pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:pb-0',
          !isHomePage && 'pt-24 sm:pt-28'
        )}
      >
        <Outlet />
      </main>

      <Footer />
      <MobileFooterNav />
      <ScrollToTopButton />
    </div>
  );
};

