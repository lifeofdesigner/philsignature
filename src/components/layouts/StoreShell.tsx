import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnnouncementBar } from '@/components/common/AnnouncementBar';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileFooterNav } from '@/components/common/MobileFooterNav';
import { cn } from '@/lib/utils';

export const StoreShell: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-black text-luxury-cream relative selection:bg-luxury-gold selection:text-black">
      <AnnouncementBar />
      <Navbar />
      <main className={cn(
        'flex-1 pb-[calc(4.25rem+env(safe-area-inset-bottom,0px))] lg:pb-0',
        isHomePage && '-mt-[76px] sm:-mt-[88px]'
      )}>
        <Outlet />
      </main>
      <Footer />
      <MobileFooterNav />
    </div>
  );
};

