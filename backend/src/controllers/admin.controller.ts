import { Response } from 'express';
import { query } from '../db';
import { AuthRequest } from '../middleware/auth.middleware';

export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const { rows } = await query(`
      SELECT 
        o.id, 
        o.status, 
        o.total_amount AS "totalAmount", 
        o.payment_method AS "paymentMethod", 
        o.created_at AS "createdAt",
        u.name AS "clientName",
        u.phone AS "clientPhone"
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const orderRes = await query(`
      SELECT
        o.id, o.status,
        o.total_amount AS "totalAmount",
        o.payment_method AS "paymentMethod",
        o.created_at AS "createdAt",
        u.name AS "clientName",
        u.phone AS "clientPhone"
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [id]);

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const itemsRes = await query(`
      SELECT
        oi.id,
        oi.quantity,
        oi.price_at_purchase AS "priceAtPurchase",
        p.name AS "productName",
        p.sku
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [id]);

    res.status(200).json({ ...orderRes.rows[0], items: itemsRes.rows });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['PENDING_APPROVAL', 'APPROVED', 'IN_SEPARATION', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const { rowCount } = await query(
      'UPDATE orders SET status = $1 WHERE id = $2',
      [status, id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const salesToday = await query(
      "SELECT SUM(total_amount) as total FROM orders WHERE created_at >= CURRENT_DATE AND status != 'CANCELLED'"
    );
    
    const pendingOrders = await query(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'PENDING_APPROVAL'"
    );

    res.status(200).json({
      salesToday: Number(salesToday.rows[0].total || 0),
      pendingOrders: Number(pendingOrders.rows[0].count || 0)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getSalesReport = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Vendas Diárias (Últimos 30 dias)
    const dailySales = await query(`
      SELECT 
        TO_CHAR(created_at, 'DD/MM') as date, 
        SUM(total_amount) as total
      FROM orders 
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days' 
        AND status != 'CANCELLED'
      GROUP BY TO_CHAR(created_at, 'DD/MM'), DATE_TRUNC('day', created_at)
      ORDER BY DATE_TRUNC('day', created_at) ASC
    `);

    // 2. Vendas por Categoria
    const categorySales = await query(`
      SELECT 
        p.category as name, 
        SUM(oi.quantity * oi.price_at_purchase) as value
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'CANCELLED'
      GROUP BY p.category
    `);

    // 3. KPIs Mensais
    const kpis = await query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as "totalMonth",
        COALESCE(AVG(total_amount), 0) as "avgTicket",
        COUNT(*) as "totalOrders"
      FROM orders
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) 
        AND status != 'CANCELLED'
    `);

    res.status(200).json({
      dailySales: dailySales.rows.map(r => ({ date: r.date, total: Number(r.total) })),
      categorySales: categorySales.rows.map(r => ({ name: r.name, value: Number(r.value) })),
      kpis: {
        totalMonth: Number(kpis.rows[0].totalMonth),
        avgTicket: Number(kpis.rows[0].avgTicket),
        totalOrders: Number(kpis.rows[0].totalOrders)
      }
    });
  } catch (error) {
    console.error('Error fetching sales report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
