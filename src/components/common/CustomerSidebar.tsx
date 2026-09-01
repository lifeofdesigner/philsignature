import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  MapPin,
  User,
  LogOut,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

export const customerNavItems = [
  { title: 'My Orders', href: '/account/orders', icon: ShoppingBag },
  { title: 'Track Order', href: '/track-order', icon: Clock },
  { title: 'Saved Wishlist', href: '/wishlist', icon: Heart },
  { title: 'Address Book', href: '/account/addresses', icon: MapPin },
  { title: 'Profile & Security', href: '/account/profile', icon: User },
];

export const CustomerSidebar: React.FC = () => {
  const { logout, profile } = useAuth();

  return (
    <aside className="w-full lg:w-64 space-y-6">
      {/* Customer Crest Card */}
      <div className="bg-luxury-card border border-luxury-border p-6 text-center">
        <div className="h-16 w-16 mx-auto rounded-full border border-luxury-gold/40 bg-luxury-black flex items-center justify-center text-luxury-gold mb-3">
          <span className="font-serif text-xl">
            {profile?.first_name?.charAt(0) || 'P'}
          </span>
        </div>
        <h3 className="font-serif text-lg text-white font-normal">
          {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Privileged Patron'}
        </h3>
        <p className="text-[11px] uppercase tracking-luxury text-luxury-gold mt-1">
          Private Circle Member
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="bg-luxury-card border border-luxury-border p-2 space-y-1">
        {customerNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-luxury transition-colors rounded-sm font-medium',
                  isActive
                    ? 'bg-luxury-gold/15 text-luxury-gold border-l-2 border-luxury-gold font-semibold'
                    : 'text-luxury-muted hover:text-white hover:bg-luxury-border/30'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs uppercase tracking-luxury text-red-400 hover:bg-red-950/20 transition-colors text-left"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </nav>
    </aside>
  );
};

