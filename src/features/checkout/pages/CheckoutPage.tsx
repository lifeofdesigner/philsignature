import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle, ShoppingBag } from 'lucide-react';
import { useCheckout } from '../hooks/useCheckout';
import {
  CheckoutSteps,
  AddressStep,
  ShippingStep,
  PaymentStep,
  OrderSummaryCard,
} from '../components';
import { EmptyState } from '@/components/feedback/EmptyState';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const checkout = useCheckout();

  const isAddressValid = Boolean(
    checkout.addressForm.firstName.trim() &&
    checkout.addressForm.lastName.trim() &&
    checkout.addressForm.email.trim() &&
    checkout.addressForm.phone.trim() &&
    checkout.addressForm.streetAddress.trim() &&
    checkout.addressForm.city.trim()
  );

  const isShippingValid = Boolean(checkout.selectedShippingMethodId);

  // If bag is empty, render luxury empty state
  if (checkout.items.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-8 py-20 max-w-2xl">
        <EmptyState
          title="Your Cart is Empty"
          description="You have not added any perfumes to your cart yet. Browse our collection to get started."
          actionLabel="Shop Perfumes"
          onAction={() => navigate('/shop')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black pb-24 pt-10">
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        {/* Header Billboard */}
        <div className="text-center space-y-2 mb-10">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Safe & Easy Payment
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-luxury-cream font-normal">
            Checkout
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-luxury-muted">
            <ShieldCheck className="h-3.5 w-3.5 text-luxury-gold" />
            <span>100% Safe & Secure Checkout</span>
          </div>
        </div>

        {/* Checkout Steps Indicator */}
        <CheckoutSteps
          currentStep={checkout.currentStep}
          onStepClick={(step) => checkout.setCurrentStep(step)}
          isAddressValid={isAddressValid}
          isShippingValid={isShippingValid}
        />

        {/* Global Checkout Error Banner */}
        {checkout.checkoutError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-200 rounded-sm flex items-start gap-3 text-xs animate-fadeIn">
            <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 dark:text-white mb-0.5">Transaction Unsuccessful</p>
              <p>{checkout.checkoutError}</p>
            </div>
          </div>
        )}

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Active Step Panel */}
          <div className="lg:col-span-7 bg-luxury-card border border-luxury-border p-6 sm:p-8 rounded-sm shadow-xs">
            {checkout.currentStep === 'address' && (
              <AddressStep
                addressForm={checkout.addressForm}
                setAddressForm={checkout.setAddressForm}
                savedAddresses={checkout.savedAddresses}
                selectedAddressId={checkout.selectedAddressId}
                onSelectSavedAddress={checkout.handleSelectSavedAddress}
                onProceed={() => checkout.setCurrentStep('shipping')}
              />
            )}

            {checkout.currentStep === 'shipping' && (
              <ShippingStep
                shippingMethods={checkout.shippingMethods}
                isLoading={checkout.isLoadingShipping}
                selectedMethodId={checkout.selectedShippingMethodId}
                onSelectMethod={checkout.setSelectedShippingMethodId}
                subtotal={checkout.subtotal}
                onBack={() => checkout.setCurrentStep('address')}
                onProceed={() => checkout.setCurrentStep('payment')}
              />
            )}

            {checkout.currentStep === 'payment' && (
              <PaymentStep
                paymentMethod={checkout.paymentMethod}
                setPaymentMethod={checkout.setPaymentMethod}
                orderNotes={checkout.orderNotes}
                setOrderNotes={checkout.setOrderNotes}
                bankDetails={checkout.bankDetails}
                enabledPaymentMethods={checkout.enabledPaymentMethods}
                totalAmount={checkout.totalAmount}
                isSubmitting={checkout.isSubmitting}
                onBack={() => checkout.setCurrentStep('shipping')}
                onSubmit={checkout.handleProceedToPayment}
              />
            )}
          </div>

          {/* Sticky Order Summary Sidebar */}
          <div className="lg:col-span-5">
            <OrderSummaryCard
              items={checkout.items}
              subtotal={checkout.subtotal}
              shippingCost={checkout.shippingCost}
              discountAmount={checkout.discountAmount}
              taxAmount={checkout.taxAmount}
              taxRate={checkout.taxRate}
              taxName={checkout.taxName}
              isTaxEnabled={checkout.isTaxEnabled}
              totalAmount={checkout.totalAmount}
              couponCode={checkout.couponCode}
              setCouponCode={checkout.setCouponCode}
              appliedCoupon={checkout.appliedCoupon}
              couponError={checkout.couponError}
              isApplyingCoupon={checkout.isApplyingCoupon}
              onApplyCoupon={checkout.handleApplyCoupon}
              onRemoveCoupon={checkout.handleRemoveCoupon}
            />

            {/* Customer Care Note */}
            <div className="mt-4 p-4 text-center text-[11px] text-luxury-muted font-light leading-relaxed border border-luxury-border/40 rounded">
              <ShoppingBag className="h-4 w-4 text-luxury-gold mx-auto mb-1 opacity-70" />
              <p>Need help with your order or bulk gifts? Contact us on WhatsApp or email info@philzsignature.com.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
