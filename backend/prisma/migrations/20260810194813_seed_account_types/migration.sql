-- Migration: Seed static reference data for account_types
-- Runs automatically on every `prisma migrate deploy` (termasuk di production)
-- ON CONFLICT DO NOTHING = idempotent, aman dijalankan berkali-kali, data lama tidak hilang

INSERT INTO "account_types" ("name", "created_at", "updated_at")
VALUES
  ('CASH',        NOW(), NOW()),
  ('BANK',        NOW(), NOW()),
  ('EWALLET',     NOW(), NOW()),
  ('CREDIT_CARD', NOW(), NOW()),
  ('INVESTMENT',  NOW(), NOW())
ON CONFLICT ("name") DO NOTHING;
