import { Request, Response } from 'express';
import { query, getClient } from '../db';
import { AuthRequest } from '../middleware/auth.middleware';
import { TieredPrice } from '../models/product.model';

export const previewOrder = async (req: Request, res: Response) => {
  const { items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items array is required' });
  }

  try {
    let subtotal = 0;

    for (const item of items) {
      const { rows } = await query(
        'SELECT unit_price AS "unitPrice", tiered_pricing AS "tieredPricing" FROM products WHERE id = $1',
        [item.productId]
      );
      
      if (rows.length > 0) {
        const product = rows[0];
        let price = Number(product.unitPrice);
        const tieredPricing = product.tieredPricing || [];
        
        const tier = tieredPricing
          .filter((t: TieredPrice) => item.quantity >= t.minQty)
          .sort((a: TieredPrice, b: TieredPrice) => b.minQty - a.minQty)[0];
          
        if (tier) price = Number(tier.price);
        subtotal += price * item.quantity;
      }
    }

    const frete = subtotal >= 500 ? 0 : 25.00;
    res.status(200).json({ 
      subtotal: Number(subtotal.toFixed(2)), 
      frete: Number(frete.toFixed(2)), 
      total: Number((subtotal + frete).toFixed(2)) 
    });
  } catch (error) {
    console.error('Error previewing order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { items, paymentMethod, shippingAddress } = req.body;
  
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items array is required' });
  }

  const client = await getClient();

  try {
    await client.query('BEGIN');

    let subtotal = 0;
    const itemsToInsert = [];

    for (const item of items) {
      const { rows } = await client.query(
        'SELECT unit_price AS "unitPrice", tiered_pricing AS "tieredPricing", stock FROM products WHERE id = $1 FOR UPDATE',
        [item.productId]
      );

      if (rows.length === 0) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const product = rows[0];
      
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name || item.productId}`);
      }

      let price = Number(product.unitPrice);
      const tieredPricing = product.tieredPricing || [];
      
      const tier = tieredPricing
        .filter((t: TieredPrice) => item.quantity >= t.minQty)
        .sort((a: TieredPrice, b: TieredPrice) => b.minQty - a.minQty)[0];
        
      if (tier) price = Number(tier.price);
      
      subtotal += price * item.quantity;
      itemsToInsert.push({ ...item, priceAtPurchase: price });

      // Update stock
      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.productId]);
    }

    const frete = subtotal >= 500 ? 0 : 25.00;
    const totalAmount = Number((subtotal + frete).toFixed(2));

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, status, total_amount, payment_method, shipping_address) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, 'PENDING_APPROVAL', totalAmount, paymentMethod, shippingAddress]
    );

    const newOrder = orderResult.rows[0];

    for (const item of itemsToInsert) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) 
         VALUES ($1, $2, $3, $4)`,
        [newOrder.id, item.productId, item.quantity, item.priceAtPurchase]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(newOrder);
  } catch (error: unknown) {
    await client.query('ROLLBACK');
    console.error('Error creating order:', error);
    
    const err = error as Error;
    if (err.message.includes('Product not found') || err.message.includes('Insufficient stock')) {
      return res.status(400).json({ message: err.message });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const { rows } = await query(
      'SELECT id, status, total_amount AS "totalAmount", payment_method AS "paymentMethod", created_at AS "createdAt" FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const orderResult = await query(
      'SELECT id, status, total_amount AS "totalAmount", payment_method AS "paymentMethod", shipping_address AS "shippingAddress", created_at AS "createdAt" FROM orders WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    const itemsResult = await query(
      `SELECT 
        oi.id, 
        oi.product_id AS "productId", 
        oi.quantity, 
        oi.price_at_purchase AS "priceAtPurchase",
        p.name,
        p.category
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1`,
      [id]
    );

    order.items = itemsResult.rows;

    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
