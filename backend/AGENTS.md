# Backend — Express API

**Domain:** REST API, PostgreSQL, JWT auth, OTP via WhatsApp

## STRUCTURE
```
backend/
├── src/
│   ├── app.ts            # Express bootstrap: middleware + routes
│   ├── index.ts          # Server listen (BACKEND_PORT env)
│   ├── routes/           # Route definitions (5 domains)
│   ├── controllers/      # Request handlers + input validation
│   ├── models/           # TS interfaces (no ORM)
│   ├── db/               # pg Pool + migrations + seed
│   ├── middleware/        # JWT auth guards
│   └── services/         # External integrations (Evolution API)
├── tests/                # Jest unit tests
├── .eslintrc.json        # @typescript-eslint/no-explicit-any: off
├── jest.config.js        # ts-jest, forceExit, clearMocks
├── tsconfig.json         # CommonJS, ES2022, decorators enabled
└── Dockerfile.dev        # Dev container (nodemon hot reload)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add endpoint | `routes/<domain>.routes.ts` + `controllers/<domain>.controller.ts` | Route mounts in `app.ts` |
| DB query | `db/index.ts` → `query(text, params)` | Raw SQL, parameterized |
| Auth guard | `middleware/auth.middleware.ts` | `authenticateJWT`, `authorizeAdmin` |
| External API | `services/evolution.service.ts` | WhatsApp OTP |
| DB model types | `models/*.ts` | TS interfaces only |
| Migration | `db/migrations/NNN_*.sql` | Numbered, auto-run by Docker |

## CONVENTIONS
- CommonJS module system (`"module": "CommonJS"` in tsconfig)
- Controllers import `query()` from `db/index.ts` directly
- Routes export `express.Router()` instances
- Models are pure TypeScript interfaces, no classes
- Tests mock entire `src/db` module: `jest.mock('../src/db')`

## ANTI-PATTERNS
- `any` types in controller responses — eslint disabled
- JWT secret fallback to `'secret_russas_b2b'` — security risk in prod
- No input validation library (Zod/Joi) — manual checks in controllers
