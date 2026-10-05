import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCart } from '@/features/cart/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { shippingService } from '@/services/ShippingService';
import { couponService } from '@/services/CouponService';
import { addressService } from '@/services/AddressService';
import { orderService } from '@/services/OrderService';
import { paymentService } from '@/services/PaymentService';
import { useTaxSettings } from '@/hooks/useTaxSettings';
import { checkoutStateStorage } from '../utils/checkoutStateStorage';
import type { CustomerAddress } from '@/types/database';

export type CheckoutStep = 'address' | 'shipping' | 'payment';

export interface CheckoutAddressForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export function useCheckout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { items, subtotal, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { guestCheckoutEnabled } = useStoreSettings();

  // Track if user explicitly opted to continue as guest in this checkout session
  const [isGuestAccepted, setIsGuestAccepted] = useState<boolean>(() => {
    return sessionStorage.getItem('philz_checkout_guest_mode') === 'true';
  });

  // Current Step
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(() => {
    const preserved = checkoutStateStorage.load();
    return preserved?.currentStep || 'address';
  });

  // Form State with draft persistence & preserved checkout recovery
  const [addressForm, setAddressForm] = useState<CheckoutAddressForm>(() => {
    const preserved = checkoutStateStorage.load();
    if (preserved?.addressForm) {
      return preserved.addressForm;
    }
    try {
      const saved = sessionStorage.getItem('philz_checkout_address_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          firstName: parsed.firstName || profile?.first_name || '',
          lastName: parsed.lastName || profile?.last_name || '',
          email: parsed.email || user?.email || '',
          phone: parsed.phone || user?.phone || profile?.phone || '',
          streetAddress: parsed.streetAddress || '',
          city: parsed.city || '',
          state: parsed.state || 'Lagos',
          postalCode: parsed.postalCode || '',
          country: parsed.country || 'Nigeria',
        };
      }
    } catch {
      // ignore JSON parse error
    }
    return {
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || profile?.phone || '',
      streetAddress: '',
      city: '',
      state: 'Lagos',
      postalCode: '',
      country: 'Nigeria',
    };
  });

  // Sync profile details if addressForm fields are empty and user is logged in
  useEffect(() => {
    if (profile || user) {
      setAddressForm((prev) => ({
        ...prev,
        firstName: prev.firstName || profile?.first_name || '',
        lastName: prev.lastName || profile?.last_name || '',
        email: prev.email || user?.email || '',
        phone: prev.phone || user?.phone || profile?.phone || '',
      }));
    }
  }, [profile, user]);

  // Save address draft to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem('philz_checkout_address_draft', JSON.stringify(addressForm));
    } catch {
      // ignore storage quota error
    }
  }, [addressForm]);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
    return checkoutStateStorage.load()?.selectedAddressId || null;
  });

  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>(() => {
    return checkoutStateStorage.load()?.selectedShippingMethodId || '';
  });

  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | 'korapay' | 'bank_transfer'>(() => {
    return checkoutStateStorage.load()?.paymentMethod || 'paystack';
  });

  const [orderNotes, setOrderNotes] = useState<string>(() => {
    return checkoutStateStorage.load()?.orderNotes || '';
  });

  // Coupon State with preserved recovery
  const [couponCode, setCouponCode] = useState<string>(() => {
    return checkoutStateStorage.load()?.couponCode || '';
  });

  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; message: string } | null>(() => {
    return checkoutStateStorage.load()?.appliedCoupon || null;
  });

  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);

  // General Error / Submission State
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const { data: bankDetails } = useQuery({
    queryKey: ['payment-bank-transfer-config'],
    queryFn: () => paymentService.getBankTransferConfig(),
    staleTime: 1000 * 60 * 10,
  });

  const { data: enabledPaymentMethods } = useQuery({
    queryKey: ['payment-enabled-methods'],
    queryFn: () => paymentService.getEnabledMethods(),
    staleTime: 1000 * 60 * 10,
  });

  const { taxSettings, calculateTax, isLoading: isLoadingTax } = useTaxSettings();

  // Gateway fallback if current selection becomes disabled
  useEffect(() => {
    if (!enabledPaymentMethods) return;
    if (enabledPaymentMethods[paymentMethod]) return;
    const fallback = (['paystack', 'flutterwave', 'korapay', 'bank_transfer'] as const).find(
      (m) => enabledPaymentMethods[m]
    );
    if (fallback) setPaymentMethod(fallback);
  }, [enabledPaymentMethods, paymentMethod]);

  // Keep checkoutStateStorage synchronized so any mid-flow sign in or sign up keeps all data
  useEffect(() => {
    checkoutStateStorage.save({
      addressForm,
      selectedAddressId,
      selectedShippingMethodId,
      paymentMethod,
      orderNotes,
      couponCode,
      appliedCoupon,
      currentStep,
    });
  }, [
    addressForm,
    selectedAddressId,
    selectedShippingMethodId,
    paymentMethod,
    orderNotes,
    couponCode,
    appliedCoupon,
    currentStep,
  ]);

  // 1. Fetch Shipping Methods
  const { data: shippingMethods = [], isLoading: isLoadingShipping } = useQuery({
    queryKey: ['shipping-methods'],
    queryFn: () => shippingService.getActiveMethods(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Set default shipping method once loaded if not already selected
  useEffect(() => {
    if (shippingMethods.length > 0 && !selectedShippingMethodId) {
      setSelectedShippingMethodId(shippingMethods[0].id);
    }
  }, [shippingMethods, selectedShippingMethodId]);

  // 2. Fetch Customer Saved Addresses if authenticated
  const { data: savedAddresses = [], isLoading: isLoadingAddresses } = useQuery({
    queryKey: ['customer-addresses', user?.id],
    queryFn: () => (user?.id ? addressService.getAddresses(user.id) : Promise.resolve([])),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 10,
  });

  // Auto-populate with default address if available
  const handleSelectSavedAddress = (address: CustomerAddress) => {
    setSelectedAddressId(address.id);
    setAddressForm({
      firstName: address.first_name || '',
      lastName: address.last_name || '',
      email: addressForm.email || user?.email || '',
      phone: address.phone || '',
      streetAddress: address.address_line1,
      city: address.city,
      state: address.state,
      postalCode: address.postal_code || '',
      country: address.country || 'Nigeria',
    });
  };

  // 3. Shipping Calculation
  const selectedShippingMethod = useMemo(() => {
    return shippingMethods.find((m) => m.id === selectedShippingMethodId) || null;
  }, [shippingMethods, selectedShippingMethodId]);

  const shippingCost = useMemo(() => {
    if (!selectedShippingMethod) {
      return subtotal >= 150000 ? 0 : 5000;
    }
    return shippingService.calculateShippingCost(selectedShippingMethod, subtotal);
  }, [selectedShippingMethod, subtotal]);

  // 4. Tax Calculation
  const taxCalculation = useMemo(() => calculateTax(subtotal), [calculateTax, subtotal]);
  const taxAmount = taxCalculation.amount;
  const taxRate = taxCalculation.rate;
  const taxName = taxCalculation.name;
  const isTaxEnabled = taxCalculation.enabled;

  // 5. Totals Calculation
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalAmount = Math.max(0, subtotal + shippingCost - discountAmount + taxAmount);

  // 5. Coupon Application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const result = await couponService.validateCoupon(couponCode, subtotal);
      if (result.valid) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discount: result.discountAmount,
          message: result.message,
        });
        setCouponError(null);
      } else {
        setAppliedCoupon(null);
        setCouponError(result.message);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Coupon validation failed';
      setCouponError(errorMsg);
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const acceptGuestCheckout = () => {
    setIsGuestAccepted(true);
    sessionStorage.setItem('philz_checkout_guest_mode', 'true');
    setIsAuthModalOpen(false);
  };

  // 6. Order Placement Mutation
  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      setCheckoutError(null);

      // Security check: Customer must either be authenticated OR guest checkout must be explicitly enabled and accepted
      if (!user) {
        if (!guestCheckoutEnabled) {
          throw new Error('Please sign in or create an account before completing your order.');
        }
        if (!isGuestAccepted) {
          throw new Error('Please choose how you would like to continue with your checkout.');
        }
      }

      // Validate required address fields
      if (
        !addressForm.firstName.trim() ||
        !addressForm.lastName.trim() ||
        !addressForm.email.trim() ||
        !addressForm.phone.trim() ||
        !addressForm.streetAddress.trim() ||
        !addressForm.city.trim()
      ) {
        throw new Error('Please fill in all delivery details (first name, last name, email, phone, and address).');
      }

      if (items.length === 0) {
        throw new Error('Your cart is empty.');
      }

      // Prepare items for OrderService
      const orderItems = items.map((item) => ({
        product_id: item.product.id,
        product_name: item.size ? `${item.product.name} (${item.size})` : item.product.name,
        product_slug: item.product.slug,
        product_image_url:
          item.product.images?.find((img) => img.is_primary)?.image_url ||
          item.product.images?.[0]?.image_url ||
          'https://nntszytexvmolywvadyx.supabase.co/storage/v1/object/public/products/philz-signature-official-bottle.jpg',
        sku: item.size
          ? `${item.product.sku || `PS-${item.product.slug.toUpperCase()}`}-${item.size.toUpperCase()}`
          : item.product.sku || `PS-${item.product.slug.toUpperCase()}`,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      // Place Order in Supabase
      const createdOrder = await orderService.placeOrder({
        customer_id: user?.id || null,
        email: addressForm.email.trim().toLowerCase(),
        phone: addressForm.phone.trim(),
        payment_method: paymentMethod,
        shipping_method_id: selectedShippingMethodId || undefined,
        shipping_address: {
          first_name: addressForm.firstName.trim(),
          last_name: addressForm.lastName.trim(),
          phone: addressForm.phone.trim(),
          address_line1: addressForm.streetAddress.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state,
          postal_code: addressForm.postalCode || undefined,
          country: addressForm.country,
        },
        billing_address: {
          first_name: addressForm.firstName.trim(),
          last_name: addressForm.lastName.trim(),
          phone: addressForm.phone.trim(),
          address_line1: addressForm.streetAddress.trim(),
          city: addressForm.city.trim(),
          state: addressForm.state,
          postal_code: addressForm.postalCode || undefined,
          country: addressForm.country,
        },
        notes: orderNotes || undefined,
        coupon_code: appliedCoupon?.code || undefined,
        items: orderItems,
      });

      return createdOrder;
    },
    onError: (err: Error) => {
      setCheckoutError(err.message || 'An error occurred while creating your order. Please try again.');
      setIsProcessingPayment(false);
    },
  });

  // 7. Complete Checkout and Trigger Payment Gateway
  const handleProceedToPayment = async () => {
    // If not authenticated and either guest is not allowed or hasn't been selected yet, gate user
    if (!user) {
      if (!guestCheckoutEnabled || !isGuestAccepted) {
        setIsAuthModalOpen(true);
        return;
      }
    }

    try {
      setIsProcessingPayment(true);
      setCheckoutError(null);

      const order = await placeOrderMutation.mutateAsync();

      const encodedEmail = encodeURIComponent(addressForm.email);

      if (paymentMethod === 'bank_transfer') {
        clearCart();
        checkoutStateStorage.clear();
        sessionStorage.removeItem('philz_checkout_guest_mode');
        queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
        setIsProcessingPayment(false);

        // Dispatch order received transactional email asynchronously
        fetch('/api/email/dispatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'order_received',
            payload: {
              order,
              items: order.items || items.map((i) => ({
                product_name: i.product.name,
                quantity: i.quantity,
                price: i.price,
                subtotal: i.price * i.quantity,
              })),
            },
          }),
        }).catch((err) => console.warn('Order received email dispatch error:', err));

        navigate(`/checkout/confirmation/${order.order_number}?method=bank_transfer&email=${encodedEmail}`);
        return;
      }

      // Card/gateway payment: charge with initialized reference
      await paymentService.initializeCheckout(paymentMethod, {
        email: addressForm.email,
        phone: addressForm.phone,
        name: `${addressForm.firstName} ${addressForm.lastName}`,
        amount: totalAmount,
        reference: order.order_number,
        metadata: { order_id: order.id },
        onSuccess: async (reference) => {
          try {
            if (paymentMethod === 'paystack') {
              clearCart();
              checkoutStateStorage.clear();
              sessionStorage.removeItem('philz_checkout_guest_mode');
              queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
              setIsProcessingPayment(false);
              navigate(`/payment/callback?reference=${encodeURIComponent(reference)}&email=${encodedEmail}`);
              return;
            }

            const result = await paymentService.verifyPayment(paymentMethod, reference, order.id);
            if (!result.success) {
              setCheckoutError(
                result.reason || 'We could not verify your payment. Please contact support with your order number.'
              );
              navigate(`/checkout/confirmation/${order.order_number}?status=pending&email=${encodedEmail}`);
              return;
            }
            clearCart();
            checkoutStateStorage.clear();
            sessionStorage.removeItem('philz_checkout_guest_mode');
            queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
            navigate(`/checkout/confirmation/${order.order_number}?email=${encodedEmail}`);
          } catch (confirmErr: unknown) {
            const msg = confirmErr instanceof Error ? confirmErr.message : 'Could not verify payment. Please try again.';
            setCheckoutError(msg);
          } finally {
            setIsProcessingPayment(false);
          }
        },
        onCancel: () => {
          setIsProcessingPayment(false);
          navigate(`/checkout/confirmation/${order.order_number}?status=pending&email=${encodedEmail}`);
        },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not complete your order. Please try again.';
      setCheckoutError(msg);
      setIsProcessingPayment(false);
    }
  };

  return {
    currentStep,
    setCurrentStep,
    addressForm,
    setAddressForm,
    selectedAddressId,
    handleSelectSavedAddress,
    savedAddresses,
    isLoadingAddresses,
    shippingMethods,
    isLoadingShipping,
    selectedShippingMethodId,
    setSelectedShippingMethodId,
    selectedShippingMethod,
    paymentMethod,
    setPaymentMethod,
    orderNotes,
    setOrderNotes,
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponError,
    isApplyingCoupon,
    handleApplyCoupon,
    handleRemoveCoupon,
    items,
    subtotal,
    shippingCost,
    discountAmount,
    taxAmount,
    taxRate,
    taxName,
    isTaxEnabled,
    isLoadingTax,
    taxSettings,
    totalAmount,
    checkoutError,
    isSubmitting: placeOrderMutation.isPending || isProcessingPayment,
    handleProceedToPayment,
    isAuthModalOpen,
    setIsAuthModalOpen,
    guestCheckoutEnabled,
    isGuestAccepted,
    acceptGuestCheckout,
    bankDetails:
      bankDetails || {
        bankName: '',
        accountName: '',
        accountNumber: '',
        currency: 'NGN',
        instructions: '',
      },
    enabledPaymentMethods:
      enabledPaymentMethods || { paystack: true, flutterwave: false, korapay: false, bank_transfer: true },
  };
}
