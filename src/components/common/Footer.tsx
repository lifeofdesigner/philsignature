import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ShieldCheck, Truck, MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStoreAppearance } from '@/features/cms/hooks/useStoreAppearance';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { cmsService } from '@/services/CMSService';

export const Footer: React.FC = () => {
  const { appearance } = useStoreAppearance();
  const { settings } = useStoreSettings();
  const { data: footerCms } = useQuery({
    queryKey: ['footer-cms-config'],
    queryFn: () => cmsService.getFooterSection(),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });
  const [logoError, setLogoError] = useState(false);
  const logoUrl = appearance.logo_light_url || appearance.logo_url;

  const rawWhatsapp = settings.concierge_whatsapp || footerCms?.whatsapp || '+2348000000000';
  const cleanWhatsapp = rawWhatsapp.replace(/[^0-9]/g, '');
  const brandDescription =
    footerCms?.brand_description ||
    settings.footer_text ||
    'Luxury perfumes handcrafted with high-concentration fragrance oils for lasting elegance and bold confidence.';
  const copyrightText =
    settings.copyright_text ||
    `© ${new Date().getFullYear()} ${settings.store_name || 'PHILZ SIGNATURE'}. All rights reserved.`;

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
          <Link to="/" className="inline-block group">
            {logoUrl && !logoError ? (
              <img
                src={logoUrl}
                alt="Philz Signature Logo"
                onError={() => setLogoError(true)}
                className="h-10 sm:h-12 w-auto max-w-[200px] object-contain group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <span className="font-serif text-2xl tracking-[0.2em] text-luxury-cream uppercase font-normal group-hover:text-luxury-gold transition-colors">
                {settings.store_name || 'PHILZ SIGNATURE'}
              </span>
            )}
          </Link>
          <p className="text-xs text-luxury-muted leading-relaxed max-w-sm font-light">
            {brandDescription}
          </p>
          <div className="pt-2">
            <a
              href={`https://wa.me/${cleanWhatsapp || '2348000000000'}`}
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
          <p>{copyrightText}</p>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            <Link to="/policy/privacy_policy" className="hover:text-luxury-gold transition-colors">
              Privacy Policy
            </Link>
            <Link to="/policy/terms" className="hover:text-luxury-gold transition-colors">
              Terms of Service
            </Link>
            <Link to="/policy/shipping_policy" className="hover:text-luxury-gold transition-colors">
              Shipping Policy
            </Link>
            <Link to="/policy/returns_policy" className="hover:text-luxury-gold transition-colors">
              Returns Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

