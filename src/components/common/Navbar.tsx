import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, ArrowRight, LogOut, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useStoreAppearance } from '@/features/cms/hooks/useStoreAppearance';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const { count: wishlistCount } = useWishlist();
  const { totalCount: cartCount } = useCart();
  const { user, profile, logout, canAccessAdmin } = useAuth();
  const { appearance } = useStoreAppearance();
  const { settings } = useStoreSettings();
  const navigate = useNavigate();

  const logoUrl =
    appearance.logo_dark_url ||
    appearance.logo_url ||
    appearance.logo_light_url ||
    '/brand/philz-logo-dark.png';
  const [logoLoadError, setLogoLoadError] = useState(false);

  // Smooth scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Visual size of the crest icon: prominent, crisp, and easily readable
  const SIZE_PRESETS: Record<string, { desktop: number; mobile: number }> = {
    small: { desktop: 54, mobile: 40 },
    medium: { desktop: 72, mobile: 52 },
    large: { desktop: 90, mobile: 62 },
    xl: { desktop: 108, mobile: 74 },
    huge: { desktop: 128, mobile: 86 },
  };

  const currentSizePreset = appearance.logo_size && SIZE_PRESETS[appearance.logo_size]
    ? SIZE_PRESETS[appearance.logo_size]
    : SIZE_PRESETS.medium;

  const baseDesktopHeight = appearance.logo_height || currentSizePreset.desktop;
  const baseMobileHeight = appearance.logo_mobile_height || currentSizePreset.mobile;

  const desktopLogoHeight = isScrolled ? Math.max(48, Math.round(baseDesktopHeight * 0.82)) : baseDesktopHeight;
  const mobileLogoHeight = isScrolled ? Math.max(38, Math.round(baseMobileHeight * 0.85)) : baseMobileHeight;

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
    setShopMenuOpen(false);
  }, [location.pathname, location.search]);

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

  // Luxury 6-item primary navigation structure
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop', hasMegaMenu: true },
    { name: 'Collections', href: '/collections' },
    { name: 'Candles', href: '/shop?category=candles' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'w-full transition-all duration-400 select-none pointer-events-auto z-40',
        isScrolled
          ? 'bg-black/85 backdrop-blur-2xl border-b border-white/10 py-3 sm:py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.85)]'
          : 'bg-transparent border-b border-transparent py-4 sm:py-6'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-[auto_1fr_auto] items-center gap-4 sm:gap-6 lg:gap-8">
        
        {/* COLUMN 1 (LEFT): BRAND LOGO & ELEGANT WORDMARK */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/"
            className="flex items-center group py-0.5 select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-luxury-gold gap-3 sm:gap-3.5 text-decoration-none shrink-0"
          >
            {logoUrl && !logoLoadError ? (
              <motion.div
                className="flex items-center justify-center shrink-0"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 350, damping: 24 }}
              >
                <img
                  src={logoUrl}
                  alt={settings.store_name || 'Philz Signature'}
                  onError={() => setLogoLoadError(true)}
                  className="brand-navbar-logo w-auto object-contain transition-all duration-300 drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)]"
                />
                <style>{`
                  .brand-navbar-logo {
                    height: ${mobileLogoHeight}px !important;
                    max-height: 80px !important;
                  }
                  @media (min-width: 640px) {
                    .brand-navbar-logo {
                      height: ${desktopLogoHeight}px !important;
                      max-height: 120px !important;
                    }
                  }
                `}</style>
              </motion.div>
            ) : null}

            {(appearance.show_business_name !== false || !logoUrl || logoLoadError) && (
              <div className="flex flex-col items-start select-none text-left leading-tight">
                <span className="font-serif text-base sm:text-lg lg:text-[18px] tracking-[0.22em] sm:tracking-[0.26em] text-white uppercase font-normal group-hover:text-luxury-gold transition-colors duration-200 whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
                  {settings.store_name || 'PHILZ SIGNATURE'}
                </span>
                <span className="hidden xl:block text-[7.5px] sm:text-[8.5px] tracking-[0.32em] text-luxury-gold font-medium uppercase mt-0.5 whitespace-nowrap drop-shadow-[0_1.5px_4px_rgba(0,0,0,0.9)] opacity-95">
                  {settings.store_slogan || 'HAUTE PARFUMERIE'}
                </span>
              </div>
            )}

            {/* Company registration number — standalone, independent of business name visibility */}
            {appearance.show_company_registration_number !== false && settings.company_registration_number && (
              <span className="text-[9px] tracking-[0.18em] text-white/60 font-medium uppercase whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] self-center">
                {settings.company_registration_number}
              </span>
            )}
          </Link>
        </div>

        {/* COLUMN 2 (CENTER): REFINED 5-ITEM DESKTOP NAVIGATION WITH SHOP MEGA MENU */}
        <nav
          className="hidden lg:flex items-center justify-center gap-6 xl:gap-8 2xl:gap-10 min-w-0"
          onMouseLeave={() => {
            setHoveredNav(null);
            setShopMenuOpen(false);
          }}
        >
          {navLinks.map((link) => {
            const isCandlesLink = link.href.includes('category=candles');
            const isActive = link.href === '/'
              ? location.pathname === '/'
              : isCandlesLink
                ? location.pathname === '/shop' && location.search.includes('category=candles')
                : link.href === '/shop'
                  ? location.pathname.startsWith('/shop') && !location.search.includes('category=candles')
                  : location.pathname.startsWith(link.href);

            if (link.hasMegaMenu) {
              return (
                <div
                  key={link.name}
                  className="relative"
                  onMouseEnter={() => {
                    setHoveredNav(link.name);
                    setShopMenuOpen(true);
                  }}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      'relative py-1 inline-flex items-center gap-1 text-[11.5px] xl:text-[12px] uppercase tracking-[0.22em] font-medium transition-colors duration-300 select-none shrink-0 whitespace-nowrap drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]',
                      isActive ? 'text-luxury-gold font-semibold drop-shadow-[0_0_8px_rgba(212,175,55,0.7)]' : 'text-white/80 hover:text-white'
                    )}
                  >
                    {hoveredNav === link.name && (
                      <motion.span
                        layoutId="navbar-hover-capsule"
                        className="absolute -inset-x-2.5 -inset-y-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      />
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="navbar-active-dot"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 bg-luxury-gold rounded-full shadow-[0_0_8px_rgba(197,168,128,0.95)]"
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                      />
                    )}
                    <span>{link.name}</span>
                    <ChevronDown className={cn('h-3 w-3 transition-transform duration-200 opacity-70', shopMenuOpen && 'rotate-180 text-luxury-gold')} />
                  </Link>

                  {/* LUXURY SHOP MEGA MENU DROPDOWN */}
                  <AnimatePresence>
                    {shopMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        data-keep-black
                        data-keep-white
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[640px] bg-black/95 backdrop-blur-2xl border border-white/15 rounded-xl shadow-2xl p-6 z-50 pointer-events-auto"
                      >
                        <div className="grid grid-cols-3 gap-6 text-left">
                          
                          {/* COLUMN A: PRODUCT CATEGORIES */}
                          <div className="space-y-3">
                            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-semibold block border-b border-white/10 pb-2">
                              Product Categories
                            </span>
                            <div className="space-y-1.5">
                              <Link
                                to="/shop"
                                className="block px-2.5 py-1.5 rounded-sm text-xs text-white/90 hover:text-luxury-gold hover:bg-white/5 transition-all font-light"
                              >
                                All Creations
                              </Link>
                              <Link
                                to="/shop?category=perfume-body-oils"
                                className="block px-2.5 py-1.5 rounded-sm text-xs text-white/80 hover:text-luxury-gold hover:bg-white/5 transition-all font-light"
                              >
                                Perfume Body Oils
                              </Link>
                              <Link
                                to="/shop?category=candles"
                                className="flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs text-white/90 hover:text-luxury-gold hover:bg-white/5 transition-all font-light"
                              >
                                <span>Scented Candles</span>
                                <span className="text-[9px] uppercase tracking-wider text-black bg-luxury-gold font-semibold px-1.5 py-0.5 rounded-xs">Official</span>
                              </Link>
                              <Link
                                to="/shop?category=reed-diffusers"
                                className="block px-2.5 py-1.5 rounded-sm text-xs text-white/80 hover:text-luxury-gold hover:bg-white/5 transition-all font-light"
                              >
                                Reed Diffusers
                              </Link>
                              <Link
                                to="/shop?category=room-spray"
                                className="flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs text-white/90 hover:text-luxury-gold hover:bg-white/5 transition-all font-light"
                              >
                                <span>Room Sprays</span>
                                <span className="text-[9px] uppercase tracking-wider text-black bg-luxury-gold font-semibold px-1.5 py-0.5 rounded-xs">Official</span>
                              </Link>
                            </div>
                          </div>

                          {/* COLUMN B: BY OLFACTORY FAMILY */}
                          <div className="space-y-3">
                            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-semibold block border-b border-white/10 pb-2">
                              Scent Families
                            </span>
                            <div className="space-y-1.5">
                              <Link
                                to="/shop?family=Woody"
                                className="block px-2.5 py-1.5 rounded-sm text-xs text-white/80 hover:text-luxury-gold hover:bg-white/5 transition-all font-light"
                              >
                                Woody & Oud
                              </Link>
                              <Link
                                to="/shop?family=Floral"
                                className="block px-2.5 py-1.5 rounded-sm text-xs text-white/80 hover:text-luxury-gold hover:bg-white/5 transition-all font-light"
                              >
                                Floral Collection
                              </Link>
                              <Link
                                to="/shop?family=Vanilla"
                                className="block px-2.5 py-1.5 rounded-sm text-xs text-white/80 hover:text-luxury-gold hover:bg-white/5 transition-all font-light"
                              >
                                Vanilla & Gourmand
                              </Link>
                              <Link
                                to="/shop?family=Fresh"
                                className="block px-2.5 py-1.5 rounded-sm text-xs text-white/80 hover:text-luxury-gold hover:bg-white/5 transition-all font-light"
                              >
                                Fresh & Citrus
                              </Link>
                              <Link
                                to="/shop?family=Spicy"
                                className="block px-2.5 py-1.5 rounded-sm text-xs text-white/80 hover:text-luxury-gold hover:bg-white/5 transition-all font-light"
                              >
                                Bold & Spicy
                              </Link>
                            </div>
                          </div>

                          {/* COLUMN C: FEATURED SPOTLIGHT */}
                          <div className="space-y-3 bg-white/5 p-3.5 rounded-lg border border-white/10 flex flex-col justify-between">
                            <div>
                              <span className="text-[9px] uppercase tracking-luxury-wide text-luxury-gold font-medium block">
                                ✦ Spotlight Creation
                              </span>
                              <h4 className="font-serif text-sm text-white font-medium mt-1">
                                Oud Maracuja
                              </h4>
                              <p className="text-[11px] text-white/60 font-light mt-0.5 line-clamp-2">
                                Exotic passionfruit infused with smoked agarwood.
                              </p>
                              <span className="text-xs text-luxury-gold font-mono block mt-2">
                                From ₦15,000
                              </span>
                            </div>
                            <Link
                              to="/product/oud-maracuja"
                              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-white hover:text-luxury-gold font-medium pt-2 border-t border-white/10"
                            >
                              <span>Explore Scent</span>
                              <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                to={link.href}
                onMouseEnter={() => {
                  setHoveredNav(link.name);
                  setShopMenuOpen(false);
                }}
                className={cn(
                  'relative py-1 text-[11.5px] xl:text-[12px] uppercase tracking-[0.22em] font-medium transition-colors duration-300 select-none shrink-0 whitespace-nowrap drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]',
                  isActive ? 'text-luxury-gold font-semibold drop-shadow-[0_0_8px_rgba(212,175,55,0.7)]' : 'text-white/80 hover:text-white'
                )}
              >
                {hoveredNav === link.name && (
                  <motion.span
                    layoutId="navbar-hover-capsule"
                    className="absolute -inset-x-2.5 -inset-y-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md -z-10"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}
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

        {/* COLUMN 3 (RIGHT): HEADER ACTIONS ORDER: Search -> Account -> Wishlist -> Cart */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 lg:gap-3.5 shrink-0">
          {/* ACTION 1: SEARCH */}
          <Link
            to="/shop"
            className="h-8.5 w-8.5 rounded-full flex items-center justify-center text-white/80 hover:text-luxury-gold hover:bg-white/10 border border-transparent hover:border-white/15 transition-all drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] shrink-0"
            title="Search Collection"
            aria-label="Search collection"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* ACTION 2: ACCOUNT */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="hidden sm:flex h-8.5 w-8.5 rounded-full items-center justify-center text-white/80 hover:text-luxury-gold hover:bg-white/10 border border-transparent hover:border-white/15 transition-all relative cursor-pointer shrink-0 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)]"
                  title="My Account"
                  aria-label="Customer account portal"
                >
                  <User className="h-4 w-4" />
                  <span className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-luxury-gold ring-1 ring-black" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                data-keep-black
                data-keep-white
                className="w-56 p-2 space-y-1 bg-black/95 backdrop-blur-2xl border border-white/15 shadow-2xl text-white"
              >
                <div className="px-2.5 py-2 border-b border-white/10 mb-1" data-keep-white>
                  <p className="text-xs font-serif font-medium text-white truncate" data-keep-white>
                    {profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Privileged Patron'}
                  </p>
                  <p className="text-[10px] text-white/60 truncate font-mono mt-0.5" data-keep-white>{user.email}</p>
                </div>
                <DropdownMenuItem asChild data-keep-white>
                  <Link to="/account" className="flex items-center gap-2.5 w-full text-xs text-white/90 hover:text-white" data-keep-white>
                    <User className="h-3.5 w-3.5 text-luxury-gold" />
                    <span data-keep-white>My Account</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild data-keep-white>
                  <Link to="/account/orders" className="flex items-center gap-2.5 w-full text-xs text-white/90 hover:text-white" data-keep-white>
                    <ShoppingBag className="h-3.5 w-3.5 text-luxury-gold" />
                    <span data-keep-white>My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild data-keep-white>
                  <Link to="/wishlist" className="flex items-center gap-2.5 w-full text-xs text-white/90 hover:text-white" data-keep-white>
                    <Heart className="h-3.5 w-3.5 text-luxury-gold" />
                    <span data-keep-white>My Wishlist</span>
                  </Link>
                </DropdownMenuItem>
                {canAccessAdmin && (
                  <DropdownMenuItem asChild data-keep-white>
                    <Link to="/admin" className="flex items-center gap-2.5 w-full text-xs text-luxury-gold font-medium" data-keep-white>
                      <Shield className="h-3.5 w-3.5" />
                      <span>Admin Portal</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 cursor-pointer"
                  data-keep-white
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex h-8.5 w-8.5 rounded-full items-center justify-center text-white/80 hover:text-luxury-gold hover:bg-white/10 border border-transparent hover:border-white/15 transition-all drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] shrink-0"
              title="Account / Sign In"
              aria-label="Sign in to your account"
            >
              <User className="h-4 w-4" />
            </Link>
          )}

          {/* ACTION 3: WISHLIST */}
          <Link
            to="/wishlist"
            className="hidden sm:flex h-8.5 w-8.5 rounded-full items-center justify-center text-white/80 hover:text-luxury-gold hover:bg-white/10 border border-transparent hover:border-white/15 transition-all relative drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] shrink-0"
            title="My Wishlist"
            aria-label="View saved perfumes"
          >
            <Heart className="h-4 w-4" />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-luxury-gold text-black text-[8px] font-bold flex items-center justify-center shadow-xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* ACTION 4: CART */}
          <Link
            to="/cart"
            data-keep-white
            className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-luxury-gold hover:text-black border border-white/20 hover:border-luxury-gold transition-all text-xs font-medium text-white flex items-center gap-2 shadow-lg backdrop-blur-md shrink-0 group"
            title="Shopping Cart"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] uppercase tracking-wider font-semibold" data-keep-white>Cart</span>
            <span className="font-mono text-xs font-semibold" data-keep-white>({cartCount})</span>
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden h-8.5 w-8.5 flex items-center justify-center text-white hover:text-luxury-gold transition-colors cursor-pointer rounded-full hover:bg-white/10 shrink-0 drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.9)] ml-0.5"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            data-keep-black
            data-keep-white
            className="lg:hidden mt-2 mx-4 bg-black/98 backdrop-blur-2xl border border-luxury-gold/30 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
          >
            <div className="p-6 space-y-6">
              
              {/* Primary Nav Links */}
              <div className="space-y-3">
                <Link
                  to="/"
                  className={cn(
                    'flex items-center justify-between py-2.5 text-sm uppercase tracking-luxury font-medium border-b border-white/10 transition-colors',
                    location.pathname === '/' ? 'text-luxury-gold font-semibold' : 'text-white/80 hover:text-white'
                  )}
                >
                  <span>Home</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </Link>

                <Link
                  to="/shop"
                  className={cn(
                    'flex items-center justify-between py-2.5 text-sm uppercase tracking-luxury font-medium border-b border-white/10 transition-colors',
                    location.pathname.startsWith('/shop') && !location.search.includes('category=candles') ? 'text-luxury-gold font-semibold' : 'text-white/80 hover:text-white'
                  )}
                >
                  <span>Shop</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </Link>

                <Link
                  to="/collections"
                  className={cn(
                    'flex items-center justify-between py-2.5 text-sm uppercase tracking-luxury font-medium border-b border-white/10 transition-colors',
                    location.pathname.startsWith('/collections') ? 'text-luxury-gold font-semibold' : 'text-white/80 hover:text-white'
                  )}
                >
                  <span>Collections</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </Link>

                <Link
                  to="/shop?category=candles"
                  className={cn(
                    'flex items-center justify-between py-2.5 text-sm uppercase tracking-luxury font-medium border-b border-white/10 transition-colors',
                    location.pathname === '/shop' && location.search.includes('category=candles') ? 'text-luxury-gold font-semibold' : 'text-white/80 hover:text-white'
                  )}
                >
                  <span>Candles</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </Link>

                <Link
                  to="/shop?category=room-spray"
                  className={cn(
                    'flex items-center justify-between py-2.5 text-sm uppercase tracking-luxury font-medium border-b border-white/10 transition-colors',
                    location.pathname === '/shop' && (location.search.includes('category=room-spray') || location.search.includes('category=room-sprays')) ? 'text-luxury-gold font-semibold' : 'text-white/80 hover:text-white'
                  )}
                >
                  <span>Room Sprays</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </Link>

                <Link
                  to="/about"
                  className={cn(
                    'flex items-center justify-between py-2.5 text-sm uppercase tracking-luxury font-medium border-b border-white/10 transition-colors',
                    location.pathname === '/about' ? 'text-luxury-gold font-semibold' : 'text-white/80 hover:text-white'
                  )}
                >
                  <span>About</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </Link>

                <Link
                  to="/contact"
                  className={cn(
                    'flex items-center justify-between py-2.5 text-sm uppercase tracking-luxury font-medium border-b border-white/10 transition-colors',
                    location.pathname === '/contact' ? 'text-luxury-gold font-semibold' : 'text-white/80 hover:text-white'
                  )}
                >
                  <span>Contact</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </Link>
              </div>

              {/* Mobile Actions Grid */}
              <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
                <Link
                  to="/shop"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-white/5 border border-white/15 text-white hover:border-luxury-gold"
                >
                  <Search className="h-3.5 w-3.5 text-luxury-gold" />
                  <span>Search</span>
                </Link>

                <Link
                  to={user ? '/account' : '/login'}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-white/5 border border-white/15 text-white hover:border-luxury-gold"
                >
                  <User className="h-3.5 w-3.5 text-luxury-gold" />
                  <span>{user ? 'My Account' : 'Sign In'}</span>
                </Link>

                <Link
                  to="/wishlist"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-white/5 border border-white/15 text-white hover:border-luxury-gold"
                >
                  <Heart className="h-3.5 w-3.5 text-luxury-gold" />
                  <span>Wishlist ({wishlistCount})</span>
                </Link>

                <Link
                  to="/cart"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-full bg-luxury-gold text-black font-semibold shadow-md"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Cart ({cartCount})</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
