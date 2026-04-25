import request from 'supertest';
import app from '../src/app';

describe('Order API', () => {
  it('should calculate correct preview for items', async () => {
    const res = await request(app)
      .post('/api/orders/preview')
      .send({
        items: [{ productId: '1', quantity: 10 }] // Cimento price at 10+ is 33.90
      });
    
    expect(res.status).toBe(200);
    expect(res.body.subtotal).toBe(339.00);
    expect(res.body.frete).toBe(25.00); // Subtotal < 500
    expect(res.body.total).toBe(364.00);
  });

  it('should create a new order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        userId: 'user-123',
        items: [{ productId: '1', quantity: 10 }],
        paymentMethod: 'BOLETO_FATURADO',
        shippingAddress: 'Rua Principal, Russas/CE'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('PENDING_APPROVAL');
  });
});
