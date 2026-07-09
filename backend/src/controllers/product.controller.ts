import { Request, Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth.middleware';

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

export const createProduct = async (req: AuthRequest, res: Response) => {
  const { name, description, category, sku, stock, unitPrice, tieredPricing } = req.body;
  if (!name || !category || !sku || unitPrice == null) {
    return res.status(400).json({ message: 'name, category, sku, unitPrice são obrigatórios' });
  }
  try {
    const { rows } = await query(
      `INSERT INTO products (name, description, category, sku, stock, unit_price, tiered_pricing)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, description, category, sku, stock,
                 unit_price AS "unitPrice", tiered_pricing AS "tieredPricing"`,
      [name, description ?? '', category, sku, stock ?? 0, unitPrice, JSON.stringify(tieredPricing ?? [])]
    );
    res.status(201).json(rows[0]);
  } catch (err: unknown) {
    const pgError = err as { code?: string };
    if (pgError.code === '23505') return res.status(409).json({ message: 'SKU já existe' });
    res.status(500).json({ message: 'Erro ao criar produto' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, category, sku, stock, unitPrice, tieredPricing } = req.body;
  try {
    const { rows } = await query(
      `UPDATE products SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        sku = COALESCE($4, sku),
        stock = COALESCE($5, stock),
        unit_price = COALESCE($6, unit_price),
        tiered_pricing = COALESCE($7, tiered_pricing),
        updated_at = NOW()
       WHERE id = $8
       RETURNING id, name, description, category, sku, stock,
                 unit_price AS "unitPrice", tiered_pricing AS "tieredPricing"`,
      [name, description, category, sku, stock, unitPrice,
       tieredPricing !== undefined ? JSON.stringify(tieredPricing) : undefined, id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Produto não encontrado' });
    res.status(200).json(rows[0]);
  } catch (err: unknown) {
    const pgError = err as { code?: string };
    if (pgError.code === '23505') return res.status(409).json({ message: 'SKU já existe' });
    res.status(500).json({ message: 'Erro ao atualizar produto' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const { rowCount } = await query('DELETE FROM products WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Produto não encontrado' });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Erro ao deletar produto' });
  }
};
