import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ArrowRight, LogOut, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useStoreMenu } from '@/features/cms/hooks/useStoreMenu';
import { useStoreAppearance } from '@/features/cms/hooks/useStoreAppearance';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useTheme } from '@/providers/ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const { count: wishlistCount } = useWishlist();
  const { totalCount: cartCount } = useCart();
  const { items: dynamicNavItems } = useStoreMenu();
  const { user, profile, logout, canAccessAdmin } = useAuth();
  const { appearance } = useStoreAppearance();
  const { settings } = useStoreSettings();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const isDarkChrome = theme !== 'light';
  const logoUrl =
    (isDarkChrome ? appearance.logo_dark_url : appearance.logo_light_url) ||
    appearance.logo_url ||
    (isDarkChrome ? '/brand/philz-logo-dark.png' : '/brand/philz-logo-light.png');
  const [logoLoadError, setLogoLoadError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const SIZE_PRESETS: Record<string, { desktop: number; mobile: number }> = {
    small: { desktop: 36, mobile: 30 },
    medium: { desktop: 44, mobile: 34 },
    large: { desktop: 56, mobile: 40 },
    xl: { desktop: 68, mobile: 46 },
    huge: { desktop: 80, mobile: 52 },
  };

  const currentSizePreset = appearance.logo_size && SIZE_PRESETS[appearance.logo_size]
    ? SIZE_PRESETS[appearance.logo_size]
    : SIZE_PRESETS.medium;

  const baseDesktopHeight = appearance.logo_height || currentSizePreset.desktop;
  const baseMobileHeight = appearance.logo_mobile_height || currentSizePreset.mobile;

  const desktopLogoHeight = isScrolled ? Math.max(34, Math.round(baseDesktopHeight * 0.88)) : baseDesktopHeight;
  const mobileLogoHeight = isScrolled ? Math.max(28, Math.round(baseMobileHeight * 0.90)) : baseMobileHeight;

  useEffect(() => {
    setLogoLoadError(false);
  }, [logoUrl]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.');
      navigate('/login');
    } catch {
      toast.error('Failed to sign out. Please try again.');
    }
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = dynamicNavItems.length > 0
    ? dynamicNavItems.map((item) => ({ name: item.label, href: item.url }))
    : [
        { name: 'Perfume Oils', href: '/shop?category=perfume-body-oils' },
        { name: 'All Perfumes', href: '/shop' },
        { name: 'Home Fragrance', href: '/shop?category=home-fragrance' },
        { name: 'Our Story', href: '/about' },
        { name: 'Private Label & Gifting', href: '/contact' },
      ];

  return (
    <motion.nav
      className={cn(
        'w-full transition-all duration-300 select-none pointer-events-auto',
        isScrolled
          ? 'bg-black/90 backdrop-blur-xl border-b border-white/10 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)]'
          : 'bg-transparent border-b border-transparent py-3 sm:py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between gap-3 lg:gap-6">
        
        {/* Left Side: Brand Logo & Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/"
            className="flex items-center group py-0.5 select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-luxury-gold gap-2 sm:gap-2.5 text-decoration-none shrink-0"
          >
            {logoUrl && !logoLoadError ? (
              <motion.picture
                className="flex items-center justify-center shrink-0"
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              >
                {appearance.logo_mobile_url && (
                  <source media="(max-width: 640px)" srcSet={appearance.logo_mobile_url} />
                )}
                {isDarkChrome && appearance.logo_dark_url && (
                  <source srcSet={appearance.logo_dark_url} />
                )}
                {!isDarkChrome && appearance.logo_light_url && (
                  <source srcSet={appearance.logo_light_url} />
                )}
                <img
                  src={logoUrl}
                  alt={settings.store_name || 'Philz Signature'}
                  onError={() => setLogoLoadError(true)}
                  className="brand-navbar-logo w-auto object-contain transition-all duration-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
                />
                <style>{`
                  .brand-navbar-logo {
                    height: ${mobileLogoHeight}px !important;
                    max-height: 48px !important;
                  }
                  @media (min-width: 640px) {
                    .brand-navbar-logo {
                      height: ${desktopLogoHeight}px !important;
                      max-height: 56px !important;
                    }
                  }
                `}</style>
              </motion.picture>
            ) : null}

            {/* Brand Title */}
            {(appearance.show_business_name !== false || !logoUrl || logoLoadError) && (
              <div className="flex flex-col items-start select-none text-left leading-none">
                <span className="font-serif text-sm sm:text-base lg:text-lg tracking-[0.2em] sm:tracking-[0.24em] text-white uppercase font-normal group-hover:text-luxury-gold transition-colors duration-200 whitespace-nowrap drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                  {settings.store_name || 'PHILZ SIGNATURE'}
                </span>
                <span className="hidden 2xl:block text-[7px] tracking-[0.28em] text-luxury-gold font-medium uppercase mt-0.5 whitespace-nowrap drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] opacity-90">
                  {settings.store_slogan || 'HAUTE PARFUMERIE'}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav
          className="hidden lg:flex items-center justify-center gap-4 xl:gap-6 2xl:gap-8 flex-1 min-w-0"
          onMouseLeave={() => setHoveredNav(null)}
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                onMouseEnter={() => setHoveredNav(link.name)}
                className={cn(
                  'relative py-1 text-[11px] xl:text-xs uppercase tracking-[0.16em] xl:tracking-[0.2em] font-medium transition-colors duration-200 select-none shrink-0 whitespace-nowrap drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]',
                  isActive ? 'text-luxury-gold font-semibold drop-shadow-[0_0_8px_rgba(212,175,55,0.7)]' : 'text-white/85 hover:text-white'
                )}
              >
                {/* Subtle Hover Capsule */}
                {hoveredNav === link.name && (
                  <motion.span
                    layoutId="navbar-hover-capsule"
                    className="absolute -inset-x-2.5 -inset-y-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
                {/* Active Route Dot */}
                {isActive && (
                  <motion.span
                    layoutId="navbar-active-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 bg-luxury-gold rounded-full shadow-[0_0_8px_rgba(197,168,128,0.95)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Theme, Search, Wishlist, User & Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Currency Indicator */}
          <div className="hidden 2xl:flex items-center text-[11px] font-mono text-white/70 tracking-wider pr-1 cursor-default select-none shrink-0">
            <span>NGN ₦</span>
          </div>

          {/* Theme Switcher */}
          <div className="shrink-0 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">
            <ThemeToggle />
          </div>

          {/* Search Icon */}
          <Link
            to="/shop"
            className="h-8 w-8 rounded-full flex items-center justify-center text-white/85 hover:text-luxury-gold hover:bg-white/10 transition-colors drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] shrink-0"
            title="Search Perfumes"
            aria-label="Search perfumes"
          >
            <Search className="h-3.5 w-3.5" />
          </Link>

          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            className="hidden sm:flex h-8 w-8 rounded-full items-center justify-center text-white/85 hover:text-luxury-gold hover:bg-white/10 transition-colors relative drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] shrink-0"
            title="Wishlist"
            aria-label="View saved perfumes"
          >
            <Heart className="h-3.5 w-3.5" />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-luxury-gold text-black text-[8px] font-bold flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Account Icon */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden sm:flex h-8 w-8 rounded-full items-center justify-center text-white/85 hover:text-luxury-gold hover:bg-white/10 transition-colors relative cursor-pointer shrink-0 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]"
                  title="My Account"
                  aria-label="Customer account portal"
                >
                  <User className="h-3.5 w-3.5" />
                  <span className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-luxury-gold ring-1 ring-black" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 space-y-1 bg-black/95 backdrop-blur-xl border border-white/15 shadow-2xl">
                <div className="px-2.5 py-2 border-b border-white/10 mb-1">
                  <p className="text-xs font-serif font-medium text-white truncate">
                    {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Privileged Patron'}
                  </p>
                  <p className="text-[10px] text-white/50 truncate font-mono mt-0.5">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center gap-2.5 w-full text-xs text-white/80 hover:text-white">
                    <User className="h-3.5 w-3.5 text-luxury-gold" />
                    <span>My Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/orders" className="flex items-center gap-2.5 w-full text-xs text-white/80 hover:text-white">
                    <ShoppingBag className="h-3.5 w-3.5 text-luxury-gold" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wishlist" className="flex items-center gap-2.5 w-full text-xs text-white/80 hover:text-white">
                    <Heart className="h-3.5 w-3.5 text-luxury-gold" />
                    <span>My Wishlist</span>
                  </Link>
                </DropdownMenuItem>
                {canAccessAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2.5 w-full text-xs text-luxury-gold font-medium">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Admin Portal</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex h-8 w-8 rounded-full items-center justify-center text-white/85 hover:text-luxury-gold hover:bg-white/10 transition-colors drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] shrink-0"
              title="Sign In"
              aria-label="Sign in to your account"
            >
              <User className="h-3.5 w-3.5" />
            </Link>
          )}

          {/* Minimalist Cart Pill */}
          <Link
            to="/cart"
            className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-luxury-gold hover:text-black border border-white/20 hover:border-luxury-gold transition-all text-xs font-medium text-white flex items-center gap-1.5 shadow-md backdrop-blur-md shrink-0"
            title="Shopping Cart"
            aria-label="View shopping cart"
          >
            <span className="text-[11px] uppercase tracking-wider font-semibold">Cart</span>
            <span className="font-mono text-xs font-semibold">({cartCount})</span>
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-8 w-8 flex items-center justify-center text-white hover:text-luxury-gold transition-colors cursor-pointer rounded-full hover:bg-white/10 shrink-0 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] ml-0.5"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Animated Luxury Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden mt-2 mx-4 bg-black/95 backdrop-blur-2xl border border-luxury-gold/30 rounded-xl overflow-hidden shadow-2xl pointer-events-auto"
          >
            <div className="p-6 space-y-6">
              {/* Navigation Links */}
              <div className="space-y-3">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={cn(
                        'flex items-center justify-between py-2 text-sm uppercase tracking-luxury font-medium border-b border-white/10 transition-colors',
                        isActive ? 'text-luxury-gold font-semibold' : 'text-white/80 hover:text-white'
                      )}
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                    </Link>
                  );
                })}
              </div>

              {/* Mobile Quick Action Links */}
              <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
                <Link
                  to="/wishlist"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-white/5 border border-white/15 text-white hover:border-luxury-gold"
                >
                  <Heart className="h-3.5 w-3.5 text-luxury-gold" />
                  <span>Wishlist ({wishlistCount})</span>
                </Link>

                <Link
                  to={user ? '/account' : '/login'}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-white/5 border border-white/15 text-white hover:border-luxury-gold"
                >
                  <User className="h-3.5 w-3.5 text-luxury-gold" />
                  <span>{user ? 'My Account' : 'Sign In'}</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
