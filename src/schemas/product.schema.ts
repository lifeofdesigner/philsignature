import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Fragrance name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  tagline: z.string().nullable().optional(),
  description: z.string().min(10, 'Description must convey formulation narrative'),
  details: z.string().nullable().optional(),
  sku: z.string().min(3, 'SKU is required'),
  barcode: z.string().nullable().optional(),
  price: z.number().positive('Price must be greater than zero'),
  sale_price: z.number().positive().nullable().optional(),
  stock_quantity: z.number().int().nonnegative('Stock cannot be negative'),
  weight_grams: z.number().positive().nullable().optional(),
  brand: z.string().default('PHILZ SIGNATURE'),
  category_id: z.string().uuid().nullable().optional(),
  collection_id: z.string().uuid().nullable().optional(),
  fragrance_family: z.enum(['Woody', 'Oriental', 'Floral', 'Fresh', 'Gourmand', 'Chypre', 'Aromatic']).nullable().optional(),
  top_notes: z.array(z.string()).default([]),
  middle_notes: z.array(z.string()).default([]),
  base_notes: z.array(z.string()).default([]),
  ingredients: z.string().nullable().optional(),
  how_to_use: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  is_featured: z.boolean().default(false),
  is_bestseller: z.boolean().default(false),
  is_new_arrival: z.boolean().default(false),
  is_trending: z.boolean().default(false),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  meta_keywords: z.string().nullable().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

