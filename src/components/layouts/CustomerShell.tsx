import React from 'react';
import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from '@/components/common/AnnouncementBar';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { CustomerSidebar } from '@/components/common/CustomerSidebar';
import { MobileFooterNav } from '@/components/common/MobileFooterNav';
import { ScrollToTopButton } from '@/components/common/ScrollToTopButton';

export const CustomerShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-luxury-black text-luxury-cream">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8 sm:py-12 pb-24 lg:pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <CustomerSidebar />
          <div className="flex-1 bg-luxury-card border border-luxury-border rounded-sm shadow-xs p-6 sm:p-8">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
      <MobileFooterNav />
      <ScrollToTopButton />
    </div>
  );
};

