-- Migration 023: Seed default company registration number
-- Seeds BN 2671550 as the default company_registration_number in site_settings.
-- Uses ON CONFLICT DO NOTHING so existing values are not overwritten.

INSERT INTO site_settings (key, value, description, created_at, updated_at)
VALUES (
  'company_registration_number',
  '"BN 2671550"',
  'Business registration number displayed beside the storefront logo',
  now(),
  now()
)
ON CONFLICT (key) DO NOTHING;
