import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  display_order: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categorySchema>;
