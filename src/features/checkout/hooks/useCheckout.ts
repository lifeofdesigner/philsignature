import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCart } from '@/features/cart/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { shippingService } from '@/services/ShippingService';
import { couponService } from '@/services/CouponService';
import { addressService } from '@/services/AddressService';
import { orderService } from '@/services/OrderService';
import { paymentService } from '@/services/PaymentService';
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

  // Current Step
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');

  // Form State
  const [addressForm, setAddressForm] = useState<CheckoutAddressForm>({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || profile?.phone || '',
    streetAddress: '',
    city: '',
    state: 'Lagos',
    postalCode: '',
    country: 'Nigeria',
  });

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | 'bank_transfer'>('paystack');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Coupon State
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; message: string } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);

  // General Error / Submission State
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // 1. Fetch Shipping Methods
  const { data: shippingMethods = [], isLoading: isLoadingShipping } = useQuery({
    queryKey: ['shipping-methods'],
    queryFn: () => shippingService.getActiveMethods(),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Set default shipping method once loaded
  useMemo(() => {
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

  // 4. Totals Calculation
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalAmount = Math.max(0, subtotal + shippingCost - discountAmount);

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

  // 6. Order Placement Mutation
  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      setCheckoutError(null);

      // Validate required address fields
      if (!addressForm.firstName || !addressForm.lastName || !addressForm.email || !addressForm.phone || !addressForm.streetAddress) {
        throw new Error('Please fulfill all required recipient and delivery address details.');
      }

      if (items.length === 0) {
        throw new Error('Your shopping bag is currently vacant.');
      }

      // Prepare items for OrderService
      const orderItems = items.map((item) => ({
        product_id: item.id,
        product_name: item.product.name,
        product_slug: item.product.slug,
        product_image_url:
          item.product.images?.find((img) => img.is_primary)?.image_url ||
          item.product.images?.[0]?.image_url ||
          '',
        sku: item.product.sku || `PS-${item.product.slug.toUpperCase()}`,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      // Place Order in Supabase
      const createdOrder = await orderService.placeOrder({
        customer_id: user?.id || null,
        email: addressForm.email,
        phone: addressForm.phone,
        payment_method: paymentMethod,
        shipping_method_id: selectedShippingMethodId || undefined,
        shipping_address: {
          first_name: addressForm.firstName,
          last_name: addressForm.lastName,
          address_line1: addressForm.streetAddress,
          city: addressForm.city,
          state: addressForm.state,
          postal_code: addressForm.postalCode || undefined,
          country: addressForm.country,
        },
        billing_address: {
          first_name: addressForm.firstName,
          last_name: addressForm.lastName,
          address_line1: addressForm.streetAddress,
          city: addressForm.city,
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
      setCheckoutError(err.message || 'An error occurred during order generation.');
      setIsProcessingPayment(false);
    },
  });

  // 7. Complete Checkout and Trigger Payment Gateway
  const handleProceedToPayment = async () => {
    try {
      setIsProcessingPayment(true);
      setCheckoutError(null);

      const order = await placeOrderMutation.mutateAsync();

      // Gateway Execution
      if (paymentMethod === 'paystack') {
        await paymentService.initializePaystack({
          email: addressForm.email,
          amount: totalAmount,
          reference: order.order_number,
          metadata: {
            order_id: order.id,
            customer_name: `${addressForm.firstName} ${addressForm.lastName}`,
          },
          onSuccess: async (ref) => {
            try {
              await orderService.confirmPayment(order.id, ref, 'paystack');
              clearCart();
              queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
              navigate(`/checkout/confirmation/${order.order_number}`);
            } catch (confirmErr: unknown) {
              const msg = confirmErr instanceof Error ? confirmErr.message : 'Error confirming payment';
              setCheckoutError(msg);
            } finally {
              setIsProcessingPayment(false);
            }
          },
          onCancel: () => {
            setIsProcessingPayment(false);
            navigate(`/checkout/confirmation/${order.order_number}?status=pending`);
          },
        });
      } else if (paymentMethod === 'flutterwave') {
        await paymentService.initializeFlutterwave({
          email: addressForm.email,
          phone: addressForm.phone,
          name: `${addressForm.firstName} ${addressForm.lastName}`,
          amount: totalAmount,
          txRef: order.order_number,
          onSuccess: async (txId, ref) => {
            try {
              await orderService.confirmPayment(order.id, ref || txId, 'flutterwave');
              clearCart();
              queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
              navigate(`/checkout/confirmation/${order.order_number}`);
            } catch (confirmErr: unknown) {
              const msg = confirmErr instanceof Error ? confirmErr.message : 'Error confirming payment';
              setCheckoutError(msg);
            } finally {
              setIsProcessingPayment(false);
            }
          },
          onCancel: () => {
            setIsProcessingPayment(false);
            navigate(`/checkout/confirmation/${order.order_number}?status=pending`);
          },
        });
      } else if (paymentMethod === 'bank_transfer') {
        // Direct bank transfer confirmation
        clearCart();
        queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
        setIsProcessingPayment(false);
        navigate(`/checkout/confirmation/${order.order_number}?method=bank_transfer`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Order submission failed';
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
    totalAmount,
    checkoutError,
    isSubmitting: placeOrderMutation.isPending || isProcessingPayment,
    handleProceedToPayment,
    bankDetails: paymentService.bankTransferConfig,
  };
}
