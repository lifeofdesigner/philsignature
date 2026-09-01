import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Collections', href: '/collections' },
    { name: 'Extraits de Parfum', href: '/shop?category=extrait' },
    { name: 'Private Reserve', href: '/shop?collection=private-reserve' },
    { name: 'Home Scents', href: '/shop?category=home-fragrance' },
    { name: 'Brand Story', href: '/about' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-luxury-black/90 backdrop-blur-md border-b border-luxury-border/60 transition-all">
      <div className="container mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-luxury-cream hover:text-luxury-gold transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Left Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center space-x-7">
          {navLinks.slice(0, 3).map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                'text-xs uppercase tracking-luxury font-medium transition-colors hover:text-luxury-gold',
                location.pathname === link.href
                  ? 'text-luxury-gold'
                  : 'text-luxury-cream/80'
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Central Luxury Logo */}
        <Link to="/" className="flex flex-col items-center justify-center group">
          <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] text-white uppercase font-normal group-hover:text-luxury-gold transition-colors">
            PHILZ SIGNATURE
          </span>
          <span className="text-[8px] uppercase tracking-luxury-wide text-luxury-gold font-medium mt-0.5">
            HAUTE PARFUMERIE
          </span>
        </Link>

        {/* Right Navigation Links & Action Icons */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <nav className="hidden lg:flex items-center space-x-7 mr-4">
            {navLinks.slice(3).map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  'text-xs uppercase tracking-luxury font-medium transition-colors hover:text-luxury-gold',
                  location.pathname === link.href
                    ? 'text-luxury-gold'
                    : 'text-luxury-cream/80'
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Search Icon */}
          <Link
            to="/shop"
            className="p-1.5 text-luxury-cream/80 hover:text-luxury-gold transition-colors"
            title="Search Catalog"
          >
            <Search className="h-4 w-4" />
          </Link>

          {/* Wishlist Icon */}
          <Link
            to="/wishlist"
            className="p-1.5 text-luxury-cream/80 hover:text-luxury-gold transition-colors relative"
            title="Wishlist"
          >
            <Heart className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-luxury-gold text-luxury-black text-[9px] font-bold flex items-center justify-center">
              0
            </span>
          </Link>

          {/* Account Icon */}
          <Link
            to="/account"
            className="p-1.5 text-luxury-cream/80 hover:text-luxury-gold transition-colors"
            title="My Account"
          >
            <User className="h-4 w-4" />
          </Link>

          {/* Cart Icon */}
          <Link
            to="/cart"
            className="p-1.5 text-luxury-cream/80 hover:text-luxury-gold transition-colors relative"
            title="Shopping Bag"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-luxury-gold text-luxury-black text-[9px] font-bold flex items-center justify-center">
              0
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-luxury-black border-b border-luxury-border px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs uppercase tracking-luxury text-luxury-cream hover:text-luxury-gold py-2 border-b border-luxury-border/40"
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-2 flex flex-col space-y-2">
            <Link to="/track-order" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" size="sm" className="w-full">
                Track Order
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

