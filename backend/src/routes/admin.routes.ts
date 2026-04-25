import { Router } from 'express';
import { getAllOrders, updateOrderStatus, getAdminStats } from '../controllers/admin.controller';
import { authenticateJWT, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

// Todas as rotas de admin exigem autenticação E role ADMIN
router.use(authenticateJWT, authorizeAdmin);

router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/stats', getAdminStats);
router.get('/reports/sales', getSalesReport);

export default router;
