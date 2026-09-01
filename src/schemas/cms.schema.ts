import { z } from 'zod';

export const announcementBarSchema = z.object({
  enabled: z.boolean().default(true),
  text: z.string().min(5),
  link_text: z.string().optional(),
  link_url: z.string().optional(),
});

export const heroSectionSchema = z.object({
  headline: z.string().min(3),
  subtitle: z.string().min(5),
  cta_text: z.string().default('Explore Creations'),
  cta_link: z.string().default('/shop'),
  background_image_url: z.string().optional(),
});

export const brandStorySchema = z.object({
  headline: z.string().min(3),
  philosophy: z.string().min(20),
  sourcing_ethos: z.string().min(20),
});

export const cmsContentSchema = z.object({
  key: z.string().min(2),
  section: z.string().min(2),
  title: z.string().min(2),
  content: z.record(z.unknown()),
  is_published: z.boolean().default(true),
});

export type CmsContentInput = z.infer<typeof cmsContentSchema>;

