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
