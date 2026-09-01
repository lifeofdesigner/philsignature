import { z } from 'zod';

export const collectionSchema = z.object({
  name: z.string().min(2, 'Collection name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  banner_url: z.string().nullable().optional(),
  is_featured: z.boolean().default(false),
  display_order: z.number().int().nonnegative().default(0),
  is_active: z.boolean().default(true),
});

export type CollectionInput = z.infer<typeof collectionSchema>;
