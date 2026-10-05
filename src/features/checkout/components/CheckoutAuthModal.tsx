import React from 'react';
import { LogIn, UserPlus, ArrowRight, X } from 'lucide-react';
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
          <LogIn className="h-6 w-6" />
        </div>

        {/* Title and Message */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium block">
            Philz Signature
          </span>
          <h2 id="checkout-auth-title" className="font-serif text-2xl sm:text-3xl text-luxury-cream font-normal">
            Sign in to continue
          </h2>
          <p className="text-xs text-luxury-muted leading-relaxed font-light max-w-xs mx-auto">
            Please sign in to your account before completing your order.
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2">
          <Button
            type="button"
            variant="luxury"
            size="lg"
            onClick={onSignIn}
            className="w-full justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
          >
            <span>Sign In</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onCreateAccount}
            className="w-full justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider border-luxury-border text-luxury-cream hover:border-luxury-gold hover:text-luxury-gold"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create Account</span>
          </Button>

          {allowGuest && onContinueAsGuest && (
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="w-full pt-2 text-xs text-luxury-muted hover:text-luxury-cream transition-colors underline underline-offset-4 cursor-pointer"
            >
              Continue as Guest
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
