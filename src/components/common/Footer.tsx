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
              <h4 className="text-xs uppercase tracking-luxury font-medium text-luxury-cream">
                100% Original
              </h4>
              <p className="text-[11px] text-luxury-muted mt-0.5">
                Long-lasting fragrance oils
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 border border-luxury-gold/30 flex items-center justify-center shrink-0 text-luxury-gold">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-luxury-cream">
                Free Delivery
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
              <h4 className="text-xs uppercase tracking-luxury font-medium text-luxury-cream">
                Customer Support
              </h4>
              <p className="text-[11px] text-luxury-muted mt-0.5">
                Here to help you choose
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 border border-luxury-gold/30 flex items-center justify-center shrink-0 text-luxury-gold">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-luxury-cream">
                Gift Packaging
              </h4>
              <p className="text-[11px] text-luxury-muted mt-0.5">
                Beautiful presentation boxes
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
            <span className="font-serif text-2xl tracking-[0.2em] text-luxury-cream uppercase font-normal">
              PHILZ SIGNATURE
            </span>
          </Link>
          <p className="text-xs text-luxury-muted leading-relaxed max-w-sm font-light">
            Luxury perfumes handcrafted with high-concentration fragrance oils for lasting elegance and bold confidence.
          </p>
          <div className="pt-2">
            <a
              href="https://wa.me/2348000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs uppercase tracking-luxury text-luxury-gold hover:text-luxury-gold-light gap-2 font-medium"
            >
              <span>Chat with Us on WhatsApp</span>
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Collections Links */}
        <div>
          <h4 className="text-xs uppercase tracking-luxury font-medium text-luxury-cream mb-4">
            Shop
          </h4>
          <ul className="space-y-2.5 text-xs text-luxury-muted font-light">
            <li>
              <Link to="/shop" className="hover:text-luxury-gold transition-colors">
                All Perfumes
              </Link>
            </li>
            <li>
              <Link to="/collections" className="hover:text-luxury-gold transition-colors">
                Our Collections
              </Link>
            </li>
            <li>
              <Link to="/shop?family=Woody" className="hover:text-luxury-gold transition-colors">
                Woody & Oud
              </Link>
            </li>
            <li>
              <Link to="/shop?family=Oriental" className="hover:text-luxury-gold transition-colors">
                Oriental & Amber
              </Link>
            </li>
            <li>
              <Link to="/shop?family=Fresh" className="hover:text-luxury-gold transition-colors">
                Fresh & Citrus
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h4 className="text-xs uppercase tracking-luxury font-medium text-luxury-cream mb-4">
            About Philz
          </h4>
          <ul className="space-y-2.5 text-xs text-luxury-muted font-light">
            <li>
              <Link to="/about" className="hover:text-luxury-gold transition-colors">
                Our Story
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-luxury-gold transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover:text-luxury-gold transition-colors">
                Help & FAQs
              </Link>
            </li>
            <li>
              <Link to="/track-order" className="hover:text-luxury-gold transition-colors">
                Track Order
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div>
          <h4 className="text-xs uppercase tracking-luxury font-medium text-luxury-cream mb-4">
            Stay in Touch
          </h4>
          <p className="text-xs text-luxury-muted leading-relaxed font-light mb-4">
            Subscribe to receive updates on new perfumes, exclusive discounts, and special offers.
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
      <div className="border-t border-luxury-border/40 pt-6 pb-20 lg:pb-6">
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

