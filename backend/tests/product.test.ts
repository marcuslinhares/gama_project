import request from 'supertest';
import app from '../src/app';

describe('Product API', () => {
  describe('GET /api/products', () => {
    it('should return a list of products', async () => {
      const response = await request(app).get('/api/products');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
        expect(response.body[0]).toHaveProperty('tieredPricing');
      }
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a single product by id', async () => {
      const response = await request(app).get('/api/products/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('name', 'Cimento CP II 50kg');
    });

    it('should return 404 if product is not found', async () => {
      const response = await request(app).get('/api/products/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Product not found');
    });
  });
});
