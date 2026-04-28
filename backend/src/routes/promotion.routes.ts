import { Router } from 'express';
import { getActivePromotions } from '../controllers/promotion.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, getActivePromotions);

export default router;
