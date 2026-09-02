import React from 'react';
import { ArrowLeft, ArrowRight, Truck, Sparkles } from 'lucide-react';
import type { ShippingMethod } from '@/types/database';

interface ShippingStepProps {
  shippingMethods: ShippingMethod[];
  isLoading: boolean;
  selectedMethodId: string;
  onSelectMethod: (id: string) => void;
  subtotal: number;
  onBack: () => void;
  onProceed: () => void;
}

export const ShippingStep: React.FC<ShippingStepProps> = ({
  shippingMethods,
  isLoading,
  selectedMethodId,
  onSelectMethod,
  subtotal,
  onBack,
  onProceed,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h3 className="font-serif text-lg text-luxury-cream font-normal mb-1">
          Choose Delivery Option
        </h3>
        <p className="text-xs text-luxury-muted">
          All orders are carefully packed in protective luxury boxes so your perfumes arrive safely.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-luxury-card border border-luxury-border animate-pulse rounded-sm" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {shippingMethods.map((method) => {
            const isSelected = selectedMethodId === method.id;
            const isFree = method.free_threshold && subtotal >= method.free_threshold;
            const effectivePrice = isFree ? 0 : method.price;

            return (
              <label
                key={method.id}
                onClick={() => onSelectMethod(method.id)}
                className={`flex items-start justify-between p-5 border cursor-pointer transition-all duration-200 rounded-sm shadow-xs ${
                  isSelected
                    ? 'border-luxury-gold bg-luxury-gold/5 shadow-md shadow-luxury-gold/5'
                    : 'border-luxury-border bg-luxury-card hover:border-luxury-gold/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="shipping_method"
                    checked={isSelected}
                    onChange={() => onSelectMethod(method.id)}
                    className="mt-1 text-luxury-gold focus:ring-luxury-gold h-4 w-4 border-luxury-border bg-luxury-card cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-luxury-cream">{method.name}</span>
                      {isFree && (
                        <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-luxury-gold bg-luxury-gold/10 px-2 py-0.5 border border-luxury-gold/30 rounded-sm">
                          <Sparkles className="h-2.5 w-2.5" />
                          FREE Delivery
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-luxury-muted mt-1 leading-relaxed">{method.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-luxury-gold font-medium">
                      <Truck className="h-3 w-3" />
                      <span>Estimated delivery: {method.estimated_days}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right whitespace-nowrap pl-4">
                  <span className="text-sm font-serif font-medium text-luxury-cream">
                    {effectivePrice === 0 ? 'FREE' : formatCurrency(effectivePrice)}
                  </span>
                  {isFree && (
                    <span className="block text-[10px] text-luxury-muted line-through">
                      {formatCurrency(method.price)}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}

      <div className="pt-4 flex items-center justify-between border-t border-luxury-border">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] inline-flex items-center gap-2 px-6 py-3 border border-luxury-border hover:border-luxury-gold text-luxury-muted hover:text-luxury-cream text-xs uppercase tracking-luxury-wide rounded-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Address</span>
        </button>

        <button
          type="button"
          disabled={!selectedMethodId}
          onClick={onProceed}
          className="min-h-[44px] inline-flex items-center gap-2 px-8 py-3.5 bg-luxury-gold text-black hover:bg-luxury-gold-light text-xs font-semibold uppercase tracking-luxury-wide rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Continue to Payment</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

