# WhatsApp Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a passwordless authentication system using phone numbers and OTP via Evolution API.

**Architecture:** Express backend with JWT. Temporary OTP storage in the `users` table. Evolution API service for WhatsApp delivery.

**Tech Stack:** Node.js, Express, PostgreSQL, JWT, Axios, React.

---

### Task 1: Database Schema for Users

**Files:**
- Create: `backend/src/db/migrations/003_create_users.sql`

- [ ] **Step 1: Write SQL migration for users table**

```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    distributor_id UUID NOT NULL,
    otp_code VARCHAR(6),
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed a test user
INSERT INTO users (phone, name, distributor_id) 
VALUES ('5588999999999', 'Loja Teste Russas', gen_random_uuid())
ON CONFLICT (phone) DO NOTHING;
```

- [ ] **Step 2: Commit**

---

### Task 2: Evolution API Service

**Files:**
- Create: `backend/src/services/evolution.service.ts`
- Modify: `.env`

- [ ] **Step 1: Add Evolution API variables to .env**

```env
EVOLUTION_URL=http://evolution-api:8080
EVOLUTION_KEY=YOUR_GLOBAL_KEY
EVOLUTION_INSTANCE=Marketplace_Russas
```

- [ ] **Step 2: Implement the service**

```typescript
import axios from 'axios';

export const sendWhatsAppOTP = async (phone: string, code: string) => {
  const url = `${process.env.EVOLUTION_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`;
  const text = `Seu código de acesso ao Marketplace B2B Russas é: ${code}`;
  
  try {
    await axios.post(url, {
      number: phone,
      text: text
    }, {
      headers: { 'apikey': process.env.EVOLUTION_KEY }
    });
  } catch (error) {
    console.error('Failed to send WhatsApp message', error);
    // In dev, we still want to see the code if it fails
    console.log(`[DEV ONLY] OTP for ${phone}: ${code}`);
  }
};
```

- [ ] **Step 3: Commit**

---

### Task 3: Auth Controller & Endpoints

**Files:**
- Create: `backend/src/controllers/auth.controller.ts`
- Create: `backend/src/routes/auth.routes.ts`
- Modify: `backend/src/app.ts`

- [ ] **Step 1: Implement `requestOTP`**
    - Find user by phone.
    - Generate 6-digit code.
    - Update `otp_code` and `otp_expires_at`.
    - Call `evolutionService.sendWhatsAppOTP`.

- [ ] **Step 2: Implement `verifyOTP`**
    - Find user.
    - Check if code matches and is not expired.
    - If valid, generate JWT.
    - Clear OTP from DB.

- [ ] **Step 3: Register routes in `app.ts`**

- [ ] **Step 4: Commit**

---

### Task 4: JWT Middleware

**Files:**
- Create: `backend/src/middleware/auth.middleware.ts`

- [ ] **Step 1: Implement `authenticateJWT` middleware**

- [ ] **Step 2: Apply to `POST /api/orders` for security**

- [ ] **Step 3: Commit**

---

### Task 5: Frontend Auth UI & Persistence

**Files:**
- Create: `frontend/src/pages/Login.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Implement Login page with Phone mask**
- [ ] **Step 2: Implement OTP input view**
- [ ] **Step 3: Store JWT in localStorage and redirect to Home**
- [ ] **Step 4: Add Auth check in App.tsx**

- [ ] **Step 5: Commit**
