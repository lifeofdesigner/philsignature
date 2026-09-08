import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Check, Plus, Minus, ShieldCheck, Truck, Zap, Sparkles, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import type { Product, ProductVariant } from '@/types/database';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

export interface ProductPurchaseCardProps {
  product: Product;
}

const DEFAULT_FALLBACK_VARIANTS = [
  { id: 'v15', size_ml: 15, name: '15ml', price: 15000, sale_price: null, is_default: false, stock_quantity: 100 },
  { id: 'v30', size_ml: 30, name: '30ml', price: 30000, sale_price: null, is_default: true, stock_quantity: 100 },
  { id: 'v50', size_ml: 50, name: '50ml', price: 40000, sale_price: null, is_default: false, stock_quantity: 100 },
  { id: 'v100', size_ml: 100, name: '100ml', price: 75000, sale_price: null, is_default: false, stock_quantity: 100 },
];

export const ProductPurchaseCard: React.FC<ProductPurchaseCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();

  // Determine available variants
  const variants = useMemo(() => {
    if (product.variants && product.variants.length > 0) {
      return [...product.variants].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }
    return DEFAULT_FALLBACK_VARIANTS as unknown as ProductVariant[];
  }, [product.variants]);

  // Default to 30ml variant
  const defaultVariant = useMemo(() => {
    return (
      variants.find((v) => v.is_default) ||
      variants.find((v) => v.size_ml === 30 || v.name === '30ml') ||
      variants[0]
    );
  }, [variants]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(defaultVariant);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  // Keep selected variant synchronized if product changes
  React.useEffect(() => {
    setSelectedVariant(defaultVariant);
  }, [defaultVariant]);

  const inWishlist = isInWishlist(product.id);

  const currentPrice = selectedVariant
    ? (selectedVariant.sale_price !== null && selectedVariant.sale_price !== undefined
        ? selectedVariant.sale_price
        : selectedVariant.price)
    : (product.sale_price !== null && product.sale_price !== undefined
        ? product.sale_price
        : product.price);

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(currentPrice);

  const formattedOriginalPrice = selectedVariant?.sale_price
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(selectedVariant.price)
    : product.sale_price
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(product.price)
    : null;

  const handleAddToBag = () => {
    addItem(product, quantity, {
      id: selectedVariant.id,
      name: selectedVariant.name || `${selectedVariant.size_ml}ml`,
      price: currentPrice,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, {
      id: selectedVariant.id,
      name: selectedVariant.name || `${selectedVariant.size_ml}ml`,
      price: currentPrice,
    });
    navigate(ROUTES.CHECKOUT);
  };

  const isOutOfStock = product.stock_quantity <= 0 || (selectedVariant && selectedVariant.stock_quantity <= 0);

  return (
    <div className="space-y-6">
      {/* Brand & Title */}
      <div className="space-y-2 border-b border-luxury-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            {product.brand || 'Philz Signature'}
          </span>
          {product.fragrance_family && (
            <span className="text-[10px] uppercase tracking-luxury text-luxury-muted">
              • {product.fragrance_family}
            </span>
          )}
          {product.best_for && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-luxury text-luxury-sand/80 px-2 py-0.5 rounded bg-luxury-card border border-luxury-border/80">
              <UserCheck className="h-2.5 w-2.5 text-luxury-gold" />
              {product.best_for}
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
      <div className="flex flex-wrap items-center gap-2.5 text-xs">
        <span className="px-3 py-1 bg-luxury-card border border-luxury-border text-luxury-cream uppercase tracking-wider text-[10px] font-medium">
          {product.concentration || 'Perfume Body Oil'}
        </span>
        <span className="px-3 py-1 bg-luxury-card border border-luxury-border text-luxury-sand text-[10px] font-mono">
          {selectedVariant?.name || `${product.volume_ml || 30}ml`}
        </span>
        <span className="text-[10px] text-emerald-500 dark:text-emerald-400 flex items-center gap-1 font-mono">
          <ShieldCheck className="h-3 w-3" /> Handcrafted
        </span>
        {product.scent_profile && (
          <span className="text-[10px] text-luxury-sand flex items-center gap-1 font-sans">
            <Sparkles className="h-3 w-3 text-luxury-gold" /> {product.scent_profile}
          </span>
        )}
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
        <span className="text-xs text-luxury-muted font-light">
          (Inclusive of all taxes)
        </span>
      </div>

      {/* Size Variant Selector */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-luxury text-luxury-muted font-medium">
            Select Flacon Size
          </span>
          <span className="text-xs font-mono text-luxury-gold">
            {selectedVariant?.name || '30ml'}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {variants.map((v) => {
            const isSelected = selectedVariant?.id === v.id || selectedVariant?.name === v.name;
            const variantPrice = new Intl.NumberFormat('en-NG', {
              style: 'currency',
              currency: 'NGN',
              maximumFractionDigits: 0,
            }).format(v.price);

            return (
              <button
                key={v.id || v.name}
                type="button"
                onClick={() => setSelectedVariant(v)}
                className={`py-3 px-2 rounded-sm border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  isSelected
                    ? 'border-luxury-gold bg-luxury-gold/15 text-luxury-gold shadow-sm ring-1 ring-luxury-gold'
                    : 'border-luxury-border bg-luxury-card text-luxury-sand hover:border-luxury-gold/50 hover:text-luxury-cream'
                }`}
              >
                <span className="font-serif text-sm font-medium">{v.name}</span>
                <span className="text-[10px] font-mono opacity-80">{variantPrice}</span>
              </button>
            );
          })}
        </div>
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
              onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock_quantity || product.stock_quantity || 10, q + 1))}
              disabled={isOutOfStock || quantity >= (selectedVariant?.stock_quantity || product.stock_quantity)}
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

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={handleAddToBag}
            disabled={isOutOfStock}
            className="w-full gap-2 text-xs uppercase tracking-wider border-luxury-gold/80 text-luxury-gold hover:bg-luxury-gold/10"
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Added to Bag</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>Add to Bag</span>
              </>
            )}
          </Button>

          <Button
            variant="luxury"
            size="lg"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="w-full gap-2 text-xs uppercase tracking-wider"
          >
            <Zap className="h-4 w-4" />
            <span>Buy Now — {formattedPrice}</span>
          </Button>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="pt-4 border-t border-luxury-border/40 space-y-2 text-[11px] text-luxury-muted font-light">
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-luxury-gold shrink-0" />
          <span>Free express delivery on orders over ₦150,000 across Nigeria.</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-luxury-gold shrink-0" />
          <span>100% Authentic concentrated perfume oil with complimentary gift packaging.</span>
        </div>
      </div>
    </div>
  );
};

