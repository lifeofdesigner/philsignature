import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ShieldCheck, Truck, MessageSquare, Gift, Instagram, Sparkles } from 'lucide-react';
import { useStoreAppearance } from '@/features/cms/hooks/useStoreAppearance';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { cmsService, CMSService, type CmsFooterLink } from '@/services/CMSService';

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

  const footer = footerCms || CMSService.DEFAULT_FOOTER;

  const brandName = footer.brand_name || settings.store_name || 'PHILZ SIGNATURE';
  const tagline = footer.tagline || 'YOUR SCENT. YOUR SIGNATURE.';
  const brandDescription = footer.brand_description || 'Luxury fragrances and scent experiences crafted for those who want to leave a lasting impression.';
  const closingLine = footer.closing_line || 'PHILZ SIGNATURE — Signature by nature, crafted for you.';
  const copyrightText = footer.copyright_text || `© 2026 ${brandName}. ALL RIGHTS RESERVED.`;
  const whatsappUrl = footer.whatsapp || 'https://wa.me/message/OJXETPKJE7L4M1';
  const instagramUrl = footer.instagram || 'https://instagram.com/philztheperfumer';
  const instagramHandle = footer.instagram_handle || '@philztheperfumer';

  const shopLinks: CmsFooterLink[] = footer.shop_links && footer.shop_links.length > 0
    ? footer.shop_links
    : CMSService.DEFAULT_FOOTER.shop_links || [];

  const servicesLinks: CmsFooterLink[] = footer.services_links && footer.services_links.length > 0
    ? footer.services_links
    : CMSService.DEFAULT_FOOTER.services_links || [];

  const companyLinks: CmsFooterLink[] = footer.company_links && footer.company_links.length > 0
    ? footer.company_links
    : CMSService.DEFAULT_FOOTER.company_links || [];

  return (
    <footer className="bg-black border-t border-white/10 text-white mt-auto">
      {/* Brand Value Pillars */}
      <div className="border-b border-white/10 py-10">
        <div className="container mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 border border-luxury-gold/30 rounded-xs flex items-center justify-center shrink-0 text-luxury-gold bg-luxury-gold/5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-white">
                Authentic High-Concentration
              </h4>
              <p className="text-[11px] text-white/60 mt-0.5 font-light">
                Long-lasting perfume oils & extraits
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 border border-luxury-gold/30 rounded-xs flex items-center justify-center shrink-0 text-luxury-gold bg-luxury-gold/5">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-white">
                Nationwide Delivery
              </h4>
              <p className="text-[11px] text-white/60 mt-0.5 font-light">
                Express dispatch across Nigeria
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 border border-luxury-gold/30 rounded-xs flex items-center justify-center shrink-0 text-luxury-gold bg-luxury-gold/5">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-white">
                Private Label & Bespoke
              </h4>
              <p className="text-[11px] text-white/60 mt-0.5 font-light">
                Custom fragrance creation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 border border-luxury-gold/30 rounded-xs flex items-center justify-center shrink-0 text-luxury-gold bg-luxury-gold/5">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-luxury font-medium text-white">
                Corporate Gifting
              </h4>
              <p className="text-[11px] text-white/60 mt-0.5 font-light">
                Branded hampers & bespoke boxes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
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
              <span className="font-serif text-2xl tracking-[0.25em] text-white uppercase font-normal group-hover:text-luxury-gold transition-colors">
                {brandName}
              </span>
            )}
          </Link>
          
          <div className="text-[11px] uppercase tracking-[0.2em] text-luxury-gold font-medium">
            {tagline}
          </div>

          <p className="text-xs text-white/70 leading-relaxed max-w-sm font-light">
            {brandDescription}
          </p>

          <div className="pt-2 flex flex-col gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs uppercase tracking-wider text-luxury-gold hover:text-luxury-gold-light gap-2 font-medium"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Connect on WhatsApp</span>
              <ArrowRight className="h-3 w-3" />
            </a>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-white/70 hover:text-white gap-2 font-light"
            >
              <Instagram className="h-3.5 w-3.5 text-luxury-gold" />
              <span>Instagram: {instagramHandle}</span>
            </a>
          </div>
        </div>

        {/* SHOP LINKS Column */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white mb-4">
            Shop
          </h4>
          <ul className="space-y-2.5 text-xs text-white/70 font-light">
            {shopLinks.map((link, idx) => (
              <li key={idx}>
                <Link to={link.url} className="hover:text-luxury-gold transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* SERVICES Column */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white mb-4">
            Services
          </h4>
          <ul className="space-y-2.5 text-xs text-white/70 font-light">
            {servicesLinks.map((link, idx) => (
              <li key={idx}>
                <Link to={link.url} className="hover:text-luxury-gold transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* COMPANY Column */}
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-white mb-4">
            Company
          </h4>
          <ul className="space-y-2.5 text-xs text-white/70 font-light">
            {companyLinks.map((link, idx) => (
              <li key={idx}>
                <Link to={link.url} className="hover:text-luxury-gold transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Closing Line */}
      <div className="border-t border-white/10 py-6 text-center">
        <p className="font-serif text-xs sm:text-sm text-luxury-gold/90 tracking-wide font-light">
          {closingLine}
        </p>
      </div>

      {/* Bottom Copyright & Legal Links */}
      <div className="border-t border-white/10 pt-6 pb-20 lg:pb-6 bg-black/60">
        <div className="container mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/50 space-y-2 sm:space-y-0 font-light">
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
