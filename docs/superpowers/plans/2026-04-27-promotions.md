# Promotions System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow the distributor admin to create category/product discounts shown as badges + strikethrough prices on the lojista app and a dynamic banner on the home screen.

**Architecture:** `promotions` DB table + REST API (public read, admin CRUD). `GET /api/products` JOINs promotions to return `discountPercent` per product. Frontend computes discounted display price client-side. New `AdminPromos` page for management.

**Tech Stack:** PostgreSQL, Node.js/Express/TypeScript, React, Tailwind CSS, lucide-react.

---

### Task 1: DB Migration

**Files:**
- Create: `backend/src/db/migrations/005_create_promotions.sql`

- [ ] **Step 1: Write migration file**

```sql
-- Migration: 005_create_promotions.sql
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('CATEGORY', 'PRODUCT')),
  target VARCHAR(255) NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL CHECK (discount_percent BETWEEN 0.01 AND 100),
  active BOOLEAN NOT NULL DEFAULT true,
  title VARCHAR(255) NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(active);
CREATE INDEX IF NOT EXISTS idx_promotions_type_target ON promotions(type, target);
```

- [ ] **Step 2: Run migration against the running Docker DB**

```bash
docker compose -f /home/marcus/Projetos/gama_project/docker-compose.yml exec db \
  psql -U postgres -d marketplace -f /docker-entrypoint-initdb.d/005_create_promotions.sql
```

If error `file not found` (because file is on host, not container), use:

```bash
docker compose -f /home/marcus/Projetos/gama_project/docker-compose.yml exec -T db \
  psql -U postgres -d marketplace < /home/marcus/Projetos/gama_project/backend/src/db/migrations/005_create_promotions.sql
```

Expected output: `CREATE TABLE`, `CREATE INDEX`, `CREATE INDEX`

- [ ] **Step 3: Commit**

```bash
git -C /home/marcus/Projetos/gama_project add backend/src/db/migrations/005_create_promotions.sql
git -C /home/marcus/Projetos/gama_project commit -m "feat(promotions): add promotions DB migration"
```

---

### Task 2: Backend — Promotion model + controller + routes

**Files:**
- Create: `backend/src/models/promotion.model.ts`
- Create: `backend/src/controllers/promotion.controller.ts`
- Create: `backend/src/routes/promotion.routes.ts`
- Modify: `backend/src/routes/admin.routes.ts`
- Modify: `backend/src/app.ts`

- [ ] **Step 1: Create `backend/src/models/promotion.model.ts`**

```typescript
export type PromotionType = 'CATEGORY' | 'PRODUCT';

export interface Promotion {
  id: string;
  type: PromotionType;
  target: string;
  discountPercent: number;
  active: boolean;
  title: string;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
}
```

- [ ] **Step 2: Create `backend/src/controllers/promotion.controller.ts`**

```typescript
import { Request, Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth.middleware';

const ACTIVE_CONDITION = `
  pr.active = true
  AND (pr.starts_at IS NULL OR pr.starts_at <= NOW())
  AND (pr.ends_at IS NULL OR pr.ends_at > NOW())
