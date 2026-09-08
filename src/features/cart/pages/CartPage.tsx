import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useCart } from '@/hooks/useCart';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  const formattedSubtotal = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(subtotal);

  return (
    <div className="min-h-screen bg-luxury-black text-luxury-cream py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-10">
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Your Selection
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-luxury-cream font-normal tracking-tight">
            Shopping Bag
          </h1>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-5 w-5" />}
            title="Your Cart is Empty"
            description="You have not added any perfumes to your cart yet. Browse our shop to get started."
            actionLabel="Shop Now"
            onAction={() => navigate(ROUTES.SHOP)}
          />
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-luxury-border pb-3 text-xs text-luxury-muted">
              <span>{items.length} {items.length === 1 ? 'Item' : 'Items'} in Cart</span>
              <button
                onClick={clearCart}
                className="text-luxury-muted hover:text-red-400 transition-colors"
              >
                Clear Entire Bag
              </button>
            </div>

            {/* Items List */}
            <div className="divide-y divide-luxury-border/60">
              {items.map((item) => {
                const itemFormattedPrice = new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: 'NGN',
                  maximumFractionDigits: 0,
                }).format(item.price * item.quantity);

                const primaryImage =
                  item.product.images?.find((img) => img.is_primary)?.image_url ||
                  item.product.images?.[0]?.image_url ||
                  '/products/philz-signature-official-bottle.jpg';

                return (
                  <div
                    key={item.id}
                    className="py-5 flex items-center gap-4 sm:gap-6 border-b border-luxury-border/60 last:border-0"
                  >
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="relative aspect-[3/4] w-20 sm:w-24 shrink-0 overflow-hidden bg-luxury-charcoal rounded-sm"
                    >
                      <img
                        src={primaryImage}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 space-y-1 text-left">
                      <span className="text-[9px] uppercase tracking-luxury text-luxury-muted block truncate">
                        {item.product.concentration || 'Perfume Body Oil'} • {item.size || (item.product.volume_ml ? `${item.product.volume_ml}ml` : '30ml')}
                      </span>
                      <h3 className="font-serif text-base sm:text-lg text-luxury-cream font-normal hover:text-luxury-gold transition-colors truncate">
                        <Link to={`/product/${item.product.slug}`}>
                          {item.product.name}
                        </Link>
                      </h3>
                      <div className="font-serif text-sm text-luxury-gold pt-0.5">
                        {itemFormattedPrice}
                      </div>
                    </div>

                    {/* Quantity & Delete */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4 shrink-0">
                      <div className="flex items-center border border-luxury-border bg-luxury-card rounded-sm">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 sm:p-2 text-luxury-muted hover:text-luxury-cream transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2.5 sm:px-3 text-xs font-mono text-luxury-cream select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 sm:p-2 text-luxury-muted hover:text-luxury-cream transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-luxury-muted hover:text-red-400 transition-colors"
                        aria-label="Remove item from cart"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtotal & Action */}
            <div className="p-6 sm:p-8 bg-luxury-card border border-luxury-border space-y-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-luxury-sand">Subtotal</span>
                <span className="font-serif text-2xl text-luxury-gold font-normal">
                  {formattedSubtotal}
                </span>
              </div>

              <p className="text-xs text-luxury-muted font-light">
                Delivery fee will be calculated at checkout.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={ROUTES.SHOP} className="flex-1">
                  <Button variant="outline" size="lg" className="w-full text-xs">
                    Continue Shopping
                  </Button>
                </Link>
                <Link to={ROUTES.CHECKOUT} className="flex-1">
                  <Button variant="luxury" size="lg" className="w-full gap-2 text-xs">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
