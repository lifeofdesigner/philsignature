import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Product } from '@/types/database';
import { useWishlist } from '@/hooks/useWishlist';
import { LUXURY_EASE } from '@/components/common/MotionWrapper';

export interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();

  const inWishlist = isInWishlist(product.id);
  const isCandle =
    product.category?.slug === 'candles' ||
    product.category_id === 'c3333333-3333-3333-3333-333333333333' ||
    product.concentration?.toLowerCase().includes('candle') ||
    Boolean(product.weight_grams);

  const primaryImage = product.images?.find((img) => img.is_primary)?.image_url || product.images?.[0]?.image_url;
  const hoverImage = product.images?.[1]?.image_url || primaryImage;

  const minPrice = product.variants && product.variants.length > 0
    ? Math.min(...product.variants.map((v) => v.price))
    : (product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.price);

  const hasMultiplePrices = product.variants && product.variants.length > 1;

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(minPrice);

  const formattedOriginalPrice = product.sale_price
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(product.price)
    : null;

  const productSubtitle = isCandle
    ? 'Natural Soy Candle • 300g (Up to 48h Burn Time)'
    : `${product.concentration || 'Perfume Body Oil'} • 4 Sizes (15ml - 100ml)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.6, ease: LUXURY_EASE }}
      whileHover={{ y: -4 }}
      data-testid="product-card"
      className="group relative bg-luxury-card border border-luxury-border hover:border-luxury-gold/50 transition-all duration-400 flex flex-col justify-between shadow-lg rounded-xs overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Flacon Imagery & Quick Badges */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-luxury-charcoal/50">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && hoverImage ? hoverImage : primaryImage || (isCandle ? '/candles/vanilla-treat.jpg' : '/products/philz-signature-official-bottle.jpg')}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
            loading={priority ? 'eager' : 'lazy'}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {product.is_bestseller && (
            <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-luxury-gold text-black font-semibold shadow-xs">
              Bestseller
            </span>
          )}
          {product.is_new_arrival && (
            <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-white text-black font-semibold shadow-xs">
              New
            </span>
          )}
          {product.fragrance_family && (
            <span className="px-2 py-0.5 text-[9px] uppercase tracking-wider bg-black/70 border border-luxury-border text-luxury-sand backdrop-blur-sm">
              {product.fragrance_family}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          disabled={isToggling}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full border transition-all z-20 backdrop-blur-md cursor-pointer ${
            inWishlist
              ? 'bg-luxury-gold text-black border-luxury-gold'
              : 'bg-black/60 text-luxury-sand border-luxury-border hover:text-luxury-gold hover:border-luxury-gold/60'
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Flacon Details */}
      <div className="p-3.5 sm:p-5 flex flex-col justify-between flex-grow space-y-2 sm:space-y-3">
        <div className="space-y-1">
          <span className="text-[8px] sm:text-[9px] uppercase tracking-luxury text-luxury-muted block truncate">
            {productSubtitle}
          </span>
          <h3 className="font-serif text-sm sm:text-base lg:text-lg text-white font-normal group-hover:text-luxury-gold transition-colors line-clamp-1">
            <Link to={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          {product.tagline && (
            <p className="text-[11px] sm:text-xs text-luxury-muted font-light line-clamp-1">
              {product.tagline}
            </p>
          )}
        </div>

        {/* Pricing & Link */}
        <div className="pt-2 border-t border-luxury-border/50 flex items-center justify-between gap-1">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
            <span className="font-serif text-sm sm:text-base text-luxury-gold font-normal">
              {hasMultiplePrices && (
                <span className="text-[10px] text-luxury-muted font-sans uppercase mr-1">From</span>
              )}
              {formattedPrice}
            </span>
            {formattedOriginalPrice && (
              <span className="text-[10px] sm:text-xs text-luxury-muted line-through">
                {formattedOriginalPrice}
              </span>
            )}
          </div>
          <Link
            to={`/product/${product.slug}`}
            className="text-[9px] sm:text-[10px] uppercase tracking-wider text-luxury-sand hover:text-luxury-gold transition-colors font-medium underline underline-offset-4 shrink-0"
          >
            Discover
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
