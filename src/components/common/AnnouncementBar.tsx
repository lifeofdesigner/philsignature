import React from 'react';
import { Sparkles } from 'lucide-react';

interface AnnouncementBarProps {
  message?: string;
  linkText?: string;
  href?: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  message = 'COMPLIMENTARY NATIONWIDE EXPRESS DELIVERY ON ORDERS OVER ₦150,000',
  linkText = 'EXPLORE EXTRAITS',
  href = '/shop',
}) => {
  return (
    <div className="bg-luxury-charcoal border-b border-luxury-border/60 py-2 px-4 text-center">
      <div className="container mx-auto flex items-center justify-center gap-2 text-[10px] uppercase tracking-luxury text-luxury-sand font-medium">
        <Sparkles className="h-3 w-3 text-luxury-gold shrink-0" />
        <span>{message}</span>
        {linkText && href && (
          <a
            href={href}
            className="text-luxury-gold underline underline-offset-4 hover:text-luxury-gold-light ml-1 font-semibold"
          >
            {linkText}
          </a>
        )}
      </div>
    </div>
  );
};

