import { query } from './index';

const seedProducts = async () => {
  const products = [
    {
      name: 'Cimento CP II 50kg',
      description: 'Cimento Portland composto de alta resistência.',
      category: 'Construção',
      sku: 'CIM-001',
      stock: 500,
      unitPrice: 35.50,
      tieredPricing: JSON.stringify([
        { minQty: 10, price: 33.90 },
        { minQty: 50, price: 31.50 },
        { minQty: 100, price: 29.90 }
      ])
    },
    {
      name: 'Tijolo de Cerâmica 8 Furos',
      description: 'Tijolo cerâmico ideal para alvenaria.',
      category: 'Construção',
      sku: 'TIJ-002',
      stock: 10000,
      unitPrice: 0.85,
      tieredPricing: JSON.stringify([
        { minQty: 1000, price: 0.80 },
        { minQty: 5000, price: 0.75 }
      ])
    }
  ];

  console.log('Seeding products...');

  for (const p of products) {
    await query(
      `INSERT INTO products (name, description, category, sku, stock, unit_price, tiered_pricing) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (sku) DO UPDATE SET stock = EXCLUDED.stock, unit_price = EXCLUDED.unit_price, tiered_pricing = EXCLUDED.tiered_pricing`,
      [p.name, p.description, p.category, p.sku, p.stock, p.unitPrice, p.tieredPricing]
    );
  }

  console.log('Seeding completed.');
  process.exit(0);
};

seedProducts().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
