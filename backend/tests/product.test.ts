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
    ],
    discountPercent: 0
  }
];

describe('Product API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products', () => {
    it('should return a list of products with discountPercent', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: mockDbProducts });
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('discountPercent'));
      expect(response.body[0]).toHaveProperty('discountPercent', 0);
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
      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE p.id = $1'), ['1']);
      expect(response.body).toHaveProperty('discountPercent', 0);
    });

    it('should return 404 if product is not found in DB', async () => {
      (db.query as jest.Mock).mockResolvedValue({ rows: [] });

      const response = await request(app).get('/api/products/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Product not found');
    });
  });
});
