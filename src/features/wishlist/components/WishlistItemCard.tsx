import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/database';

export interface WishlistItemCardProps {
  product: Product;
  onMoveToCart: (product: Product) => void;
  onRemove: (productId: string) => void;
}

export const WishlistItemCard: React.FC<WishlistItemCardProps> = ({
  product,
  onMoveToCart,
  onRemove,
}) => {
  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80';

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(product.sale_price !== null && product.sale_price !== undefined ? product.sale_price : product.price);

  return (
    <div className="flex flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-luxury-card border border-luxury-border hover:border-luxury-gold/50 transition-colors rounded-sm">
      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="relative aspect-[3/4] w-20 sm:w-28 shrink-0 overflow-hidden bg-luxury-card rounded-sm">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1.5 text-left">
        <span className="text-[9px] uppercase tracking-luxury text-luxury-muted block truncate">
          {product.concentration || 'Perfume'} • {product.volume_ml || 100}ml
        </span>
        <h3 className="font-serif text-base sm:text-xl text-luxury-cream font-normal hover:text-luxury-gold transition-colors truncate">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        {product.fragrance_family && (
          <span className="inline-block px-2 py-0.5 text-[8px] sm:text-[9px] uppercase tracking-wider bg-luxury-card border border-luxury-border text-luxury-sand rounded-sm">
            {product.fragrance_family} Family
          </span>
        )}
        <div className="font-serif text-base sm:text-lg text-luxury-gold pt-0.5">
          {formattedPrice}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 shrink-0">
        <Button
          variant="luxury"
          size="sm"
          onClick={() => onMoveToCart(product)}
          className="gap-1.5 text-xs px-3 py-1.5"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Move to Cart</span>
          <span className="sm:hidden">To Cart</span>
        </Button>

        <button
          type="button"
          onClick={() => onRemove(product.id)}
          className="p-1.5 text-luxury-muted hover:text-red-400 transition-colors"
          aria-label={`Remove ${product.name} from wishlist`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

