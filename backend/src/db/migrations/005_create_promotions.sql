-- Migration: 005_create_promotions.sql
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('CATEGORY', 'PRODUCT')),
  target VARCHAR(255) NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL CHECK (discount_percent BETWEEN 0.01 AND 100),
  active BOOLEAN NOT NULL DEFAULT true,
  title VARCHAR(255) NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(active);
CREATE INDEX IF NOT EXISTS idx_promotions_type_target ON promotions(type, target);
