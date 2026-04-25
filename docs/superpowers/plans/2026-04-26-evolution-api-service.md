# Evolution API Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate with Evolution API to send WhatsApp OTP codes and manage environment variables.

**Architecture:** Create a dedicated service `evolution.service.ts` in the backend that uses `axios` to interact with the Evolution API.

**Tech Stack:** Node.js, TypeScript, Axios, Evolution API.

---

### Task 1: Environment Configuration

**Files:**
- Modify: `.env` (root)

- [ ] **Step 1: Update .env file**

Add the following variables to the root `.env` file:
```env
EVOLUTION_URL=http://evolution-api:8080
EVOLUTION_KEY=YOUR_GLOBAL_KEY
EVOLUTION_INSTANCE=Marketplace_Russas
```

- [ ] **Step 2: Commit changes**

```bash
git add .env
git commit -m "chore(config): add Evolution API environment variables"
```

### Task 2: Install Dependencies

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Install axios in the backend**

Run:
```bash
cd backend && npm install axios
```

- [ ] **Step 2: Commit changes**

```bash
git add backend/package.json backend/package-lock.json
git commit -m "chore(deps): install axios in backend"
```

### Task 3: Implement Evolution Service

**Files:**
- Create: `backend/src/services/evolution.service.ts`

- [ ] **Step 1: Create the service file**

Create `backend/src/services/evolution.service.ts` with the provided implementation:
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
    console.log(`[WhatsApp] OTP sent to ${phone}`);
  } catch (error) {
    console.error('Failed to send WhatsApp message', error);
    // In development, we fallback to log so we can still test without a real API
    console.log(`[DEV FALLBACK] OTP for ${phone}: ${code}`);
  }
};
```

- [ ] **Step 2: Commit changes**

```bash
git add backend/src/services/evolution.service.ts
git commit -m "feat(services): implement Evolution API service for WhatsApp OTP"
```
