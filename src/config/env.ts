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

const DEFAULT_SUPABASE_URL = 'https://nntszytexvmolywvadyx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5udHN6eXRleHZtb2x5d3ZhZHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNjY2MTcsImV4cCI6MjEwMzg0MjYxN30.U-EpA_mO2zZ5pBXluhmZE4il8YtHuKqan_fmKY-Me_8';

const parseEnv = () => {
  const rawUrl = import.meta.env.VITE_SUPABASE_URL;
  const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const validUrl = typeof rawUrl === 'string' && rawUrl.startsWith('http') && !rawUrl.includes('[SENSITIVE]')
    ? rawUrl
    : DEFAULT_SUPABASE_URL;

  const validKey = typeof rawKey === 'string' && rawKey.length > 20 && !rawKey.includes('[SENSITIVE]')
    ? rawKey
    : DEFAULT_SUPABASE_ANON_KEY;

  const merged = {
    ...import.meta.env,
    VITE_SUPABASE_URL: validUrl,
    VITE_SUPABASE_ANON_KEY: validKey,
  };

  const result = envSchema.safeParse(merged);
  if (!result.success) {
    console.warn('Environment variables warning:', result.error.format());
    return {
      VITE_SUPABASE_URL: validUrl,
      VITE_SUPABASE_ANON_KEY: validKey,
      VITE_APP_NAME: 'PHILZ SIGNATURE',
      VITE_APP_TAGLINE: 'Artisanal Parfums & Haute Fragrance',
      VITE_APP_URL: 'https://www.philzsignature.com',
      VITE_ENABLE_DEV_BOOTSTRAP: true,
    };
  }
  return result.data;
};

export const env = parseEnv();

