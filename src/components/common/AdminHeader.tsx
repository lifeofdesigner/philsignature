import React from 'react';
import { Menu, Bell, Shield } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
}) => {
  const { profile } = useAuth();

  return (
    <header className="h-16 bg-luxury-charcoal/80 backdrop-blur-md border-b border-luxury-border/60 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-luxury-muted hover:text-white lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-luxury text-luxury-gold font-medium">
            Control Center
          </span>
          <span className="text-luxury-border">/</span>
          <span className="text-xs uppercase tracking-luxury text-luxury-muted">
            Haute Atelier
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <button className="p-2 text-luxury-muted hover:text-luxury-gold transition-colors relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-luxury-gold" />
        </button>

        {/* Administrator Badge */}
        <div className="flex items-center gap-3 pl-4 border-l border-luxury-border">
          <div className="h-8 w-8 rounded-full border border-luxury-gold/40 bg-luxury-black flex items-center justify-center text-luxury-gold">
            <Shield className="h-4 w-4" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-medium text-white leading-tight">
              {profile?.first_name || 'Administrator'}
            </span>
            <span className="text-[9px] uppercase tracking-luxury text-luxury-gold">
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

