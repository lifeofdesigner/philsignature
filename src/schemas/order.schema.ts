import { z } from 'zod';

export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string(),
  product_slug: z.string(),
  product_image_url: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  subtotal: z.number().positive(),
});

export const orderAddressSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(7, 'Valid telephone is required'),
  address_line1: z.string().min(5, 'Street address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().optional(),
  country: z.string().default('Nigeria'),
});

export const createOrderSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(7),
  customer_id: z.string().uuid().nullable().optional(),
  payment_method: z.enum(['paystack', 'flutterwave', 'bank_transfer', 'cod']),
  shipping_address: orderAddressSchema,
  items: z.array(orderItemSchema).min(1, 'At least one item is required in the bag'),
  coupon_code: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

