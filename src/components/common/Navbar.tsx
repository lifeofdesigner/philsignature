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

  // Dynamic Scroll Detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const baseDesktopHeight = appearance.logo_height || currentSizePreset.desktop;
  const baseMobileHeight = appearance.logo_mobile_height || currentSizePreset.mobile;

  // On scroll: subtly streamline logo height by 12% for sleek browsing
  const desktopLogoHeight = isScrolled ? Math.max(42, Math.round(baseDesktopHeight * 0.88)) : baseDesktopHeight;
  const mobileLogoHeight = isScrolled ? Math.max(34, Math.round(baseMobileHeight * 0.90)) : baseMobileHeight;

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

  const navLinks = dynamicNavItems.length > 0
    ? dynamicNavItems.map((item) => ({ name: item.label, href: item.url }))
    : [
        { name: 'Collections', href: '/collections' },
        { name: 'All Perfumes', href: '/shop' },
        { name: 'Woody & Oud', href: '/shop?family=Woody' },
        { name: 'Oriental & Amber', href: '/shop?family=Oriental' },
        { name: 'About Us', href: '/about' },
      ];

  return (
    <motion.nav
      className={cn(
        'w-full transition-all duration-500 select-none px-3 sm:px-6 lg:px-8 pointer-events-none',
        isScrolled ? 'pt-1.5 sm:pt-2' : 'pt-2 sm:pt-4'
      )}
    >
      <div
        className={cn(
          'container max-w-6xl mx-auto rounded-full transition-all duration-500 flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-7 py-2 sm:py-2.5 pointer-events-auto',
          isScrolled
            ? 'bg-black/90 backdrop-blur-2xl border border-luxury-gold/35 shadow-[0_16px_40px_rgba(0,0,0,0.85)]'
            : 'bg-black/45 backdrop-blur-2xl border border-white/20 shadow-[0_12px_35px_rgba(0,0,0,0.6)] hover:border-white/35 hover:bg-black/55'
        )}
      >
        {/* Left Side: Brand Crest & Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Menu Toggle Button */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-9 w-9 -ml-1 flex items-center justify-center text-white hover:text-luxury-gold transition-colors cursor-pointer rounded-full hover:bg-white/10 shrink-0 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="h-5 w-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Luxury Logo & Typography */}
          <Link
            to="/"
            className="flex items-center group py-0.5 select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-luxury-gold px-1 gap-2.5 sm:gap-3 text-decoration-none"
          >
            {logoUrl && !logoLoadError ? (
              <motion.picture
                className="flex items-center justify-center shrink-0"
                whileHover={{ scale: 1.04 }}
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
                  alt={settings.store_name || 'Philz Signature Logo'}
                  onError={() => setLogoLoadError(true)}
                  className="brand-navbar-logo w-auto object-contain transition-all duration-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
                />
                <style>{`
                  .brand-navbar-logo {
                    height: ${mobileLogoHeight}px !important;
                    max-height: 120px !important;
                  }
                  @media (min-width: 640px) {
                    .brand-navbar-logo {
                      height: ${desktopLogoHeight}px !important;
                      max-height: 150px !important;
                    }
                  }
                `}</style>
              </motion.picture>
            ) : null}

            {/* Brand Name Typography */}
            {(appearance.show_business_name !== false || !logoUrl || logoLoadError) && (
              <div className="flex flex-col items-start select-none text-left leading-none">
                <span className="font-serif text-sm sm:text-base lg:text-lg tracking-[0.2em] sm:tracking-[0.26em] text-white uppercase font-normal group-hover:text-luxury-gold transition-colors duration-200 whitespace-nowrap drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                  {settings.store_name || 'PHILZ SIGNATURE'}
                </span>
                <span className="text-[6.5px] sm:text-[7.5px] lg:text-[8px] tracking-[0.28em] sm:tracking-[0.34em] text-luxury-gold font-medium uppercase mt-0.5 sm:mt-1 whitespace-nowrap drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] opacity-95">
                  {settings.store_slogan || 'HAUTE PARFUMERIE'}
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Center: Desktop Navigation Links (Spacious, Uncrowded & Single Line) */}
        <nav
          className="hidden lg:flex items-center space-x-6 xl:space-x-8 flex-nowrap whitespace-nowrap"
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
                  'relative py-1.5 text-xs uppercase tracking-luxury font-medium transition-colors duration-200 select-none flex items-center gap-1 shrink-0 whitespace-nowrap drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]',
                  isActive ? 'text-luxury-gold font-semibold drop-shadow-[0_0_8px_rgba(212,175,55,0.7)]' : 'text-white/90 hover:text-white'
                )}
              >
                {/* Sliding Hover Capsule */}
                {hoveredNav === link.name && (
                  <motion.span
                    layoutId="navbar-hover-capsule"
                    className="absolute -inset-x-3 -inset-y-1 rounded-full bg-black/40 border border-white/20 backdrop-blur-md -z-10 shadow-lg"
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

        {/* Right Side: Currency, Theme, Search, User & Cart */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-nowrap shrink-0">
          {/* Currency Indicator (ÁRUM Framer Style) */}
          <div className="hidden xl:flex items-center text-xs font-mono text-white/90 tracking-wider pr-1 cursor-default select-none shrink-0 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">
            <span>NGN ₦</span>
          </div>

          {/* Theme Switcher */}
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="shrink-0 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]">
            <ThemeToggle />
          </motion.div>

          {/* Search Icon */}
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="shrink-0">
            <Link
              to="/shop"
              className="h-9 w-9 rounded-full flex items-center justify-center text-white/90 hover:text-luxury-gold hover:bg-black/40 backdrop-blur-xs transition-colors drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]"
              title="Search Perfumes"
              aria-label="Search perfumes"
            >
              <Search className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Wishlist Icon */}
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="hidden sm:block shrink-0">
            <Link
              to="/wishlist"
              className="h-9 w-9 rounded-full flex items-center justify-center text-white/90 hover:text-luxury-gold hover:bg-black/40 backdrop-blur-xs transition-colors relative drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]"
              title="Wishlist"
              aria-label="View saved perfumes"
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-luxury-gold text-black text-[8px] font-bold flex items-center justify-center shadow-xs"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>
          </motion.div>

          {/* Account Icon & Dropdown Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="hidden sm:flex h-9 w-9 rounded-full items-center justify-center text-white/90 hover:text-luxury-gold hover:bg-black/40 backdrop-blur-xs transition-colors relative cursor-pointer shrink-0 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]"
                  title="My Account"
                  aria-label="Customer account portal"
                >
                  <User className="h-4 w-4" />
                  <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-luxury-gold ring-2 ring-black" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 space-y-1 bg-luxury-card/95 backdrop-blur-xl border border-luxury-border shadow-2xl">
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
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="hidden sm:block shrink-0">
              <Link
                to="/login"
                className="h-9 w-9 rounded-full flex items-center justify-center text-white/90 hover:text-luxury-gold hover:bg-black/40 backdrop-blur-xs transition-colors drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]"
                title="Sign In"
                aria-label="Sign in to your account"
              >
                <User className="h-4 w-4" />
              </Link>
            </motion.div>
          )}

          {/* Minimalist Cart Pill (ÁRUM Framer Style with Contrast Protection) */}
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="shrink-0">
            <Link
              to="/cart"
              className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/25 hover:border-luxury-gold hover:bg-luxury-gold hover:text-black transition-all text-xs font-medium text-white flex items-center gap-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.6)] shrink-0"
              title="Shopping Cart"
              aria-label="View shopping cart"
            >
              <span>Cart</span>
              <span className="font-mono font-semibold">({cartCount})</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Mobile Animated Luxury Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden mt-2 bg-luxury-black/98 backdrop-blur-2xl border border-luxury-gold/30 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
          >
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={{
                open: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } },
                closed: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
              }}
              className="px-5 py-6 space-y-6 max-h-[80vh] overflow-y-auto"
            >
              {/* Category Navigation */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-semibold block mb-2">
                  Fragrance Collections
                </span>
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <motion.div
                      key={link.name}
                      variants={{
                        open: { opacity: 1, y: 0 },
                        closed: { opacity: 0, y: 8 },
                      }}
                    >
                      <Link
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
                    </motion.div>
                  );
                })}
              </div>

              {/* Client Services & Support */}
              <motion.div
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: 8 },
                }}
                className="space-y-2 pt-2 border-t border-luxury-border/60"
              >
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
              </motion.div>

              {/* Account & Session Controls */}
              <motion.div
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: 8 },
                }}
                className="space-y-2 pt-2 border-t border-luxury-border/60"
              >
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
              </motion.div>

              {/* Theme Toggle & Quick Action */}
              <motion.div
                variants={{
                  open: { opacity: 1, y: 0 },
                  closed: { opacity: 0, y: 8 },
                }}
                className="pt-2 border-t border-luxury-border/60 flex items-center justify-between"
              >
                <span className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">Appearance</span>
                <ThemeToggle showLabel />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
