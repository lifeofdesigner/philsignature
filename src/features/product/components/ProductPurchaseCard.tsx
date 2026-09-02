import React, { useState } from 'react';
import { ShoppingBag, Heart, Check, Plus, Minus, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/database';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

export interface ProductPurchaseCardProps {
  product: Product;
}

export const ProductPurchaseCard: React.FC<ProductPurchaseCardProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();

  const inWishlist = isInWishlist(product.id);

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

  const handleAddToBag = () => {
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div className="space-y-6">
      {/* Brand & Title */}
      <div className="space-y-2 border-b border-luxury-border/60 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            {product.brand}
          </span>
          {product.fragrance_family && (
            <span className="text-[10px] uppercase tracking-luxury text-luxury-muted">
              • {product.fragrance_family}
            </span>
          )}
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl text-luxury-cream font-normal tracking-tight">
          {product.name}
        </h1>
        {product.tagline && (
          <p className="text-sm text-luxury-sand font-light italic">
            &ldquo;{product.tagline}&rdquo;
          </p>
        )}
      </div>

      {/* Specifications & Badges */}
      <div className="flex items-center gap-3 text-xs">
        <span className="px-3 py-1 bg-luxury-card border border-luxury-border text-luxury-cream uppercase tracking-wider text-[10px] font-medium">
          {product.concentration || 'Perfume'}
        </span>
        <span className="px-3 py-1 bg-luxury-card border border-luxury-border text-luxury-sand text-[10px] font-mono">
          {product.volume_ml || 100}ml
        </span>
        <span className="text-[10px] text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-mono">
          <ShieldCheck className="h-3 w-3" /> Handcrafted
        </span>
      </div>

      {/* Pricing */}
      <div className="flex items-baseline gap-3">
        <span className="font-serif text-3xl sm:text-4xl text-luxury-gold font-normal">
          {formattedPrice}
        </span>
        {formattedOriginalPrice && (
          <span className="text-base text-luxury-muted line-through font-light">
            {formattedOriginalPrice}
          </span>
        )}
      </div>

      {/* Description Snippet */}
      <p className="text-xs sm:text-sm text-luxury-sand font-light leading-relaxed">
        {product.description}
      </p>

      {/* Quantity & Actions */}
      <div className="space-y-4 pt-4 border-t border-luxury-border/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-luxury-border bg-luxury-card rounded-sm">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || isOutOfStock}
              className="p-2.5 text-luxury-muted hover:text-luxury-cream disabled:opacity-30 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-4 text-xs font-mono text-luxury-cream select-none">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 10, q + 1))}
              disabled={isOutOfStock || quantity >= product.stock_quantity}
              className="p-2.5 text-luxury-muted hover:text-luxury-cream disabled:opacity-30 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            disabled={isToggling}
            className={`p-3 border transition-colors flex items-center gap-2 text-xs ${
              inWishlist
                ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                : 'border-luxury-border bg-luxury-card text-luxury-sand hover:text-luxury-gold hover:border-luxury-gold/60'
            }`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{inWishlist ? 'Saved' : 'Save to Wishlist'}</span>
          </button>
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="luxury"
          size="lg"
          onClick={handleAddToBag}
          disabled={isOutOfStock}
          className="w-full gap-2 text-xs sm:text-sm uppercase tracking-wider"
        >
          {justAdded ? (
            <>
              <Check className="h-4 w-4 text-black" />
              <span>Added to Cart</span>
            </>
          ) : isOutOfStock ? (
            <span>Out of Stock</span>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              <span>Add to Cart — {formattedPrice}</span>
            </>
          )}
        </Button>
      </div>

      {/* Delivery Info */}
      <div className="pt-4 border-t border-luxury-border/40 space-y-2 text-[11px] text-luxury-muted font-light">
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-luxury-gold shrink-0" />
          <span>Free delivery on orders over ₦150,000.</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-luxury-gold shrink-0" />
          <span>Comes with Certificate of Authenticity and a sample spray.</span>
        </div>
      </div>
    </div>
  );
};

