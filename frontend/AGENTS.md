# Frontend — React PWA

**Domain:** React 18 + Vite + TypeScript + Tailwind CSS

## STRUCTURE
```
frontend/
├── src/
│   ├── App.tsx             # View state router (10 views, no React Router)
│   ├── main.tsx            # React root mount
│   ├── pages/              # View components
│   │   ├── admin/          # 4 admin views
│   │   └── *.tsx           # 6 distributor views
│   ├── context/            # CartContext, ThemeContext
│   └── components/         # Reusable UI (ProductCard, SalesCharts)
├── tests/                  # Playwright E2E
├── .eslintrc.json          # react-hooks/exhaustive-deps: off
├── vite.config.ts          # Vite config
├── tailwind.config.js      # Tailwind setup
├── playwright.config.ts    # E2E config (chromium only)
└── Dockerfile.dev          # Dev container (Vite hot reload)
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Add page | `src/pages/` + register in `App.tsx` | Add to `View` type + conditional render |
| Add admin view | `src/pages/admin/` | Register in `App.tsx` admin section |
| Shared state | `src/context/` | CartContext (localStorage), ThemeContext |
| Reusable UI | `src/components/` | ProductCard, admin/SalesCharts |
| E2E test | `tests/` | Playwright, chromium only |
| Styling | Tailwind + CSS variables in `index.css` | Custom colors: `primary`, `surface` |

## CONVENTIONS
- No React Router — `view` state (`type View`) drives navigation
- Navigation via `setView()` callback, not URL routing
- Auth state in `App` component + `localStorage` (`auth_token`, `auth_user`)
- Cart persists to `localStorage` key `russas_cart`
- Admin auto-redirects to `admin_dashboard` on login
- Bottom nav bar for distributor views, floating admin button

## ANTI-PATTERNS
- `any` types for user/product state in `App.tsx`
- `react-hooks/exhaustive-deps` disabled — potential stale closure bugs
- `@typescript-eslint/no-unused-vars` disabled
- No React Router — URL not shareable/bookmarkable
- `esModuleInterop: false` in tsconfig — may cause import issues
