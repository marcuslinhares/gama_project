# PROJECT KNOWLEDGE BASE

**Generated:** 2026-05-02
**Commit:** b9e5f67
**Branch:** master

## OVERVIEW
B2B marketplace for Russas/CE. Distributors browse products, place orders, track deliveries. Admin panel manages products, orders, promotions. Stack: React+Vite+TS (frontend), Express+TS (backend), PostgreSQL.

## STRUCTURE
```
gama_project/
├── backend/          # Express API (CommonJS TS)
│   ├── src/          # app.ts (bootstrap), index.ts (server start)
│   ├── tests/        # Jest + Supertest unit tests
│   └── Dockerfile.dev
├── frontend/         # React PWA (ESM TS, Vite)
│   ├── src/pages/    # View components (state-based routing, no React Router)
│   ├── src/context/  # CartContext, ThemeContext
│   └── tests/        # Playwright E2E
├── docker-compose.yml  # db (5434:5432), api, client
└── docs/superpowers/   # specs, plans
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add API endpoint | `backend/src/routes/` + `backend/src/controllers/` | Route + controller pair |
| Add frontend page | `frontend/src/pages/` + `App.tsx` | Register view type + conditional render |
| Database schema | `backend/src/db/migrations/` | Numbered SQL, run in filename order |
| Auth logic | `backend/src/middleware/auth.middleware.ts` | JWT verify, `authenticateJWT`, `authorizeAdmin` |
| WhatsApp OTP | `backend/src/services/evolution.service.ts` | Evolution API integration |
| Cart state | `frontend/src/context/CartContext.tsx` | localStorage persistence, tiered pricing |
| Admin panel | `frontend/src/pages/admin/` | 4 views: dashboard, orders, promos, products |

## CODE MAP
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `app` | Express | `backend/src/app.ts` | Bootstrap: middleware + route mounting |
| `query()` | fn | `backend/src/db/index.ts` | pg Pool wrapper, raw SQL |
| `authenticateJWT` | middleware | `backend/src/middleware/auth.middleware.ts` | JWT extraction + verify |
| `authorizeAdmin` | middleware | `backend/src/middleware/auth.middleware.ts` | Role guard |
| `CartProvider` | React ctx | `frontend/src/context/CartContext.tsx` | Cart state + tiered pricing |
| `App` | component | `frontend/src/App.tsx` | View state router (10 views) |

## CONVENTIONS
- No React Router — `view` state in `App.tsx` drives navigation via `setView()`
- No ORM — raw parameterized SQL via `query(text, params)`
- Migrations: numbered `001_*.sql` in `backend/src/db/migrations/`, auto-run via Docker initdb.d
- Backend tests: Jest + Supertest, `jest.mock('../src/db')` always, JWT tokens inline
- Pre-commit: lint-staged + husky, staged `.ts` → backend lint + `--findRelatedTests`
- ESLint: both `@typescript-eslint/no-explicit-any` set to `off`

## ANTI-PATTERNS (THIS PROJECT)
- `any` types used freely — `no-explicit-any` disabled in both frontend/backend
- `react-hooks/exhaustive-deps` disabled in frontend
- JWT secret defaults to `secret_russas_b2b` — change in production
- No monorepo tooling (no workspaces field in root package.json)
- Root `package.json` has `"directories": { "doc": "docs" }` — likely typo, no docs dir at root level
- DB port mapped to 5434 (non-standard) in docker-compose

## UNIQUE STYLES
- OTP-based auth (no passwords) — WhatsApp via Evolution API
- Cart uses localStorage key `russas_cart`
- Admin users auto-redirected to `admin_dashboard` on login
- Bottom nav in frontend, admin has floating "Painel Admin" button
- Tiered pricing logic in `CartContext` — price calculated at quantity

## COMMANDS
```bash
# Full stack (Docker)
docker compose up          # start all
docker compose up --build  # rebuild

# Backend
npm --prefix backend run dev      # nodemon + ts-node
npm --prefix backend run build    # tsc → dist/
npm --prefix backend run test     # jest
npm --prefix backend run seed     # seed DB

# Frontend
npm --prefix frontend run dev     # Vite
npm --prefix frontend run build   # tsc + vite → dist/
npx playwright test               # E2E
```

## NOTES
- Frontend/backend are separate npm packages, no workspace hoisting
- Backend module: CommonJS. Frontend module: ESNext
- Docker mounts `./backend:/app` and `/app/node_modules` as volume for hot reload
- Coverage reports in `backend/coverage/lcov-report/`
