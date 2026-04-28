# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

B2B marketplace for Russas/CE. Distributors browse products, place orders, and track deliveries. Admins manage products, orders, promotions, and view sales reports.

## Commands

### Full stack (Docker)
```bash
docker compose up          # start all services (db + api + client)
docker compose up --build  # rebuild images
```

### Backend (`backend/`)
```bash
npm run dev      # nodemon ts-node watch
npm run build    # tsc → dist/
npm run test     # jest
npm run lint     # eslint src/**/*.ts
npm run seed     # ts-node src/db/seed.ts
```

Run a single test file:
```bash
npm --prefix backend run test -- backend/tests/product.test.ts
```

Run tests related to changed files (what lint-staged does):
```bash
npm --prefix backend run test -- --findRelatedTests backend/src/controllers/product.controller.ts
```

### Frontend (`frontend/`)
```bash
npm run dev      # Vite dev server
npm run build    # tsc + vite build → dist/
npm run lint     # eslint
npx playwright test          # E2E tests
npx playwright test --headed # headed browser
```

## Architecture

### Monorepo layout
```
backend/   Express + TypeScript API
frontend/  React + TypeScript PWA (Vite)
docker-compose.yml  orchestrates db (postgres:15), api, client
```

### Backend layers
```
src/index.ts          → express listen
src/app.ts            → express app, route mounting
src/routes/           → route definitions (auth, product, order, admin, promotion)
src/controllers/      → request handlers, input validation
src/models/           → TypeScript interfaces (no ORM — raw SQL)
src/db/index.ts       → pg Pool; exports query() and getClient()
src/db/migrations/    → numbered SQL files, auto-run by Docker via initdb.d
src/middleware/       → authenticateJWT, authorizeAdmin
src/services/evolution.service.ts  → WhatsApp OTP via Evolution API
```

### API route map
| Prefix | Auth | Notes |
|--------|------|-------|
| `POST /api/auth/request` | none | request OTP (WhatsApp) |
| `POST /api/auth/verify` | none | verify OTP → JWT |
| `GET /api/products` | none | public product list |
| `GET /api/orders` | JWT | user's own orders |
| `POST /api/orders/preview` | none | cart preview (promotions applied) |
| `POST /api/orders` | JWT | create order |
| `GET /api/promotions` | JWT | active promotions |
| `/api/admin/*` | JWT + ADMIN role | all admin endpoints |

### Auth flow
OTP-based, no passwords. `auth.controller` calls `evolution.service` to send WhatsApp OTP. On verify, issues JWT with `{ userId, distributorId, role }`. Secret: `JWT_SECRET` env var (default `secret_russas_b2b` — change in prod). Middleware exported from `auth.middleware.ts`: `authenticateJWT` and `authorizeAdmin`.

### Frontend routing
No React Router. `App.tsx` manages a `view` state (type `View`). All navigation is via `setView()`. Views: `home | details | cart | checkout | success | orders | admin_dashboard | admin_orders | admin_promo | admin_products`. Auth state (`token`, `user`) lives in `App` state + `localStorage`. Admin users are auto-redirected to `admin_dashboard` on login.

### Contexts
- `CartContext` — cart items, totalItems, clearCart
- `ThemeContext` — theme toggle

### Database
PostgreSQL via `pg` Pool. No ORM. Queries use parameterised `query(text, params)` from `src/db/index.ts`. Schema applied sequentially via migrations in `backend/src/db/migrations/` (Docker mounts these as initdb scripts, so they run in filename order on first start).

### Pre-commit (lint-staged + husky)
Staged `.ts` files → backend lint + `--findRelatedTests`. Staged `.ts/.tsx` frontend files → frontend lint.

## Environment variables

Root `.env` consumed by Docker Compose:
```
POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
BACKEND_PORT   (maps to container :3001)
FRONTEND_PORT  (maps to container :5173)
```

Backend `backend/.env` consumed by the Express process:
```
DATABASE_URL   postgresql://user:pass@host:5432/db
JWT_SECRET
EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE
```

## Testing conventions

Backend tests use Jest + Supertest. The db module (`src/db`) is always mocked (`jest.mock('../src/db')`). Tests generate JWT tokens inline using the same `JWT_SECRET`. No real DB connection in unit tests.

Frontend E2E tests use Playwright (`frontend/tests/`, `playwright.config.ts`).
