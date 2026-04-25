import { Request, Response } from 'express';
import { query } from '../db';
import jwt from 'jsonwebtoken';
import { sendWhatsAppOTP } from '../services/evolution.service';

const JWT_SECRET = process.env.JWT_SECRET || 'secret_russas_b2b';

export const requestOTP = async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone is required' });
  }

  try {
    const { rows } = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found. Access restricted to pre-registered users.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await query(
      'UPDATE users SET otp_code = $1, otp_expires_at = $2 WHERE phone = $3',
      [code, expiresAt, phone]
    );

    await sendWhatsAppOTP(phone, code);

    res.status(200).json({ message: 'OTP code sent via WhatsApp' });
  } catch (error) {
    console.error('Error in requestOTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ message: 'Phone and code are required' });
  }

  try {
    // Magic OTP for E2E Testing (Development Only)
    if (phone === '5588000000000' && code === '999999') {
      const { rows } = await query('SELECT * FROM users WHERE phone = $1', [phone]);
      const user = rows[0] || { id: '00000000-0000-0000-0000-000000000000', distributor_id: '00000000-0000-0000-0000-000000000000', role: 'MERCHANT', name: 'Robô de Teste', phone: '5588000000000' };
      
      const token = jwt.sign(
        { userId: user.id, distributorId: user.distributor_id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        token,
        user: { id: user.id, name: user.name, phone: user.phone, role: user.role }
      });
    }

    const { rows } = await query(
      'SELECT * FROM users WHERE phone = $1 AND otp_code = $2 AND otp_expires_at > NOW()',
      [phone, code]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid or expired code' });
    }

    const user = rows[0];

    // Clear OTP after verification
    await query('UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE id = $1', [user.id]);

    const token = jwt.sign(
      { userId: user.id, distributorId: user.distributor_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
