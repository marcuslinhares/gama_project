-- Migration: 004_add_user_roles.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'MERCHANT';

-- Set a specific number as admin for testing
UPDATE users SET role = 'ADMIN' WHERE phone = '5588999999999';
