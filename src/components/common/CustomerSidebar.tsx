import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  MapPin,
  User,
  LogOut,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';

export const customerNavItems = [
  { title: 'Dashboard', href: '/account', icon: LayoutDashboard, exact: true },
  { title: 'My Orders', href: '/account/orders', icon: ShoppingBag },
  { title: 'Track Order', href: '/track-order', icon: Clock },
  { title: 'My Wishlist', href: '/wishlist', icon: Heart },
  { title: 'My Addresses', href: '/account/addresses', icon: MapPin },
  { title: 'Profile & Password', href: '/account/profile', icon: User },
];

export const CustomerSidebar: React.FC = () => {
  const { logout, profile } = useAuth();

  return (
    <aside className="w-full lg:w-64 space-y-4 lg:space-y-6">
      {/* Customer Crest Card */}
      <div className="bg-luxury-card border border-luxury-border p-4 sm:p-6 flex lg:flex-col items-center lg:text-center gap-4 lg:gap-0">
        <div className="h-12 w-12 lg:h-16 lg:w-16 rounded-full border border-luxury-gold/40 bg-luxury-black flex items-center justify-center text-luxury-gold lg:mb-3 shrink-0">
          <span className="font-serif text-lg lg:text-xl">
            {profile?.first_name?.charAt(0) || 'P'}
          </span>
        </div>
        <div className="text-left lg:text-center min-w-0 flex-1">
          <h3 className="font-serif text-base lg:text-lg text-white font-normal truncate">
            {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Valued Customer'}
          </h3>
          <p className="text-[10px] lg:text-[11px] uppercase tracking-luxury text-luxury-gold mt-0.5 lg:mt-1">
            Customer Account
          </p>
        </div>
      </div>

      {/* Navigation Links (Horizontal scroll on mobile, vertical stack on desktop) */}
      <nav className="bg-luxury-card border border-luxury-border p-1.5 sm:p-2 flex lg:flex-col overflow-x-auto lg:overflow-x-visible scrollbar-none gap-1">
        {customerNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={Boolean(item.exact)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 lg:gap-3 px-3.5 py-2 text-xs uppercase tracking-luxury transition-colors rounded-sm font-medium whitespace-nowrap shrink-0',
                  isActive
                    ? 'bg-luxury-gold text-black lg:bg-luxury-gold/15 lg:text-luxury-gold lg:border-l-2 lg:border-luxury-gold font-semibold'
                    : 'text-luxury-muted hover:text-white hover:bg-luxury-border/30'
                )
              }
            >
              <Icon className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}

        <div className="hidden lg:flex items-center justify-between px-3.5 py-2.5 pt-4 border-t border-luxury-border/60 text-xs uppercase tracking-luxury text-luxury-cream">
          <span>Theme</span>
          <ThemeToggle showLabel />
        </div>

        <button
          onClick={() => logout()}
          className="flex items-center gap-2 lg:gap-3 px-3.5 py-2 text-xs uppercase tracking-luxury text-red-400 hover:bg-red-950/20 transition-colors text-left whitespace-nowrap shrink-0"
        >
          <LogOut className="h-3.5 w-3.5 lg:h-4 lg:w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </nav>
    </aside>
  );
};

