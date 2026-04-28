import { Router } from 'express';
import { getAllOrders, getOrderById, updateOrderStatus, getAdminStats, getSalesReport } from '../controllers/admin.controller';
import { authenticateJWT, authorizeAdmin } from '../middleware/auth.middleware';
import { getAllPromotions, createPromotion, updatePromotion, deletePromotion } from '../controllers/promotion.controller';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/product.controller';

const router = Router();

// Todas as rotas de admin exigem autenticação E role ADMIN
router.use(authenticateJWT, authorizeAdmin);

router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/stats', getAdminStats);
router.get('/reports/sales', getSalesReport);

router.get('/products', getProducts);
router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

router.get('/promotions', getAllPromotions);
router.post('/promotions', createPromotion);
router.patch('/promotions/:id', updatePromotion);
router.delete('/promotions/:id', deletePromotion);

export default router;
