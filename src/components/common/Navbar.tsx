import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ArrowRight, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const { count: wishlistCount } = useWishlist();
  const { totalCount: cartCount } = useCart();

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

  const navLinks = [
    { name: 'Collections', href: '/collections' },
    { name: 'All Perfumes', href: '/shop?family=all' },
    { name: 'Woody & Oud', href: '/shop?family=Woody' },
    { name: 'Oriental & Amber', href: '/shop?family=Oriental' },
    { name: 'About Us', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-luxury-black/95 backdrop-blur-md border-b border-luxury-border/60 transition-colors">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between">
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

        {/* Center: Luxury Logo */}
        <Link
          to="/"
          className="flex flex-col items-center justify-center group py-1 select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-luxury-gold px-2"
        >
          <span className="font-serif text-base sm:text-2xl lg:text-3xl tracking-[0.16em] sm:tracking-[0.24em] text-luxury-cream uppercase font-normal group-hover:text-luxury-gold transition-colors whitespace-nowrap">
            PHILZ SIGNATURE
          </span>
          <span className="text-[7px] sm:text-[8px] lg:text-[8.5px] tracking-[0.28em] text-luxury-gold font-medium uppercase mt-0.5">
            HAUTE PARFUMERIE
          </span>
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

          {/* Account Icon (Desktop only, mobile accesses via bottom nav) */}
          <Link
            to="/account"
            className="hidden sm:flex h-11 w-11 items-center justify-center text-luxury-cream/80 hover:text-luxury-gold transition-colors"
            title="My Account"
            aria-label="Customer account portal"
          >
            <User className="h-4 w-4" />
          </Link>

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
