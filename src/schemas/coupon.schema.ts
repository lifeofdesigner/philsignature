import { z } from 'zod';

export const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  description: z.string().nullable().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  value: z.number().positive(),
  min_spend: z.number().nonnegative().nullable().optional(),
  max_discount: z.number().nonnegative().nullable().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  is_active: z.boolean().default(true),
});

export type CouponInput = z.infer<typeof couponSchema>;

