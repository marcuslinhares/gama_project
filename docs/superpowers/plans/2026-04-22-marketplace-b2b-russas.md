# Marketplace B2B Russas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Whitelabel B2B Marketplace PWA for distributors in Russas/CE.

**Architecture:** Node.js (Express) backend with PostgreSQL. React frontend (PWA) with Tailwind CSS.

**Tech Stack:** React, TypeScript, Node.js, Express, PostgreSQL, Tailwind CSS, Jest, Playwright.

---

### Task 1: Setup Backend Foundation

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/app.ts`
- Create: `backend/src/index.ts`

- [x] **Step 1: Create package.json with dependencies**
- [x] **Step 2: Initialize TypeScript configuration**
- [x] **Step 3: Create Express app instance**
- [x] **Step 4: Create entry point and start server**
- [x] **Step 5: Commit**

### Task 2: Product Model & Database Schema

**Files:**
- Create: `backend/src/models/product.model.ts`
- Create: `backend/src/db/migrations/001_create_products.sql`

- [x] **Step 1: Define Product interface with tiered pricing**
- [x] **Step 2: Write SQL migration for products table**
- [x] **Step 3: Commit**

### Task 3: Product API Endpoints (TDD)

**Files:**
- Create: `backend/src/controllers/product.controller.ts`
- Create: `backend/src/routes/product.routes.ts`
- Create: `backend/tests/product.test.ts`

- [ ] **Step 1: Write failing test for GET /api/products**
- [ ] **Step 2: Implement GET /api/products with mock data**
- [ ] **Step 3: Verify test passes**
- [ ] **Step 4: Write failing test for GET /api/products/:id**
- [ ] **Step 5: Implement GET /api/products/:id**
- [ ] **Step 6: Verify test passes**
- [ ] **Step 7: Commit**

### Task 4: Frontend Foundation & Design System

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/src/index.css`

- [ ] **Step 1: Initialize Vite/React project**
- [ ] **Step 2: Configure Tailwind with Nexus Merchant tokens**
- [ ] **Step 3: Setup global styles (No-Line Rule)**
- [ ] **Step 4: Commit**

### Task 5: Home Page & Product Cards

**Files:**
- Create: `frontend/src/components/ProductCard.tsx`
- Create: `frontend/src/pages/Home.tsx`

- [ ] **Step 1: Implement ProductCard component**
- [ ] **Step 2: Create Home page with search and categories**
- [ ] **Step 3: Commit**

### Task 6: Product Details Page

**Files:**
- Create: `frontend/src/pages/ProductDetails.tsx`

- [ ] **Step 1: Implement ProductDetails with tiered pricing table**
- [ ] **Step 2: Add quantity selector and add-to-cart logic**
- [ ] **Step 3: Commit**

### Task 7: PWA Manifest & Service Worker

**Files:**
- Create: `frontend/public/manifest.json`
- Modify: `frontend/src/main.tsx`

- [ ] **Step 1: Create manifest.json with Russas B2B icons**
- [ ] **Step 2: Register service worker for offline support**
- [ ] **Step 3: Commit**
