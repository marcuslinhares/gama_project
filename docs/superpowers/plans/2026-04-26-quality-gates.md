# Quality Gates and Git Hooks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automate quality enforcement using Husky and lint-staged to prevent bad code from being committed.

**Architecture:** Pre-commit hooks executing linting, type-checking, and unit tests across frontend and backend.

**Tech Stack:** Husky, lint-staged, ESLint, TypeScript, Jest.

---

### Task 1: Initialize Husky at Root

**Files:**
- Modify: `package.json` (root)
- Create: `.husky/pre-commit`

- [ ] **Step 1: Install husky and lint-staged as devDependencies at project root**
- [ ] **Step 2: Initialize husky (`npx husky install`) and add the 'prepare' script**
- [ ] **Step 3: Create the pre-commit hook that runs `npx lint-staged`**
- [ ] **Step 4: Commit**

---

### Task 2: Configure lint-staged for Monorepo

**Files:**
- Create: `.lintstagedrc`

- [ ] **Step 1: Create .lintstagedrc in the root to handle file filtering**

```json
{
  "backend/src/**/*.ts": [
    "eslint --fix",
    "npm --prefix backend run test -- --findRelatedTests"
  ],
  "frontend/src/**/*.{ts,tsx}": [
    "eslint --fix"
  ]
}
```

- [ ] **Step 2: Commit**

---

### Task 3: Unified Linting Scripts

**Files:**
- Modify: `backend/package.json`
- Modify: `frontend/package.json`

- [ ] **Step 1: Ensure both directories have a `lint` script**
- [ ] **Step 2: Verify that `npm run lint` works in both directories**
- [ ] **Step 3: Commit**

---

### Task 4: Security Scan Gate

**Files:**
- Modify: `.husky/pre-commit`

- [ ] **Step 1: Add `osv-scanner --lockfile backend/package-lock.json` to the pre-commit hook**
- [ ] **Step 2: Commit**
