import { Request, Response } from 'express';
import { Product } from '../models/product.model';

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Cimento CP II 50kg',
    description: 'Cimento Portland composto de alta resistência.',
    category: 'Construção',
    sku: 'CIM-001',
    stock: 500,
    unitPrice: 35.50,
    tieredPricing: [
      { minQty: 10, price: 33.90 },
      { minQty: 50, price: 31.50 },
      { minQty: 100, price: 29.90 }
    ]
  },
  {
    id: '2',
    name: 'Tijolo de Cerâmica 8 Furos',
    description: 'Tijolo cerâmico ideal para alvenaria.',
    category: 'Construção',
    sku: 'TIJ-002',
    stock: 10000,
    unitPrice: 0.85,
    tieredPricing: [
      { minQty: 1000, price: 0.80 },
      { minQty: 5000, price: 0.75 }
    ]
  }
];

export const getProducts = async (req: Request, res: Response) => {
  res.status(200).json(mockProducts);
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const product = mockProducts.find(p => p.id === id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.status(200).json(product);
};
