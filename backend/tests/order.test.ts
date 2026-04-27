import request from 'supertest';
import app from '../src/app';
import * as db from '../src/db';
import jwt from 'jsonwebtoken';

jest.mock('../src/db', () => ({
  query: jest.fn(),
  getClient: jest.fn(),
}));

const mockProduct = {
  unitPrice: '35.50',
  tieredPricing: [
    { minQty: 10, price: 33.90 },
    { minQty: 50, price: 31.50 },
    { minQty: 100, price: 29.90 },
  ],
  stock: 500,
  name: 'Cimento CP II 50kg',
};

const validToken = jwt.sign(
  { userId: 'user-123', distributorId: 'dist-1', role: 'USER' },
  process.env.JWT_SECRET || 'secret_russas_b2b'
);

describe('Order API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate correct preview for items', async () => {
    (db.query as jest.Mock).mockResolvedValue({ rows: [mockProduct] });

    const res = await request(app)
      .post('/api/orders/preview')
      .send({ items: [{ productId: '1', quantity: 10 }] });

    expect(res.status).toBe(200);
    expect(res.body.subtotal).toBe(339.00);
    expect(res.body.frete).toBe(25.00);
    expect(res.body.total).toBe(364.00);
  });

  it('should create a new order', async () => {
    const mockClient = {
      query: jest.fn()
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [mockProduct] }) // SELECT product FOR UPDATE
        .mockResolvedValueOnce(undefined) // UPDATE stock
        .mockResolvedValueOnce({ rows: [{ id: 'order-uuid', status: 'PENDING_APPROVAL' }] }) // INSERT order
        .mockResolvedValueOnce(undefined) // INSERT order_item
        .mockResolvedValueOnce(undefined), // COMMIT
      release: jest.fn(),
    };
    (db.getClient as jest.Mock).mockResolvedValue(mockClient);

    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        items: [{ productId: '1', quantity: 10 }],
        paymentMethod: 'BOLETO_FATURADO',
        shippingAddress: 'Rua Principal, Russas/CE',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBe('order-uuid');
    expect(res.body.status).toBe('PENDING_APPROVAL');
  });
});
