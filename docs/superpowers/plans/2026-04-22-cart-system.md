# Cart System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a persistent shopping cart with tiered pricing logic.

**Architecture:** React Context for state management + LocalStorage for persistence.

**Tech Stack:** React, Lucide Icons.

---

### Task 1: Cart Context & Logic

**Files:**
- Create: `frontend/src/context/CartContext.tsx`
- Modify: `frontend/src/App.tsx`

- [x] **Step 1: Define CartItem and Context types**
- [x] **Step 2: Implement `addItem`, `removeItem`, `updateQuantity` logic**
- [x] **Step 3: Add LocalStorage sync inside a `useEffect`**
- [x] **Step 4: Wrap `App` with `CartProvider`**
- [x] **Step 5: Commit**

### Task 2: Cart UI Page

**Files:**
- Create: `frontend/src/pages/Cart.tsx`
- Modify: `frontend/src/App.tsx`

- [x] **Step 1: Implement Cart list with quantity selectors**
- [x] **Step 2: Create Order Summary section**
- [x] **Step 3: Add "Finalizar Pedido" button**
- [x] **Step 4: Update navigation in `App.tsx` to handle Cart view**
- [x] **Step 5: Commit**

### Task 3: Integration with Product Details

**Files:**
- Modify: `frontend/src/pages/ProductDetails.tsx`

- [x] **Step 1: Use `useCart` hook to trigger `addItem`**
- [x] **Step 2: Add toast/feedback when item is added**
- [x] **Step 3: Commit**
