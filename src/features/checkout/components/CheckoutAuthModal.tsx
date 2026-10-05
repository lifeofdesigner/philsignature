import React from 'react';
import { LogIn, UserPlus, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CheckoutAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
  allowGuest?: boolean;
  onContinueAsGuest?: () => void;
}

export const CheckoutAuthModal: React.FC<CheckoutAuthModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
  onCreateAccount,
  allowGuest = false,
  onContinueAsGuest,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-auth-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="relative w-full max-w-md bg-luxury-card border border-luxury-gold/40 rounded-sm shadow-2xl p-6 sm:p-8 space-y-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-luxury-muted hover:text-luxury-cream transition-colors rounded-sm cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Monogram Icon */}
        <div className="w-14 h-14 mx-auto rounded-full bg-luxury-gold/10 border border-luxury-gold/40 flex items-center justify-center text-luxury-gold">
          {allowGuest ? <LogIn className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
        </div>

        {/* Title and Message */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium block">
            Philz Signature
          </span>
          <h2 id="checkout-auth-title" className="font-serif text-2xl sm:text-3xl text-luxury-cream font-normal">
            {allowGuest ? 'Continue to Checkout' : 'Sign in required'}
          </h2>
          <p className="text-xs text-luxury-muted leading-relaxed font-light max-w-xs mx-auto">
            {allowGuest
              ? "Choose how you'd like to continue."
              : 'Please sign in or create an account before completing your order.'}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2 text-left">
          {/* Option 1: Sign In */}
          <div className="rounded-sm border border-luxury-border/60 hover:border-luxury-gold/50 bg-luxury-charcoal/40 p-3.5 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs uppercase font-medium tracking-wider text-luxury-cream">
                Sign In
              </span>
              <Button
                type="button"
                variant="luxury"
                size="sm"
                onClick={onSignIn}
                className="gap-1 cursor-pointer text-[10px] uppercase tracking-wider py-1 px-3 h-8"
              >
                <span>Sign In</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-[11px] text-luxury-muted leading-relaxed font-light">
              View your orders, save your details, and enjoy a faster checkout next time.
            </p>
          </div>

          {/* Option 2: Create Account */}
          <div className="rounded-sm border border-luxury-border/60 hover:border-luxury-gold/50 bg-luxury-charcoal/40 p-3.5 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs uppercase font-medium tracking-wider text-luxury-cream">
                Create Account
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCreateAccount}
                className="gap-1 cursor-pointer text-[10px] uppercase tracking-wider py-1 px-3 h-8 border-luxury-border text-luxury-cream hover:border-luxury-gold hover:text-luxury-gold"
              >
                <UserPlus className="h-3 w-3" />
                <span>Register</span>
              </Button>
            </div>
            <p className="text-[11px] text-luxury-muted leading-relaxed font-light">
              New client? Create an account in seconds to earn fragrance privileges and track consignments.
            </p>
          </div>

          {/* Option 3: Continue as Guest (Only visible when Guest Checkout is enabled) */}
          {allowGuest && onContinueAsGuest && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="w-full py-2.5 px-4 text-xs font-medium text-luxury-gold hover:text-luxury-gold-light bg-black/40 hover:bg-black/60 border border-luxury-gold/30 rounded-sm transition-colors cursor-pointer uppercase tracking-wider"
              >
                Continue as Guest
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
