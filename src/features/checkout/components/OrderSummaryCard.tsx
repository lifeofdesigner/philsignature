import React from 'react';
import { Tag, X, Loader2, Sparkles } from 'lucide-react';
import type { CartItem } from '@/features/cart/hooks/useCart';

interface OrderSummaryCardProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string;
  setCouponCode: (code: string) => void;
  appliedCoupon: { code: string; discount: number; message: string } | null;
  couponError: string | null;
  isApplyingCoupon: boolean;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
}

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  items,
  subtotal,
  shippingCost,
  discountAmount,
  totalAmount,
  couponCode,
  setCouponCode,
  appliedCoupon,
  couponError,
  isApplyingCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-luxury-card border border-luxury-border p-6 rounded-sm shadow-xs sticky top-28 space-y-6">
      <div className="flex items-center justify-between border-b border-luxury-border pb-4">
        <h3 className="font-serif text-base text-luxury-cream font-normal">
          Order Summary
        </h3>
        <span className="text-[11px] text-luxury-gold uppercase tracking-wider font-semibold">
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {/* Cart Items List */}
      <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
        {items.map((item) => {
          const isCandle =
            item.product.category?.slug === 'candles' ||
            item.product.category_id === 'c3333333-3333-3333-3333-333333333333' ||
            item.product.concentration?.toLowerCase().includes('candle') ||
            Boolean(item.product.weight_grams);

          const imgUrl =
            item.product.images?.find((img) => img.is_primary)?.image_url ||
            item.product.images?.[0]?.image_url ||
            (isCandle ? '/candles/vanilla-treat.jpg' : '/products/philz-signature-official-bottle.jpg');
          const sizeLabel = (item as any).size || (item as any).variant?.size || (isCandle ? '300g Vessel' : '30ml');

          return (
            <div key={item.id} className="flex items-center gap-3 text-xs">
              <div className="relative w-12 h-14 bg-luxury-charcoal border border-luxury-border shrink-0 overflow-hidden rounded-sm">
                <img
                  src={imgUrl}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute -top-1 -right-1 bg-luxury-gold text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-luxury-cream truncate font-normal">{item.product.name}</h4>
                <p className="text-[10px] text-luxury-muted">{sizeLabel} • Qty {item.quantity}</p>
              </div>
              <div className="text-right">
                <span className="text-luxury-cream font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Discount Code Input */}
      <div className="border-t border-luxury-border pt-4">
        <label className="block text-[11px] uppercase tracking-wider text-luxury-sand dark:text-luxury-cream/80 font-semibold mb-1.5">
          Discount Code
        </label>
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-2.5 bg-luxury-gold/10 border border-luxury-gold/30 rounded-sm text-xs">
            <div className="flex items-center gap-2 text-luxury-gold">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-mono font-medium">{appliedCoupon.code}</span>
              <span className="text-[11px] text-luxury-muted">(-{formatCurrency(appliedCoupon.discount)})</span>
            </div>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="text-luxury-muted hover:text-luxury-cream transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-luxury-muted" />
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && onApplyCoupon()}
                  placeholder="e.g. SIGNATURE10"
                  className="w-full min-h-[40px] bg-luxury-card border border-luxury-border pl-8 pr-3 py-2 text-xs text-luxury-cream placeholder:text-luxury-muted uppercase tracking-wider focus:outline-none focus:border-luxury-gold rounded-sm transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={onApplyCoupon}
                disabled={isApplyingCoupon || !couponCode.trim()}
                className="min-h-[40px] px-4 py-2 bg-luxury-gold hover:bg-luxury-gold-light text-black font-semibold text-xs uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer rounded-sm shadow-xs"
              >
                {isApplyingCoupon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Apply'}
              </button>
            </div>
            {couponError && (
              <p className="text-[11px] text-red-500 dark:text-red-400 mt-1">{couponError}</p>
            )}
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-luxury-border pt-4 space-y-2.5 text-xs">
        <div className="flex justify-between text-luxury-muted">
          <span>Subtotal</span>
          <span className="text-luxury-cream font-medium">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-luxury-muted">
          <span>Delivery Fee</span>
          <span className="text-luxury-cream font-medium">
            {shippingCost === 0 ? (
              <span className="text-luxury-gold">FREE</span>
            ) : (
              formatCurrency(shippingCost)
            )}
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between text-luxury-gold">
            <span>Discount</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}

        <div className="border-t border-luxury-border pt-3 flex justify-between items-baseline">
          <span className="font-serif text-sm text-luxury-cream">Total Amount</span>
          <span className="font-serif text-lg text-luxury-gold font-normal">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};