`;

const mapRow = (r: any) => ({ ...r, discountPercent: Number(r.discountPercent) });

export const getActivePromotions = async (req: Request, res: Response) => {
  try {
    const { rows } = await query(`
      SELECT id, type, target, discount_percent AS "discountPercent", title,
             starts_at AS "startsAt", ends_at AS "endsAt"
      FROM promotions pr
      WHERE ${ACTIVE_CONDITION}
      ORDER BY created_at DESC
    `);
    res.status(200).json(rows.map(mapRow));
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllPromotions = async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await query(`
      SELECT id, type, target, discount_percent AS "discountPercent", active, title,
             starts_at AS "startsAt", ends_at AS "endsAt", created_at AS "createdAt"
      FROM promotions
      ORDER BY created_at DESC
    `);
    res.status(200).json(rows.map(mapRow));
  } catch (error) {
    console.error('Error fetching all promotions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPromotion = async (req: AuthRequest, res: Response) => {
  const { type, target, discountPercent, title, startsAt, endsAt } = req.body;

  if (!['CATEGORY', 'PRODUCT'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type. Must be CATEGORY or PRODUCT' });
  }
  if (!target || !title) {
    return res.status(400).json({ message: 'target and title are required' });
  }
  const discount = Number(discountPercent);
  if (!discount || discount <= 0 || discount > 100) {
    return res.status(400).json({ message: 'discountPercent must be between 0.01 and 100' });
  }
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
    return res.status(400).json({ message: 'endsAt must be after startsAt' });
  }

  try {
    const { rows } = await query(
      `INSERT INTO promotions (type, target, discount_percent, title, starts_at, ends_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, type, target, discount_percent AS "discountPercent", active, title,
                 starts_at AS "startsAt", ends_at AS "endsAt", created_at AS "createdAt"`,
      [type, target, discount, title, startsAt || null, endsAt || null]
    );
    res.status(201).json(mapRow(rows[0]));
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePromotion = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { type, target, discountPercent, title, active, startsAt, endsAt } = req.body;

  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (type !== undefined) { fields.push(`type = $${idx++}`); values.push(type); }
  if (target !== undefined) { fields.push(`target = $${idx++}`); values.push(target); }
  if (discountPercent !== undefined) { fields.push(`discount_percent = $${idx++}`); values.push(Number(discountPercent)); }
  if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
  if (active !== undefined) { fields.push(`active = $${idx++}`); values.push(active); }
  if (startsAt !== undefined) { fields.push(`starts_at = $${idx++}`); values.push(startsAt || null); }
  if (endsAt !== undefined) { fields.push(`ends_at = $${idx++}`); values.push(endsAt || null); }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }
  values.push(id);

  try {
    const { rows, rowCount } = await query(
      `UPDATE promotions SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, type, target, discount_percent AS "discountPercent", active, title,
                 starts_at AS "startsAt", ends_at AS "endsAt"`,
      values
    );
    if (rowCount === 0) return res.status(404).json({ message: 'Promotion not found' });
    res.status(200).json(mapRow(rows[0]));
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePromotion = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const { rowCount } = await query('DELETE FROM promotions WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Promotion not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
```

- [ ] **Step 3: Create `backend/src/routes/promotion.routes.ts`**

```typescript
import { Router } from 'express';
import { getActivePromotions } from '../controllers/promotion.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, getActivePromotions);

export default router;
```

- [ ] **Step 4: Add admin promotion routes to `backend/src/routes/admin.routes.ts`**

Add to existing imports:
```typescript
import { getAllOrders, updateOrderStatus, getAdminStats, getSalesReport } from '../controllers/admin.controller';
import { getAllPromotions, createPromotion, updatePromotion, deletePromotion } from '../controllers/promotion.controller';
```

Add after existing routes (before `export default router`):
```typescript
router.get('/promotions', getAllPromotions);
router.post('/promotions', createPromotion);
router.patch('/promotions/:id', updatePromotion);
router.delete('/promotions/:id', deletePromotion);
```

- [ ] **Step 5: Register `/api/promotions` in `backend/src/app.ts`**

Add import:
```typescript
import promotionRoutes from './routes/promotion.routes';
```

Add route (after existing routes):
```typescript
app.use('/api/promotions', promotionRoutes);
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd /home/marcus/Projetos/gama_project/backend && npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 7: Commit**

```bash
git -C /home/marcus/Projetos/gama_project add \
  backend/src/models/promotion.model.ts \
  backend/src/controllers/promotion.controller.ts \
  backend/src/routes/promotion.routes.ts \
  backend/src/routes/admin.routes.ts \
  backend/src/app.ts
git -C /home/marcus/Projetos/gama_project commit -m "feat(promotions): add promotion controller, routes, and model"
```

---

### Task 3: Update product.controller.ts with discount JOIN

**Files:**
- Modify: `backend/src/controllers/product.controller.ts`

- [ ] **Step 1: Replace `getProducts` with discount-aware version**

Replace the entire `getProducts` function:

```typescript
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { rows } = await query(`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.category, 
        p.sku, 
        p.stock, 
        p.unit_price AS "unitPrice", 
        p.tiered_pricing AS "tieredPricing",
        COALESCE(
          (
            SELECT MAX(pr.discount_percent)
            FROM promotions pr
            WHERE pr.active = true
              AND (pr.starts_at IS NULL OR pr.starts_at <= NOW())
              AND (pr.ends_at IS NULL OR pr.ends_at > NOW())
              AND (
                (pr.type = 'PRODUCT' AND pr.target = p.id::text)
                OR (pr.type = 'CATEGORY' AND pr.target = p.category)
              )
          ), 0
        ) AS "discountPercent"
      FROM products p
      ORDER BY p.name ASC
    `);
    res.status(200).json(rows.map(r => ({ ...r, discountPercent: Number(r.discountPercent) })));
  } catch {
    res.status(500).json({ message: 'Error fetching products' });
  }
};
```

- [ ] **Step 2: Replace `getProductById` with discount-aware version**

Replace the entire `getProductById` function:

```typescript
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rows } = await query(`
      SELECT 
        p.id, 
        p.name, 
        p.description, 
        p.category, 
        p.sku, 
        p.stock, 
        p.unit_price AS "unitPrice", 
        p.tiered_pricing AS "tieredPricing",
        COALESCE(
          (
            SELECT MAX(pr.discount_percent)
            FROM promotions pr
            WHERE pr.active = true
              AND (pr.starts_at IS NULL OR pr.starts_at <= NOW())
              AND (pr.ends_at IS NULL OR pr.ends_at > NOW())
              AND (
                (pr.type = 'PRODUCT' AND pr.target = p.id::text)
                OR (pr.type = 'CATEGORY' AND pr.target = p.category)
              )
          ), 0
        ) AS "discountPercent"
      FROM products p
      WHERE p.id = $1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const row = rows[0];
    res.status(200).json({ ...row, discountPercent: Number(row.discountPercent) });
  } catch {
    res.status(500).json({ message: 'Error fetching product' });
  }
};
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /home/marcus/Projetos/gama_project/backend && npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git -C /home/marcus/Projetos/gama_project add backend/src/controllers/product.controller.ts
git -C /home/marcus/Projetos/gama_project commit -m "feat(promotions): add discount JOIN to product endpoints"
```

---

### Task 4: Backend tests

**Files:**
- Modify: `backend/tests/product.test.ts`
- Create: `backend/tests/promotion.test.ts`

- [ ] **Step 1: Update `backend/tests/product.test.ts` to handle new `discountPercent` field**

The existing tests mock `query` to return `mockDbProducts`. The new SQL is different (subquery). Update the mock to also return `discountPercent`:

In `product.test.ts`, update `mockDbProducts` to include `discountPercent`:

```typescript
const mockDbProducts = [
  {
    id: '1',
    name: 'Cimento CP II 50kg',
    description: 'Cimento Portland composto de alta resistência.',
    category: 'Construção',
    sku: 'CIM-001',
    stock: 500,
    unitPrice: '35.50',
    tieredPricing: [
      { minQty: 10, price: 33.90 },
      { minQty: 50, price: 31.50 },
      { minQty: 100, price: 29.90 }
    ],
    discountPercent: 0
  }
];
```

Update `GET /api/products` test to verify `discountPercent` is present:

```typescript
it('should return a list of products with discountPercent', async () => {
  (db.query as jest.Mock).mockResolvedValue({ rows: mockDbProducts });
  
  const response = await request(app).get('/api/products');
  
  expect(response.status).toBe(200);
  expect(db.query).toHaveBeenCalledWith(expect.stringContaining('discountPercent'));
  expect(response.body[0]).toHaveProperty('discountPercent', 0);
});
```

- [ ] **Step 2: Create `backend/tests/promotion.test.ts`**

```typescript
import request from 'supertest';
import app from '../src/app';
import * as db from '../src/db';
import jwt from 'jsonwebtoken';

jest.mock('../src/db', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
}));

const JWT_SECRET = process.env.JWT_SECRET || 'secret_russas_b2b';

const userToken = jwt.sign(
  { userId: 'user-123', distributorId: 'dist-1', role: 'USER' },
  JWT_SECRET
);

const adminToken = jwt.sign(
  { userId: 'admin-1', distributorId: 'dist-1', role: 'ADMIN' },
  JWT_SECRET
);

const mockPromotion = {
  id: 'promo-uuid',
  type: 'CATEGORY',
  target: 'Construção',
  discountPercent: '15.00',
  active: true,
  title: '15% OFF em Construção',
  startsAt: null,
  endsAt: null,
  createdAt: new Date().toISOString(),
};

describe('Promotion API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /api/promotions', () => {
    it('should return active promotions for authenticated user', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [mockPromotion] });

      const res = await request(app)
        .get('/api/promotions')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body[0]).toHaveProperty('discountPercent', 15);
      expect(res.body[0]).toHaveProperty('title', '15% OFF em Construção');
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/promotions');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/admin/promotions', () => {
    it('should create promotion as admin', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [mockPromotion] });

      const res = await request(app)
        .post('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'CATEGORY',
          target: 'Construção',
          discountPercent: 15,
          title: '15% OFF em Construção',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('discountPercent', 15);
    });

    it('should return 400 for invalid type', async () => {
      const res = await request(app)
        .post('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ type: 'INVALID', target: 'x', discountPercent: 10, title: 'Test' });

      expect(res.status).toBe(400);
    });

    it('should return 400 for discount > 100', async () => {
      const res = await request(app)
        .post('/api/admin/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ type: 'CATEGORY', target: 'Construção', discountPercent: 110, title: 'Test' });

      expect(res.status).toBe(400);
    });

    it('should return 403 for non-admin user', async () => {
      const res = await request(app)
        .post('/api/admin/promotions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ type: 'CATEGORY', target: 'Construção', discountPercent: 15, title: 'Test' });

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/admin/promotions/:id', () => {
    it('should toggle active status', async () => {
      const updated = { ...mockPromotion, active: false, discountPercent: '15.00' };
      (db.query as jest.Mock).mockResolvedValue({ rows: [updated], rowCount: 1 });

      const res = await request(app)
        .patch('/api/admin/promotions/promo-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ active: false });

      expect(res.status).toBe(200);
    });

    it('should return 400 when no fields provided', async () => {
      const res = await request(app)
        .patch('/api/admin/promotions/promo-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/admin/promotions/:id', () => {
    it('should delete promotion', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

      const res = await request(app)
        .delete('/api/admin/promotions/promo-uuid')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(204);
    });

    it('should return 404 for non-existent promotion', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

      const res = await request(app)
        .delete('/api/admin/promotions/non-existent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
```

- [ ] **Step 3: Run all backend tests**

```bash
cd /home/marcus/Projetos/gama_project/backend && npm test -- --no-coverage 2>&1 | tail -20
```

Expected:
```
Test Suites: 5 passed, 5 total
Tests:       N passed, N total
```

- [ ] **Step 4: Commit**

```bash
git -C /home/marcus/Projetos/gama_project add backend/tests/product.test.ts backend/tests/promotion.test.ts
git -C /home/marcus/Projetos/gama_project commit -m "test(promotions): add promotion API tests and update product tests"
```

---

### Task 5: Frontend — ProductCard + ProductDetails discount display

**Files:**
- Modify: `frontend/src/components/ProductCard.tsx`
- Modify: `frontend/src/pages/ProductDetails.tsx`

- [ ] **Step 1: Replace `frontend/src/components/ProductCard.tsx` entirely**

```tsx
import React from 'react';
import { Plus } from 'lucide-react';

interface TieredPrice { minQty: number; price: number; }
interface Product {
  id: string; name: string; sku: string; category: string;
  stock: number; unitPrice: number; tieredPricing: TieredPrice[];
  image?: string; discountPercent?: number;
}
interface ProductCardProps { product: Product; onClick: () => void; }

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const basePrice = Number(product.tieredPricing[product.tieredPricing.length - 1].price);
  const hasDiscount = (product.discountPercent ?? 0) > 0;
  const discountedPrice = hasDiscount
    ? Math.round(basePrice * (1 - (product.discountPercent! / 100)) * 100) / 100
    : null;

  return (
    <div onClick={onClick} className="card p-4 flex flex-col h-full group cursor-pointer active:scale-[0.98] transition-all">
      <div className="relative bg-surface-low rounded-md h-40 mb-4 flex items-center justify-center overflow-hidden">
        {hasDiscount && (
          <span className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg">
            {product.discountPercent}% OFF
          </span>
        )}
        {product.image ? (
          <img src={product.image} alt={product.name} className="object-cover h-full w-full" />
        ) : (
          <div className="text-surface-high font-bold text-lg">SEM IMAGEM</div>
        )}
      </div>
      <div className="flex-grow">
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{product.category}</span>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1 line-clamp-2 leading-tight">{product.name}</h3>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">SKU: {product.sku}</p>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block">A partir de</span>
          {hasDiscount ? (
            <>
              <span className="text-sm text-slate-400 dark:text-slate-500 line-through">
                R$ {basePrice.toFixed(2)}
              </span>
              <span className="text-lg font-bold text-primary block">
                R$ {discountedPrice!.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-primary">
              R$ {basePrice.toFixed(2)}
            </span>
          )}
          <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">/ Cx</span>
        </div>
        <button className="bg-primary hover:bg-primary-container text-white p-2 rounded-lg transition-colors shadow-md group-active:scale-95">
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
```

- [ ] **Step 2: Update price section in `frontend/src/pages/ProductDetails.tsx`**

In `ProductDetails.tsx`, find the price section (around line 66-78) and replace:

```tsx
// Add discountPercent to the Product interface:
interface Product {
  id: string; name: string; sku: string; category: string;
  stock: number; unitPrice: number; tieredPricing: TieredPrice[];
  description?: string; image?: string; discountPercent?: number;
}
```

Replace the price display section (lines ~71-77):
```tsx
// Before the tiered pricing table, find:
<div className="mt-6 flex items-baseline gap-2">
  <span className="text-3xl font-bold text-primary">R$ {getCurrentPrice().toFixed(2)}</span>
  <span className="text-sm text-slate-500">/ Caixa</span>
</div>
<p className="text-xs text-slate-400 mt-1">
  Preço por unidade: R$ {(getCurrentPrice() / 24).toFixed(2)} (Ref. Caixa c/ 24)
</p>

// Replace with:
{(product.discountPercent ?? 0) > 0 && (
  <div className="mt-4 inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-xl">
    <span className="text-red-500 font-black text-sm">{product.discountPercent}% OFF</span>
  </div>
)}
<div className="mt-2 flex items-baseline gap-2">
  {(product.discountPercent ?? 0) > 0 && (
    <span className="text-lg text-slate-400 dark:text-slate-500 line-through">
      R$ {getCurrentPrice().toFixed(2)}
    </span>
  )}
  <span className="text-3xl font-bold text-primary">
    R$ {(product.discountPercent ?? 0) > 0
      ? (Math.round(getCurrentPrice() * (1 - product.discountPercent! / 100) * 100) / 100).toFixed(2)
      : getCurrentPrice().toFixed(2)}
  </span>
  <span className="text-sm text-slate-500 dark:text-slate-400">/ Caixa</span>
</div>
<p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
  Preço por unidade: R$ {(getCurrentPrice() / 24).toFixed(2)} (Ref. Caixa c/ 24)
</p>
```

- [ ] **Step 3: Commit**

```bash
git -C /home/marcus/Projetos/gama_project add \
  frontend/src/components/ProductCard.tsx \
  frontend/src/pages/ProductDetails.tsx
git -C /home/marcus/Projetos/gama_project commit -m "feat(promotions): show discount badge and strikethrough price on product cards"
```

---

### Task 6: Frontend — Home banner dynamic

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

- [ ] **Step 1: Add promotions fetch and dynamic banner to `Home.tsx`**

Add `promotions` state and fetch after the existing `products` fetch in the `useEffect`:

```tsx
// Add state (after existing useState declarations):
const [promotions, setPromotions] = useState<any[]>([]);
```

Add second useEffect for promotions (after the products useEffect):

```tsx
useEffect(() => {
  const token = localStorage.getItem('auth_token');
  fetch('/api/promotions', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => Array.isArray(data) ? setPromotions(data) : setPromotions([]))
    .catch(() => setPromotions([]));
}, []);
```

Replace the hardcoded Banner section with dynamic version:

```tsx
{/* Banner — dynamic promotion */}
{promotions.length > 0 && (() => {
  const promo = promotions[0];
  return (
    <section className="bg-primary-container rounded-2xl p-6 text-white mb-8 overflow-hidden relative">
      <div className="relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Ofertas da Semana</span>
        <h2 className="text-2xl font-bold mt-1">{promo.title}</h2>
        <button
          onClick={() => promo.type === 'CATEGORY' && setSelectedCategory(promo.target)}
          className="mt-4 bg-white text-primary text-xs font-bold px-4 py-2 rounded-lg"
        >
          Aproveitar
        </button>
      </div>
      <div className="absolute right-[-20px] bottom-[-20px] w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
    </section>
  );
})()}
```

- [ ] **Step 2: Commit**

```bash
git -C /home/marcus/Projetos/gama_project add frontend/src/pages/Home.tsx
git -C /home/marcus/Projetos/gama_project commit -m "feat(promotions): dynamic home banner from active promotions"
```

---

### Task 7: Frontend — AdminPromos page

**Files:**
- Create: `frontend/src/pages/admin/AdminPromos.tsx`

- [ ] **Step 1: Create `frontend/src/pages/admin/AdminPromos.tsx`**

```tsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Trash2, LogOut } from 'lucide-react';

const CATEGORIES = ['Construção', 'Alimentos', 'Limpeza', 'Higiene', 'Bebidas'];

interface Promotion {
  id: string; type: 'CATEGORY' | 'PRODUCT'; target: string;
  discountPercent: number; active: boolean; title: string;
  startsAt?: string; endsAt?: string;
}

interface AdminPromosProps { onBack: () => void; onLogout: () => void; }

const emptyForm = { type: 'CATEGORY', target: '', discountPercent: '', title: '', startsAt: '', endsAt: '' };

const AdminPromos: React.FC<AdminPromosProps> = ({ onBack, onLogout }) => {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('auth_token');
  const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/promotions', { headers: authHeaders });
      const data = await res.json();
      setPromos(Array.isArray(data) ? data : []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchPromos(); }, []);

  const handleToggle = async (promo: Promotion) => {
    try {
      const res = await fetch(`/api/admin/promotions/${promo.id}`, {
        method: 'PATCH', headers: authHeaders,
        body: JSON.stringify({ active: !promo.active })
      });
      if (res.ok) setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, active: !p.active } : p));
    } catch { alert('Erro ao atualizar'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remover esta promoção?')) return;
    try {
      const res = await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) setPromos(prev => prev.filter(p => p.id !== id));
    } catch { alert('Erro ao remover'); }
  };

  const handleSave = async () => {
    if (!form.title || !form.target || !form.discountPercent) {
      setFormError('Título, target e desconto são obrigatórios'); return;
    }
    const discount = Number(form.discountPercent);
    if (discount <= 0 || discount > 100) {
      setFormError('Desconto deve ser entre 0.01 e 100'); return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({
          type: form.type, target: form.target, discountPercent: discount,
          title: form.title,
          startsAt: form.startsAt || undefined, endsAt: form.endsAt || undefined,
        })
      });
      if (!res.ok) { const err = await res.json(); setFormError(err.message); return; }
      const newPromo = await res.json();
      setPromos(prev => [newPromo, ...prev]);
      setShowForm(false); setForm(emptyForm); setFormError('');
    } catch { setFormError('Erro ao salvar'); } finally { setSaving(false); }
  };

  const inputClass = "w-full bg-surface-low rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-primary/20";
  const labelClass = "text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1";

  return (
    <div className="bg-slate-50 dark:bg-surface min-h-screen p-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="bg-white dark:bg-surface-lowest p-2 rounded-lg shadow-sm"><ChevronLeft /></button>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Promoções</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-xl shadow-md">
            <Plus size={18} /> Nova Promoção
          </button>
          <button onClick={onLogout}
            className="flex items-center gap-2 bg-white dark:bg-surface-lowest text-red-500 font-bold px-4 py-2 rounded-xl shadow-sm border border-red-50">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </header>

      {showForm && (
        <div className="bg-white dark:bg-surface-lowest rounded-3xl p-6 shadow-xl mb-8 border border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-6">Nova Promoção</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo</label>
              <select value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value, target: '' }))}
                className={inputClass}>
                <option value="CATEGORY">Por Categoria</option>
                <option value="PRODUCT">Por Produto (UUID)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>{form.type === 'CATEGORY' ? 'Categoria' : 'UUID do Produto'}</label>
              {form.type === 'CATEGORY' ? (
                <select value={form.target}
                  onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                  className={inputClass}>
                  <option value="">Selecione...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className={inputClass} />
              )}
            </div>
            <div>
              <label className={labelClass}>Título do Banner</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: 15% OFF em Construção" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Desconto %</label>
              <input type="number" min="0.01" max="100" step="0.01"
                value={form.discountPercent}
                onChange={e => setForm(f => ({ ...f, discountPercent: e.target.value }))}
                placeholder="15" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Início (opcional)</label>
              <input type="datetime-local" value={form.startsAt}
                onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fim (opcional)</label>
              <input type="datetime-local" value={form.endsAt}
                onChange={e => setForm(f => ({ ...f, endsAt: e.target.value }))}
                className={inputClass} />
            </div>
          </div>
          {formError && <p className="text-red-500 text-xs font-bold mt-3">{formError}</p>}
          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving}
              className="bg-primary text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button onClick={() => { setShowForm(false); setFormError(''); setForm(emptyForm); }}
              className="bg-surface-low text-slate-700 dark:text-slate-300 font-bold px-6 py-3 rounded-xl">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white dark:bg-surface-lowest rounded-xl animate-pulse" />)}
        </div>
      ) : promos.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          Nenhuma promoção cadastrada.
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-lowest rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-surface-low border-b border-slate-100 dark:border-slate-700">
              <tr>
                {['Título', 'Tipo', 'Target', 'Desconto', 'Ativo', 'Ações'].map(h => (
                  <th key={h} className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {promos.map(promo => (
                <tr key={promo.id} className="hover:bg-slate-50 dark:hover:bg-surface-low transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{promo.title}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                      promo.type === 'CATEGORY' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    }`}>
                      {promo.type === 'CATEGORY' ? 'Categoria' : 'Produto'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{promo.target}</td>
                  <td className="px-4 py-3 font-bold text-primary">{promo.discountPercent}%</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(promo)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${promo.active ? 'bg-green-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${promo.active ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(promo.id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPromos;
```

- [ ] **Step 2: Commit**

```bash
git -C /home/marcus/Projetos/gama_project add frontend/src/pages/admin/AdminPromos.tsx
git -C /home/marcus/Projetos/gama_project commit -m "feat(promotions): add AdminPromos management page"
```

---

### Task 8: Wire AdminPromos into App.tsx + AdminDashboard

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/pages/admin/AdminDashboard.tsx`

- [ ] **Step 1: Add `admin_promo` view to `App.tsx`**

In `App.tsx`:

1. Add import:
```tsx
import AdminPromos from './pages/admin/AdminPromos';
```

2. Add `'admin_promo'` to the `View` type:
```tsx
type View = 'home' | 'details' | 'cart' | 'checkout' | 'success' | 'orders' | 'admin_dashboard' | 'admin_orders' | 'admin_promo';
```

3. Add render (after the `AdminOrders` render, before the bottom nav):
```tsx
{view === 'admin_promo' && <AdminPromos onBack={() => setView('admin_dashboard')} onLogout={handleLogout} />}
```

4. Add `'admin_promo'` to the condition that hides bottom nav (add to the `!view.startsWith('admin')` check — actually, since `admin_promo` starts with `'admin'`, the existing check already covers it):

The existing condition `!view.startsWith('admin')` already hides the bottom nav for `admin_promo`. No change needed.

- [ ] **Step 2: Add "Promoções" card to AdminDashboard**

In `AdminDashboard.tsx`, fetch active promotion count and add card:

Add state:
```tsx
const [promoCount, setPromoCount] = useState(0);
```

In the existing `Promise.all`, add a third fetch:
```tsx
Promise.all([
  fetch('/api/admin/stats', { headers }).then(res => res.json()),
  fetch('/api/admin/reports/sales', { headers }).then(res => res.json()),
  fetch('/api/admin/promotions', { headers }).then(res => res.json()),
])
  .then(([statsData, reportData, promosData]) => {
    setStats(statsData);
    setReport(reportData);
    setPromoCount(Array.isArray(promosData) ? promosData.filter((p: any) => p.active).length : 0);
    setLoading(false);
  })
```

Add import for `Tag` icon:
```tsx
import { TrendingUp, Package, Users, ArrowUpRight, LogOut, Moon, Sun, Tag } from 'lucide-react';
```

Add promo card to the `cards` array:
```tsx
{ title: 'Promoções Ativas', value: promoCount, icon: <Tag className="text-rose-500" />, color: 'bg-rose-50 dark:bg-rose-900/20', action: () => onNavigate('admin_promo') },
```

Update grid to `lg:grid-cols-5` if you add 5 cards, or keep at 4 and remove a less important one. Recommend keeping 4 — replace the less useful "Ticket Médio" card with the Promoções card, or just add it as a 5th:

Simplest: add as 5th card and change grid to `lg:grid-cols-5`:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd /home/marcus/Projetos/gama_project/frontend && npx tsc --noEmit
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git -C /home/marcus/Projetos/gama_project add frontend/src/App.tsx frontend/src/pages/admin/AdminDashboard.tsx
git -C /home/marcus/Projetos/gama_project commit -m "feat(promotions): wire AdminPromos view into App and AdminDashboard"
```
