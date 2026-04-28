import { Request, Response } from 'express';
import { query } from '../db';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { rows } = await query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.category,
        p.sku,
        p.stock,
        p.unit_price AS "unitPrice",
        p.tiered_pricing AS "tieredPricing",
        COALESCE(
          (
            SELECT MAX(pr.discount_percent)
            FROM promotions pr
            WHERE pr.active = true
              AND (pr.starts_at IS NULL OR pr.starts_at <= NOW())
              AND (pr.ends_at IS NULL OR pr.ends_at > NOW())
              AND (
                (pr.type = 'PRODUCT' AND pr.target = p.id::text)
                OR (pr.type = 'CATEGORY' AND pr.target = p.category)
              )
          ), 0
        ) AS "discountPercent"
      FROM products p
      ORDER BY p.name ASC
    `);
    res.status(200).json(rows.map(r => ({ ...r, discountPercent: Number(r.discountPercent) })));
  } catch {
    res.status(500).json({ message: 'Error fetching products' });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { rows } = await query(`
      SELECT
        p.id,
        p.name,
        p.description,
        p.category,
        p.sku,
        p.stock,
        p.unit_price AS "unitPrice",
        p.tiered_pricing AS "tieredPricing",
        COALESCE(
          (
            SELECT MAX(pr.discount_percent)
            FROM promotions pr
            WHERE pr.active = true
              AND (pr.starts_at IS NULL OR pr.starts_at <= NOW())
              AND (pr.ends_at IS NULL OR pr.ends_at > NOW())
              AND (
                (pr.type = 'PRODUCT' AND pr.target = p.id::text)
                OR (pr.type = 'CATEGORY' AND pr.target = p.category)
              )
          ), 0
        ) AS "discountPercent"
      FROM products p
      WHERE p.id = $1
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const row = rows[0];
    res.status(200).json({ ...row, discountPercent: Number(row.discountPercent) });
  } catch {
    res.status(500).json({ message: 'Error fetching product' });
  }
};
