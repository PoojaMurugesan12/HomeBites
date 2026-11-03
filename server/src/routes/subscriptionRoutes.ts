import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscriptionController';
import { authenticate, requireKitchen, requireOwner } from '../middleware/auth';

const router = Router();

// Public plan listing
router.get('/plans', SubscriptionController.getPlans);

// Kitchen-specific subscription management
router.get('/current', authenticate, requireKitchen, SubscriptionController.getCurrent);
router.post('/select', authenticate, requireKitchen, requireOwner, SubscriptionController.selectPlan);

export default router;
