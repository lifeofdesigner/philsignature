import { z } from 'zod';

export const couponSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters').transform((v) => v.toUpperCase()),
  discount_type: z.enum(['percentage', 'fixed']),
  value: z.number().positive('Discount value must be greater than zero'),
  min_spend: z.number().nonnegative().nullable().optional(),
  max_discount: z.number().positive().nullable().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export type CouponInput = z.infer<typeof couponSchema>;
