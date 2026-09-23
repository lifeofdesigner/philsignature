import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url().default('https://placeholder-project.supabase.co'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1).default('placeholder-anon-key'),
  VITE_APP_NAME: z.string().default('PHILZ SIGNATURE'),
  VITE_APP_TAGLINE: z.string().default('Artisanal Parfums & Haute Fragrance'),
  VITE_APP_URL: z.string().default('http://localhost:3000'),
  VITE_ENABLE_DEV_BOOTSTRAP: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(import.meta.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format());
    // In production we would throw, but in development we fallback safely
    return envSchema.parse({
      VITE_SUPABASE_URL: 'https://placeholder-project.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'placeholder-anon-key',
    });
  }
  return result.data;
};

export const env = parseEnv();

