import React from 'react';
import { MapPin, Truck, CreditCard, Check } from 'lucide-react';
import type { CheckoutStep } from '../hooks/useCheckout';

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
  onStepClick: (step: CheckoutStep) => void;
  isAddressValid: boolean;
  isShippingValid: boolean;
}

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({
  currentStep,
  onStepClick,
  isAddressValid,
  isShippingValid,
}) => {
  const steps: { id: CheckoutStep; label: string; number: number; icon: React.ReactNode; isComplete: boolean }[] = [
    {
      id: 'address',
      label: 'Address',
      number: 1,
      icon: <MapPin className="h-4 w-4" />,
      isComplete: isAddressValid,
    },
    {
      id: 'shipping',
      label: 'Delivery',
      number: 2,
      icon: <Truck className="h-4 w-4" />,
      isComplete: isShippingValid,
    },
    {
      id: 'payment',
      label: 'Payment',
      number: 3,
      icon: <CreditCard className="h-4 w-4" />,
      isComplete: false,
    },
  ];

  const getStepIndex = (step: CheckoutStep) => (step === 'address' ? 0 : step === 'shipping' ? 1 : 2);
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="w-full mb-10">
      <div className="flex items-center justify-between max-w-2xl mx-auto relative">
        {/* Connecting Progress Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-luxury-border -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-[1px] bg-luxury-gold -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isActive = step.id === currentStep;
          const isPassed = idx < currentIndex;
          const canClick = idx === 0 || (idx === 1 && isAddressValid) || (idx === 2 && isAddressValid && isShippingValid);

          return (
            <button
              key={step.id}
              type="button"
              disabled={!canClick}
              onClick={() => canClick && onStepClick(step.id)}
              className={`relative z-10 flex flex-col items-center group transition-all duration-300 ${
                canClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-serif transition-all duration-300 border ${
                  isActive
                    ? 'bg-luxury-gold text-black font-semibold border-luxury-gold shadow-md shadow-luxury-gold/20'
                    : isPassed
                    ? 'bg-luxury-card text-luxury-gold border-luxury-gold shadow-xs'
                    : 'bg-luxury-card text-luxury-muted border-luxury-border'
                }`}
              >
                {isPassed ? <Check className="h-4 w-4 stroke-[2.5]" /> : step.icon}
              </div>
              <span
                className={`mt-2 text-[10px] tracking-luxury-wide uppercase whitespace-nowrap transition-colors duration-200 ${
                  isActive ? 'text-luxury-gold font-medium' : isPassed ? 'text-luxury-cream font-medium' : 'text-luxury-muted'
                }`}
              >
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

