import { Request, Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth.middleware';

const ACTIVE_CONDITION = `
  pr.active = true
  AND (pr.starts_at IS NULL OR pr.starts_at <= NOW())
  AND (pr.ends_at IS NULL OR pr.ends_at > NOW())
`;

const mapRow = (r: Record<string, unknown>) => ({ ...r, discountPercent: Number(r.discountPercent) });

export const getActivePromotions = async (req: Request, res: Response) => {
  try {
    const { rows } = await query(`
      SELECT id, type, target, discount_percent AS "discountPercent", title,
             starts_at AS "startsAt", ends_at AS "endsAt"
      FROM promotions pr
      WHERE ${ACTIVE_CONDITION}
      ORDER BY created_at DESC
    `);
    res.status(200).json(rows.map(mapRow));
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllPromotions = async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await query(`
      SELECT id, type, target, discount_percent AS "discountPercent", active, title,
             starts_at AS "startsAt", ends_at AS "endsAt", created_at AS "createdAt"
      FROM promotions
      ORDER BY created_at DESC
    `);
    res.status(200).json(rows.map(mapRow));
  } catch (error) {
    console.error('Error fetching all promotions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createPromotion = async (req: AuthRequest, res: Response) => {
  const { type, target, discountPercent, title, startsAt, endsAt } = req.body;

  if (!['CATEGORY', 'PRODUCT'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type. Must be CATEGORY or PRODUCT' });
  }
  if (!target || !title) {
    return res.status(400).json({ message: 'target and title are required' });
  }
  const discount = Number(discountPercent);
  if (!discount || discount <= 0 || discount > 100) {
    return res.status(400).json({ message: 'discountPercent must be between 0.01 and 100' });
  }
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
    return res.status(400).json({ message: 'endsAt must be after startsAt' });
  }

  try {
    const { rows } = await query(
      `INSERT INTO promotions (type, target, discount_percent, title, starts_at, ends_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, type, target, discount_percent AS "discountPercent", active, title,
                 starts_at AS "startsAt", ends_at AS "endsAt", created_at AS "createdAt"`,
      [type, target, discount, title, startsAt || null, endsAt || null]
    );
    res.status(201).json(mapRow(rows[0]));
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePromotion = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { type, target, discountPercent, title, active, startsAt, endsAt } = req.body;

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (type !== undefined) { fields.push(`type = $${idx++}`); values.push(type); }
  if (target !== undefined) { fields.push(`target = $${idx++}`); values.push(target); }
  if (discountPercent !== undefined) { fields.push(`discount_percent = $${idx++}`); values.push(Number(discountPercent)); }
  if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
  if (active !== undefined) { fields.push(`active = $${idx++}`); values.push(active); }
  if (startsAt !== undefined) { fields.push(`starts_at = $${idx++}`); values.push(startsAt || null); }
  if (endsAt !== undefined) { fields.push(`ends_at = $${idx++}`); values.push(endsAt || null); }

  if (fields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }
  values.push(id);

  try {
    const { rows, rowCount } = await query(
      `UPDATE promotions SET ${fields.join(', ')} WHERE id = $${idx}
       RETURNING id, type, target, discount_percent AS "discountPercent", active, title,
                 starts_at AS "startsAt", ends_at AS "endsAt"`,
      values
    );
    if (rowCount === 0) return res.status(404).json({ message: 'Promotion not found' });
    res.status(200).json(mapRow(rows[0]));
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePromotion = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const { rowCount } = await query('DELETE FROM promotions WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ message: 'Promotion not found' });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
