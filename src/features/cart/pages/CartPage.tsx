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
    <div className="min-h-screen bg-black py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-10">
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Your Selection
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-white font-normal tracking-tight">
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
                  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80';

                return (
                  <div
                    key={item.id}
                    className="py-6 flex flex-col sm:flex-row items-center gap-6"
                  >
                    <Link
                      to={`/product/${item.product.slug}`}
                      className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden bg-luxury-charcoal"
                    >
                      <img
                        src={primaryImage}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <span className="text-[9px] uppercase tracking-luxury text-luxury-muted block">
                        {item.product.concentration || 'Extrait de Parfum'} • {item.product.volume_ml || 100}ml
                      </span>
                      <h3 className="font-serif text-lg text-white font-normal hover:text-luxury-gold transition-colors">
                        <Link to={`/product/${item.product.slug}`}>
                          {item.product.name}
                        </Link>
                      </h3>
                      <div className="font-serif text-sm text-luxury-gold pt-1">
                        {itemFormattedPrice}
                      </div>
                    </div>

                    {/* Quantity & Delete */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-luxury-border bg-luxury-charcoal">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-luxury-muted hover:text-white transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-xs font-mono text-white select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-luxury-muted hover:text-white transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-luxury-muted hover:text-red-400 transition-colors"
                        aria-label="Remove item from bag"
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
                    Continue Exploring
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
