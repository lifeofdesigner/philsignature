import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ArrowRight, MapPin, Clock, LogOut, Shield } from 'lucide-react';
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
  const logoUrl = (isDarkChrome ? appearance.logo_dark_url : appearance.logo_light_url) || appearance.logo_url;
  const [logoLoadError, setLogoLoadError] = useState(false);

  // Logo size calculation: Supports both preset scale (Small to Biggest) and fine-tuned pixel slider
  const SIZE_PRESETS: Record<string, { desktop: number; mobile: number }> = {
    small: { desktop: 48, mobile: 38 },
    medium: { desktop: 72, mobile: 52 },
    large: { desktop: 96, mobile: 68 },
    xl: { desktop: 120, mobile: 82 },
    huge: { desktop: 150, mobile: 98 },
  };

  const currentSizePreset = appearance.logo_size && SIZE_PRESETS[appearance.logo_size]
    ? SIZE_PRESETS[appearance.logo_size]
    : SIZE_PRESETS.medium;

  const desktopLogoHeight = appearance.logo_height || currentSizePreset.desktop;
  const mobileLogoHeight = appearance.logo_mobile_height || currentSizePreset.mobile;

  useEffect(() => {
    setLogoLoadError(false);
  }, [logoUrl]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully.');
      navigate('/login');
    } catch {
      toast.error('Failed to sign out.');
    }
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
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

  const navLinks = dynamicNavItems.map((item) => ({
    name: item.label,
    href: item.url,
    target: item.target || '_self',
    badge: item.badge,
  }));

  return (
    <header className="sticky top-0 z-40 w-full bg-luxury-black/95 backdrop-blur-md border-b border-luxury-border/60 transition-colors">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 min-h-[4.5rem] sm:min-h-[5rem] py-2 flex items-center justify-between transition-all duration-300">
        {/* Left Side: Mobile Menu Button or Desktop Navigation */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-11 w-11 -ml-1 flex items-center justify-center text-luxury-cream hover:text-luxury-gold transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Desktop Left Nav */}
          <nav className="hidden lg:flex items-center space-x-7">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'text-xs uppercase tracking-luxury font-medium transition-colors hover:text-luxury-gold',
                  location.pathname === link.href ? 'text-luxury-gold' : 'text-luxury-cream/80'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Luxury Logo & Brand Name */}
        <Link
          to="/"
          className="flex flex-row sm:flex-col items-center justify-center group py-1 select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-luxury-gold px-2 gap-2.5 sm:gap-1"
        >
          {logoUrl && !logoLoadError ? (
            <picture className="flex items-center justify-center shrink-0">
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
                alt="Philz Signature Logo"
                onError={() => setLogoLoadError(true)}
                className="brand-navbar-logo w-auto max-w-[260px] sm:max-w-[420px] object-contain group-hover:opacity-90 transition-all duration-300"
              />
              <style>{`
                .brand-navbar-logo {
                  height: ${mobileLogoHeight}px !important;
                  max-height: 140px !important;
                }
                @media (min-width: 640px) {
                  .brand-navbar-logo {
                    height: ${desktopLogoHeight}px !important;
                    max-height: 180px !important;
                  }
                }
              `}</style>
            </picture>
          ) : null}

          {/* Business Name: Beside logo on mobile, Under logo on desktop */}
          {(appearance.show_business_name !== false || !logoUrl || logoLoadError) && (
            <div className="flex flex-col items-start sm:items-center select-none text-left sm:text-center leading-none">
              <span className="font-serif text-xs sm:text-base lg:text-lg tracking-[0.14em] sm:tracking-[0.22em] text-luxury-cream uppercase font-normal group-hover:text-luxury-gold transition-colors whitespace-nowrap">
                {settings.store_name || 'PHILZ SIGNATURE'}
              </span>
              <span className="text-[7px] sm:text-[8px] lg:text-[8.5px] tracking-[0.24em] sm:tracking-[0.28em] text-luxury-gold font-medium uppercase mt-0.5 sm:mt-1 whitespace-nowrap">
                {settings.store_slogan || 'HAUTE PARFUMERIE'}
              </span>
            </div>
          )}
        </Link>

        {/* Right Side: Actions (Desktop & Mobile Optimized) */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Desktop Extra Links */}
          <nav className="hidden lg:flex items-center space-x-7 mr-3">
            {navLinks.slice(3).map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'text-xs uppercase tracking-luxury font-medium transition-colors hover:text-luxury-gold',
                  location.pathname === link.href ? 'text-luxury-gold' : 'text-luxury-cream/80'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Search Icon */}
          <Link
            to="/shop"
            className="h-11 w-11 flex items-center justify-center text-luxury-cream/80 hover:text-luxury-gold transition-colors"
            title="Search Perfumes"
            aria-label="Search perfumes"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* Wishlist Icon (Desktop only, mobile accesses via bottom nav) */}
          <Link
            to="/wishlist"
            className="hidden sm:flex h-11 w-11 items-center justify-center text-luxury-cream/80 hover:text-luxury-gold transition-colors relative"
            title="Wishlist"
            aria-label="View saved perfumes"
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute top-2 right-2 h-3.5 w-3.5 rounded-full bg-luxury-gold text-black text-[9px] font-bold flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Account Icon & Dropdown Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden sm:flex h-11 w-11 items-center justify-center text-luxury-cream/80 hover:text-luxury-gold transition-colors relative cursor-pointer"
                  title="My Account"
                  aria-label="Customer account portal"
                >
                  <User className="h-4 w-4" />
                  <span className="absolute bottom-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-luxury-gold ring-2 ring-black" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 space-y-1">
                <div className="px-2.5 py-2 border-b border-luxury-border/60 mb-1">
                  <p className="text-xs font-serif font-medium text-luxury-cream truncate">
                    {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Privileged Patron'}
                  </p>
                  <p className="text-[10px] text-luxury-muted truncate font-mono mt-0.5">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center gap-2.5 w-full">
                    <User className="h-3.5 w-3.5 text-luxury-gold" />
                    <span>My Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/account/orders" className="flex items-center gap-2.5 w-full">
                    <ShoppingBag className="h-3.5 w-3.5 text-luxury-gold" />
                    <span>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/wishlist" className="flex items-center gap-2.5 w-full">
                    <Heart className="h-3.5 w-3.5 text-luxury-gold" />
                    <span>My Wishlist</span>
                  </Link>
                </DropdownMenuItem>
                {canAccessAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2.5 w-full text-luxury-gold font-medium">
                      <Shield className="h-3.5 w-3.5" />
                      <span>Admin Portal</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full text-red-400 hover:text-red-300 hover:bg-red-950/30 focus:text-red-300 focus:bg-red-950/30 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex h-11 w-11 items-center justify-center text-luxury-cream/80 hover:text-luxury-gold transition-colors"
              title="Sign In"
              aria-label="Sign in to your account"
            >
              <User className="h-4 w-4" />
            </Link>
          )}

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="h-11 w-11 flex items-center justify-center text-luxury-cream/80 hover:text-luxury-gold transition-colors relative"
            title="Shopping Cart"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute top-2 right-2 h-3.5 w-3.5 rounded-full bg-luxury-gold text-black text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Animated Luxury Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden bg-luxury-black border-b border-luxury-border overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Category Navigation */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-semibold block mb-2">
                  Fragrance Collections
                </span>
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between py-3 border-b border-luxury-border/40 text-xs uppercase tracking-luxury font-medium transition-colors',
                        isActive ? 'text-luxury-gold font-semibold' : 'text-luxury-cream hover:text-luxury-gold'
                      )}
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-luxury-gold/60" />
                    </Link>
                  );
                })}
              </div>

              {/* Client Services & Support */}
              <div className="space-y-2 pt-2 border-t border-luxury-border/60">
                <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-semibold block mb-2">
                  Client Concierge
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/track-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 bg-luxury-card border border-luxury-border rounded-sm text-xs text-luxury-cream hover:border-luxury-gold transition-colors"
                  >
                    <Clock className="h-3.5 w-3.5 text-luxury-gold" />
                    <span>Track Order</span>
                  </Link>

                  <Link
                    to="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-3 bg-luxury-card border border-luxury-border rounded-sm text-xs text-luxury-cream hover:border-luxury-gold transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5 text-luxury-gold" />
                    <span>Contact Us</span>
                  </Link>
                </div>
              </div>

              {/* Account & Session Controls */}
              <div className="space-y-2 pt-2 border-t border-luxury-border/60">
                <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-semibold block mb-2">
                  Account & Privileges
                </span>
                {user ? (
                  <div className="space-y-2.5">
                    <div className="p-3 bg-luxury-card border border-luxury-border rounded-sm flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-serif font-medium text-luxury-cream truncate">
                          {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Privileged Patron'}
                        </p>
                        <p className="text-[10px] text-luxury-muted font-mono truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-xs text-luxury-gold hover:underline shrink-0 font-medium"
                      >
                        Dashboard →
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/account/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-luxury-card border border-luxury-border rounded-sm text-xs text-luxury-cream hover:border-luxury-gold transition-colors"
                      >
                        <ShoppingBag className="h-3.5 w-3.5 text-luxury-gold" />
                        <span>My Orders</span>
                      </Link>
                      {canAccessAdmin ? (
                        <Link
                          to="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-luxury-card border border-luxury-gold/50 rounded-sm text-xs text-luxury-gold hover:border-luxury-gold transition-colors font-medium"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          <span>Admin Portal</span>
                        </Link>
                      ) : (
                        <Link
                          to="/wishlist"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-luxury-card border border-luxury-border rounded-sm text-xs text-luxury-cream hover:border-luxury-gold transition-colors"
                        >
                          <Heart className="h-3.5 w-3.5 text-luxury-gold" />
                          <span>Wishlist</span>
                        </Link>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-950/40 rounded-sm text-xs font-medium uppercase tracking-luxury transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-luxury-gold text-black rounded-sm text-xs font-semibold uppercase tracking-luxury transition-transform active:scale-98"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Sign In / Register</span>
                  </Link>
                )}
              </div>

              {/* Theme Toggle & Quick Action */}
              <div className="pt-2 border-t border-luxury-border/60 flex items-center justify-between">
                <span className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">Appearance</span>
                <ThemeToggle showLabel />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
