import { Product } from '../src/models/product.model';

describe('Product Model', () => {
  it('should define a product with tiered pricing', () => {
    const product: Product = {
      id: '1',
      name: 'Produto Teste',
      description: 'Descrição Teste',
      category: 'Categoria Teste',
      sku: 'SKU-001',
      stock: 100,
      unitPrice: 10.5,
      tieredPricing: [
        { minQty: 10, price: 9.5 },
        { minQty: 50, price: 8.0 }
      ]
    };

    expect(product.name).toBe('Produto Teste');
    expect(product.tieredPricing).toHaveLength(2);
    expect(product.tieredPricing[0].minQty).toBe(10);
  });
});
