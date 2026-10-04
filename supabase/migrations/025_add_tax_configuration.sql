-- ==============================================================================
-- PHILZ SIGNATURE — 025_add_tax_configuration.sql
-- Tax Configuration & Order Tax Storage
-- 1. Adds tax_rate column to orders table
-- 2. Seeds default tax settings into site_settings (key-value table)
-- ==============================================================================

-- 1. ADD TAX_RATE TO ORDERS TABLE
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tax_rate NUMERIC(5, 2) DEFAULT 0;

-- 2. SEED DEFAULT TAX SETTINGS INTO SITE_SETTINGS
INSERT INTO public.site_settings (key, value, description, created_at, updated_at)
VALUES 
    ('tax_settings', '{"enabled": false, "name": "VAT", "rate": 7.5}'::jsonb, 'Global boutique taxation configuration', NOW(), NOW()),
    ('tax_enabled', 'false'::jsonb, 'Global boutique tax toggle (true/false)', NOW(), NOW()),
    ('tax_name', '"VAT"'::jsonb, 'Display name for tax levy (e.g. VAT, GST, Sales Tax)', NOW(), NOW()),
    ('tax_rate', '7.5'::jsonb, 'Tax percentage rate (e.g. 7.5 for 7.5%)', NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
    description = EXCLUDED.description,
    updated_at = NOW();
