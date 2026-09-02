import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from '@/components/common/AnnouncementBar';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileFooterNav } from '@/components/common/MobileFooterNav';

export const StoreShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-black text-luxury-cream">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileFooterNav />
    </div>
  );
};

