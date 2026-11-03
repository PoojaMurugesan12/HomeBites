import { Router } from 'express';
import { PricingController } from '../controllers/pricingController';
import { authenticate, requireKitchen, requireOwner } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireKitchen);

router.get('/recommendations', PricingController.getRecommendations);
router.post('/recommendations/refresh', requireOwner, PricingController.refresh);
router.post('/recommendations/:id/decision', requireOwner, PricingController.handleDecision);

export default router;
