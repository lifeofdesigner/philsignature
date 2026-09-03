import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product } from '@/types/database';
import { useWishlist } from '@/hooks/useWishlist';

export interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();

  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images?.find((img) => img.is_primary)?.image_url || product.images?.[0]?.image_url;
  const hoverImage = product.images?.[1]?.image_url || primaryImage;

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.price);

  const formattedOriginalPrice = product.sale_price
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(product.price)
    : null;

  return (
    <div
      className="group relative bg-neutral-950/80 border border-white/10 hover:border-luxury-gold/50 rounded-xs shadow-xl transition-all duration-500 flex flex-col justify-between overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Flacon Imagery & Quick Badges */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900/60">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <img
            src={isHovered && hoverImage ? hoverImage : primaryImage || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
            loading={priority ? 'eager' : 'lazy'}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.is_bestseller && (
            <span className="px-2.5 py-1 text-[9px] uppercase tracking-wider bg-luxury-gold text-black font-semibold rounded-xs shadow-xs">
              Bestseller
            </span>
          )}
          {product.is_new_arrival && (
            <span className="px-2.5 py-1 text-[9px] uppercase tracking-wider bg-white text-black font-semibold rounded-xs shadow-xs">
              New Arrival
            </span>
          )}
          {product.fragrance_family && (
            <span className="px-2.5 py-1 text-[9px] uppercase tracking-wider bg-black/80 border border-white/20 text-white/90 backdrop-blur-sm rounded-xs">
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
          className={`absolute top-3 right-3 h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full border transition-all z-20 backdrop-blur-md cursor-pointer ${
            inWishlist
              ? 'bg-luxury-gold text-black border-luxury-gold shadow-sm'
              : 'bg-black/60 text-white/80 border-white/20 hover:text-luxury-gold hover:border-luxury-gold/60'
          }`}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Flacon Details */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow space-y-3">
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-luxury-wide text-white/50 block truncate font-mono">
            {product.concentration || 'Extrait de Parfum'} • {product.volume_ml || 100}ml
          </span>
          <h3 className="font-serif text-base sm:text-lg text-white font-normal group-hover:text-luxury-gold transition-colors line-clamp-1">
            <Link to={`/product/${product.slug}`}>{product.name}</Link>
          </h3>
          {product.tagline && (
            <p className="text-xs text-white/60 font-light line-clamp-1">
              {product.tagline}
            </p>
          )}
        </div>

        {/* Pricing & Link */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm sm:text-base text-luxury-gold font-medium">
              {formattedPrice}
            </span>
            {formattedOriginalPrice && (
              <span className="text-xs text-white/40 line-through font-mono">
                {formattedOriginalPrice}
              </span>
            )}
          </div>
          <Link
            to={`/product/${product.slug}`}
            className="text-[10px] uppercase tracking-wider text-white/80 hover:text-luxury-gold transition-colors font-semibold"
          >
            Discover →
          </Link>
        </div>
      </div>
    </div>
  );
};

