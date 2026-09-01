import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from '@/components/common/AnnouncementBar';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';

export const StoreShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-black text-luxury-cream">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

