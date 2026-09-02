import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Shield, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import { ThemeToggle } from './ThemeToggle';
import { ROLE_LABELS } from '@/lib/permissions';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleSidebar,
}) => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.');
      navigate('/login');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  const roleLabel = profile?.role && profile.role in ROLE_LABELS
    ? ROLE_LABELS[profile.role]
    : 'Administrator';

  return (
    <header className="h-16 bg-luxury-charcoal/80 backdrop-blur-md border-b border-luxury-border/60 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-luxury-muted hover:text-luxury-cream lg:hidden"
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

      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <button className="p-2 text-luxury-muted hover:text-luxury-gold transition-colors relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-luxury-gold" />
        </button>

        {/* Administrator Badge */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-4 border-l border-luxury-border">
          <div className="h-8 w-8 rounded-full border border-luxury-gold/40 bg-luxury-black flex items-center justify-center text-luxury-gold">
            <Shield className="h-4 w-4" />
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-medium text-luxury-cream leading-tight">
              {profile?.first_name || 'Staff Member'}
            </span>
            <span className="text-[9px] uppercase tracking-luxury text-luxury-gold">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Sign Out Action Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-500/20 rounded-sm transition-colors cursor-pointer"
          title="Sign Out of Admin"
          aria-label="Sign Out"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-[11px] uppercase tracking-luxury font-medium">Sign Out</span>
        </button>
      </div>
    </header>
  );
};

