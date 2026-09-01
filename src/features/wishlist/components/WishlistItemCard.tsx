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
    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-luxury-card border border-luxury-border hover:border-luxury-gold/50 transition-colors">
      {/* Flacon Image */}
      <Link to={`/product/${product.slug}`} className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden bg-black">
        <img
          src={primaryImage}
          alt={product.name}
          className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <span className="text-[9px] uppercase tracking-luxury text-luxury-muted block">
          {product.concentration || 'Extrait de Parfum'} • {product.volume_ml || 100}ml
        </span>
        <h3 className="font-serif text-xl text-white font-normal hover:text-luxury-gold transition-colors">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        {product.fragrance_family && (
          <span className="inline-block px-2.5 py-0.5 text-[9px] uppercase tracking-wider bg-black border border-luxury-border text-luxury-sand">
            {product.fragrance_family} Family
          </span>
        )}
        <div className="font-serif text-lg text-luxury-gold pt-1">
          {formattedPrice}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Button
          variant="luxury"
          size="sm"
          onClick={() => onMoveToCart(product)}
          className="w-full sm:w-auto gap-2 text-xs"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          <span>Move to Bag</span>
        </Button>

        <button
          type="button"
          onClick={() => onRemove(product.id)}
          className="p-2 text-luxury-muted hover:text-red-400 transition-colors"
          aria-label={`Remove ${product.name} from wishlist`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

