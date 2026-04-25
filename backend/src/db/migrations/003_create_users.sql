CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    distributor_id UUID NOT NULL,
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed a test user for manual testing later
INSERT INTO users (phone, name, distributor_id) 
VALUES ('5588999999999', 'Loja Teste Russas', gen_random_uuid())
ON CONFLICT (phone) DO NOTHING;
