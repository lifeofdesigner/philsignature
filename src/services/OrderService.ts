import { orderRepository, type OrderRepository } from '@/repositories/OrderRepository';
import { couponService, type CouponService } from './CouponService';
import { shippingService, type ShippingService } from './ShippingService';
import { createOrderSchema } from '@/schemas/order.schema';
import { ValidationError } from '@/errors/ValidationError';
import type { Order } from '@/types/database';

export interface PlaceOrderParams {
  customer_id?: string | null;
  email: string;
  phone: string;
  payment_method: 'paystack' | 'flutterwave' | 'korapay' | 'bank_transfer' | 'cod';
  shipping_method_id?: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code?: string;
    country?: string;
  };
  billing_address?: {
    first_name: string;
    last_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code?: string;
    country?: string;
  };
  notes?: string;
  coupon_code?: string;
  items: {
    product_id: string;
    product_name: string;
    product_slug: string;
    product_image_url?: string;
    sku: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
}

export class OrderService {
  constructor(
    private repo: OrderRepository = orderRepository,
    private coupons: CouponService = couponService,
    private shipping: ShippingService = shippingService
  ) {}

  async trackOrder(orderNumber: string, email?: string): Promise<Order | null> {
    if (!orderNumber || !orderNumber.trim()) {
      throw new ValidationError('Order number is required for consignment tracking');
    }
    return this.repo.findByOrderNumber(orderNumber, email);
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    if (!customerId) throw new ValidationError('Customer ID required to fetch acquisitions');
    return this.repo.findByCustomerId(customerId);
  }

  async getOrderById(id: string): Promise<Order | null> {
    if (!id) throw new ValidationError('Order ID is required');
    return this.repo.findById(id);
  }

  async getAllOrdersAdmin(): Promise<Order[]> {
    return this.repo.findAllAdmin();
  }

  async updateFulfillmentStatus(
    orderId: string,
    status: Order['fulfillment_status'],
    note?: string
  ): Promise<Order> {
    if (!orderId) throw new ValidationError('Order ID is required');
    const updated = await this.repo.updateFulfillmentStatus(orderId, status);
    await this.repo.addTimeline(
      orderId,
      status,
      `Delivery status updated: ${status}`,
      note || `Order status changed to "${status}".`
    );
    return updated;
  }

  async placeOrder(params: PlaceOrderParams): Promise<Order> {
    const parseResult = createOrderSchema.safeParse(params);
    if (!parseResult.success) {
      throw new ValidationError('Invalid order checkout details', parseResult.error.format());
    }
    const input = parseResult.data;

    if (!input.items || input.items.length === 0) {
      throw new ValidationError('Cannot place an order with an empty shopping bag');
    }

    // 1. Calculate Subtotal with strict mathematical precision
    const subtotal = input.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    // 2. Calculate Shipping
    let shippingCost = 5000;
    if (params.shipping_method_id) {
      const methods = await this.shipping.getActiveMethods();
      const selected = methods.find((m) => m.id === params.shipping_method_id);
      if (selected) {
        shippingCost = this.shipping.calculateShippingCost(selected, subtotal);
      }
    } else {
      // Default complimentary threshold at ₦150,000
      shippingCost = subtotal >= 150000 ? 0 : 5000;
    }

    // 3. Validate & Apply Privilege Voucher
    let discount = 0;
    let validCouponId: string | null = null;
    if (params.coupon_code && params.coupon_code.trim()) {
      const couponCheck = await this.coupons.validateCoupon(params.coupon_code, subtotal);
      if (couponCheck.valid && couponCheck.coupon) {
        discount = couponCheck.discountAmount;
        validCouponId = couponCheck.coupon.id;
      }
    }

    const tax = 0; // Included in luxury pricing
    const total = Math.max(0, subtotal + shippingCost - discount + tax);

    // 4. Generate Luxury Order Consignment Number
    const timestampPart = Date.now().toString().slice(-4);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `PS-${timestampPart}-${randomSuffix}`;

    // 5. Atomic Order Creation, Inventory Decrement, & Rollback Safeguard
    const order = await this.repo.create(input, {
      subtotal,
      shipping: shippingCost,
      discount,
      tax,
      total,
      orderNumber,
    });

    // 6. Record coupon usage upon successful creation
    if (validCouponId) {
      await this.coupons.recordCouponUsage(validCouponId).catch(() => null);
    }

    return order;
  }

  async confirmPayment(orderId: string, reference: string, paymentMethod: string): Promise<Order> {
    if (!orderId || !reference) {
      throw new ValidationError('Order ID and transaction reference required for confirmation');
    }

    const updated = await this.repo.updatePayment(orderId, reference, 'paid');
    await this.repo.addTimeline(
      orderId,
      'paid',
      'Payment Confirmed',
      `Payment confirmed successfully via ${paymentMethod.toUpperCase()} (Ref: ${reference}). Your order is being prepared.`
    );

    return updated;
  }
}

export const orderService = new OrderService();
