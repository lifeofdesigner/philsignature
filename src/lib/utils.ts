import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'bg-color': [{ bg: ['luxury-black', 'luxury-charcoal', 'luxury-graphite', 'luxury-card', 'luxury-border', 'luxury-gold', 'luxury-gold-light', 'luxury-gold-dark', 'luxury-cream', 'luxury-cream-soft', 'luxury-cream-dim', 'luxury-sand', 'luxury-muted'] }],
      'text-color': [{ text: ['luxury-black', 'luxury-charcoal', 'luxury-graphite', 'luxury-card', 'luxury-border', 'luxury-gold', 'luxury-gold-light', 'luxury-gold-dark', 'luxury-cream', 'luxury-cream-soft', 'luxury-cream-dim', 'luxury-sand', 'luxury-muted'] }],
      'border-color': [{ border: ['luxury-black', 'luxury-charcoal', 'luxury-graphite', 'luxury-card', 'luxury-border', 'luxury-gold', 'luxury-gold-light', 'luxury-gold-dark', 'luxury-cream', 'luxury-cream-soft', 'luxury-cream-dim', 'luxury-sand', 'luxury-muted'] }],
      'ring-color': [{ ring: ['luxury-black', 'luxury-charcoal', 'luxury-graphite', 'luxury-card', 'luxury-border', 'luxury-gold', 'luxury-gold-light', 'luxury-gold-dark', 'luxury-cream', 'luxury-cream-soft', 'luxury-cream-dim', 'luxury-sand', 'luxury-muted'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  amount: number,
  currency: string = 'NGN',
  locale: string = 'en-NG'
): string {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString(locale, { minimumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

