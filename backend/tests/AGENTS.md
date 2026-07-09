# Backend Tests

**Domain:** Jest + Supertest unit tests for Express API

## STRUCTURE
```
tests/
├── app.test.ts           # App bootstrap + health endpoint
├── product.test.ts       # Product CRUD tests
├── order.test.ts         # Order creation + retrieval
└── promotion.test.ts     # Promotion listing + application
```

## CONVENTIONS
- `jest.mock('../src/db')` at top of every test file
- JWT tokens generated inline using same `JWT_SECRET`
- Supertest `request(app)` for HTTP assertions
- No real DB connection — all queries mocked
- Test files: `*.test.ts` in `tests/` directory (not co-located)

## RUNNING
```bash
npm --prefix backend run test                        # all tests
npm --prefix backend run test -- --findRelatedTests  # related to changed files
npm --prefix backend run test -- tests/product.test.ts  # single file
```
