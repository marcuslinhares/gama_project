# Real Product Data Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace static mock data in the product controller with PostgreSQL queries, ensuring compatibility with the existing camelCase model.

**Architecture:** Use the `query` utility from `../db` to fetch data from the `products` table. SQL aliasing will map snake_case columns to camelCase properties.

**Tech Stack:** Node.js, Express, PostgreSQL (pg), Jest.

---

### Task 1: Update Tests to Mock Database

**Files:**
- Modify: `backend/tests/product.test.ts`

- [ ] **Step 1: Update tests to mock the 'query' utility**

```typescript
import request from 'supertest';
import app from '../src/app';
import * as db from '../src/db';

jest.mock('../src/db', () => ({
  query: jest.fn()
}));

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
    ]
  }
];

describe('Product API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return a list of products from DB', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: mockDbProducts });
      
      const response = await request(app).get('/api/products');
      
      expect(response.status).toBe(200);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT'), undefined);
      expect(response.body).toEqual(mockDbProducts);
    });

    it('should return 500 on DB error', async () => {
      (db.query as jest.Mock).mockRejectedValue(new Error('DB Error'));
      
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(500);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by id from DB', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [mockDbProducts[0]] });
      
      const response = await request(app).get('/api/products/1');
      
      expect(response.status).toBe(200);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE id = $1'), ['1']);
      expect(response.body).toEqual(mockDbProducts[0]);
    });

    it('should return 404 if product is not found in DB', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });
      
      const response = await request(app).get('/api/products/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Product not found');
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend && npm test tests/product.test.ts`
Expected: FAIL (because controller is still using mock data and doesn't use the mocked query)

- [ ] **Step 3: Commit tests**

```bash
git add backend/tests/product.test.ts
git commit -m "test: mock database in product tests"
```

### Task 2: Implement Database Integration in Product Controller

**Files:**
- Modify: `backend/src/controllers/product.controller.ts`

- [ ] **Step 1: Update controller to use database query**

```typescript
import { Request, Response } from 'express';
import { query } from '../db';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { rows } = await query(`
      SELECT 
        id, 
        name, 
        description, 
        category, 
        sku, 
        stock, 
        unit_price AS "unitPrice", 
        tiered_pricing AS "tieredPricing" 
      FROM products 
      ORDER BY name ASC
    `);
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rows } = await query(`
      SELECT 
        id, 
        name, 
        description, 
        category, 
        sku, 
        stock, 
        unit_price AS "unitPrice", 
        tiered_pricing AS "tieredPricing" 
      FROM products 
      WHERE id = $1
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product' });
  }
};
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `cd backend && npm test tests/product.test.ts`
Expected: PASS

- [ ] **Step 3: Commit implementation**

```bash
git add backend/src/controllers/product.controller.ts
git commit -m "feat(api): integrate real product data from postgres"
```

### Task 3: Final Verification and Cleanup

- [ ] **Step 1: Ensure mockProducts array is completely removed**
- [ ] **Step 2: Run all backend tests**

Run: `cd backend && npm test`
Expected: All tests pass

- [ ] **Step 3: Commit cleanup**

```bash
git commit -am "chore: remove unused mock data and imports"
```
