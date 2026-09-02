import { z } from 'zod';

export const shippingMethodSchema = z.object({
  name: z.string().min(2, 'Method name must be at least 2 characters'),
  description: z.string().nullable().optional(),
  price: z.number().nonnegative('Price cannot be negative'),
  free_threshold: z.number().nonnegative().nullable().optional(),
  estimated_days: z.string().min(1, 'Estimated transit time is required'),
  is_active: z.boolean().default(true),
});

export type ShippingMethodInput = z.infer<typeof shippingMethodSchema>;
