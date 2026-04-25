import { Router } from 'express';
import { previewOrder, createOrder, getUserOrders, getOrderById } from '../controllers/order.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.post('/preview', previewOrder);
router.post('/', authenticateJWT, createOrder);
router.get('/', authenticateJWT, getUserOrders);
router.get('/:id', authenticateJWT, getOrderById);

export default router;
