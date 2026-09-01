import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-luxury-black border-t border-luxury-border text-luxury-cream mt-auto">
      {/* Brand Value Pillars */}
      <div className="border-b border-luxury-border/60 py-10">
        <div className="container mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 border border-luxury-gold/30 flex items-center justify-center shrink-0 text-luxury-gold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-white">
                100% Authentic
              </h4>
              <p className="text-[11px] text-luxury-muted mt-0.5">
                Rare oils & pure extraits
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 border border-luxury-gold/30 flex items-center justify-center shrink-0 text-luxury-gold">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-white">
                Complimentary Shipping
              </h4>
              <p className="text-[11px] text-luxury-muted mt-0.5">
                On orders over ₦150,000
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 border border-luxury-gold/30 flex items-center justify-center shrink-0 text-luxury-gold">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-white">
                Olfactory Concierge
              </h4>
              <p className="text-[11px] text-luxury-muted mt-0.5">
                Bespoke fragrance guidance
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 border border-luxury-gold/30 flex items-center justify-center shrink-0 text-luxury-gold">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-white">
                Signature Packaging
              </h4>
              <p className="text-[11px] text-luxury-muted mt-0.5">
                Hand-wrapped luxury boxes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="container mx-auto px-4 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/" className="inline-block">
            <span className="font-serif text-2xl tracking-[0.2em] text-white uppercase font-normal">
              PHILZ SIGNATURE
            </span>
          </Link>
          <p className="text-xs text-luxury-muted leading-relaxed max-w-sm font-light">
            An artisanal fragrance sanctuary crafting transcendent extraits de parfum, opulent oud elixirs, and bespoke olfactory experiences.
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/2340000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs uppercase tracking-luxury text-luxury-gold hover:text-luxury-gold-light gap-2 font-medium"
            >
              <span>Connect with our Perfume Concierge</span>
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Collections Links */}
        <div>
          <h4 className="text-xs uppercase tracking-luxury font-medium text-white mb-4">
            Creations
          </h4>
          <ul className="space-y-2.5 text-xs text-luxury-muted font-light">
            <li>
              <Link to="/shop?category=extrait" className="hover:text-luxury-gold transition-colors">
                Extraits de Parfum
              </Link>
            </li>
            <li>
              <Link to="/shop?collection=private-reserve" className="hover:text-luxury-gold transition-colors">
                Private Reserve
              </Link>
            </li>
            <li>
              <Link to="/shop?category=home-fragrance" className="hover:text-luxury-gold transition-colors">
                Home Fragrance & Diffusers
              </Link>
            </li>
            <li>
              <Link to="/shop?collection=the-oud-edition" className="hover:text-luxury-gold transition-colors">
                The Oud Edition
              </Link>
            </li>
            <li>
              <Link to="/shop" className="hover:text-luxury-gold transition-colors">
                Discovery Sets
              </Link>
            </li>
          </ul>
        </div>

        {/* Boutique Links */}
        <div>
          <h4 className="text-xs uppercase tracking-luxury font-medium text-white mb-4">
            The Atelier
          </h4>
          <ul className="space-y-2.5 text-xs text-luxury-muted font-light">
            <li>
              <Link to="/about" className="hover:text-luxury-gold transition-colors">
                Brand Heritage
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-luxury-gold transition-colors">
                Boutique Locations
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-luxury-gold transition-colors">
                Fragrance Care & FAQ
              </Link>
            </li>
            <li>
              <Link to="/track-order" className="hover:text-luxury-gold transition-colors">
                Track Consignment
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div>
          <h4 className="text-xs uppercase tracking-luxury font-medium text-white mb-4">
            The Private Circle
          </h4>
          <p className="text-xs text-luxury-muted leading-relaxed font-light mb-4">
            Receive private release allocations and olfactory salon invitations.
          </p>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-luxury-charcoal text-xs h-10 border-luxury-border"
            />
            <Button variant="luxury" size="sm" className="w-full">
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-luxury-border/40 py-6">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-luxury-muted space-y-2 sm:space-y-0 font-light">
          <p>© {new Date().getFullYear()} PHILZ SIGNATURE. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/faq" className="hover:text-luxury-gold transition-colors">
              Privacy Policy
            </Link>
            <Link to="/faq" className="hover:text-luxury-gold transition-colors">
              Terms of Service
            </Link>
            <Link to="/faq" className="hover:text-luxury-gold transition-colors">
              Shipping & Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

