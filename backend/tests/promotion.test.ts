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
        .send({ type: 'CATEGORY', target: 'Construção', discountPercent: 15, title: '15% OFF em Construção' });
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
      (db.query as jest.Mock).mockResolvedValue({ rows: [{ ...mockPromotion, active: false }], rowCount: 1 });
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
