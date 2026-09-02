import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Heart, ShoppingBag, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

export const MobileFooterNav: React.FC = () => {
  const location = useLocation();
  const { count: wishlistCount } = useWishlist();
  const { totalCount: cartCount } = useCart();
  const { user } = useAuth();

  const currentPath = location.pathname;

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: currentPath === '/',
    },
    {
      label: 'Shop',
      href: '/shop',
      icon: Compass,
      isActive: currentPath.startsWith('/shop') || currentPath.startsWith('/collections') || currentPath.startsWith('/product'),
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      badge: wishlistCount,
      isActive: currentPath === '/wishlist',
    },
    {
      label: 'Cart',
      href: '/cart',
      icon: ShoppingBag,
      badge: cartCount,
      isActive: currentPath === '/cart' || currentPath.startsWith('/checkout'),
    },
    {
      label: user ? 'Account' : 'Sign In',
      href: user ? '/account' : '/login',
      icon: User,
      isActive: currentPath.startsWith('/account') || currentPath === '/login' || currentPath === '/signup',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-luxury-black/95 backdrop-blur-lg border-t border-luxury-border/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom,0px)] select-none"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center py-1 transition-all duration-200 select-none touch-manipulation group active:scale-95',
                item.isActive
                  ? 'text-luxury-gold font-semibold'
                  : 'text-luxury-muted hover:text-luxury-cream'
              )}
            >
              {/* Active Animated Pill Indicator */}
              {item.isActive && (
                <motion.span
                  layoutId="mobileActiveTabIndicator"
                  className="absolute top-0 w-8 h-0.5 bg-luxury-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}

              {/* Icon with Badge */}
              <div className="relative flex items-center justify-center">
                <Icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    item.isActive && 'stroke-[2.25] text-luxury-gold'
                  )}
                />

                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 h-4 min-w-[16px] px-1 rounded-full bg-luxury-gold text-black text-[9px] font-bold flex items-center justify-center leading-none shadow-sm">
                    {item.badge! > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-[10px] uppercase tracking-wider mt-1 transition-colors leading-none',
                  item.isActive ? 'text-luxury-gold' : 'text-luxury-muted'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
