import { Router } from 'express';
import { KitchenController } from '../controllers/kitchenController';
import { authenticate, requireKitchen, requireOwner } from '../middleware/auth';

const router = Router();

// Public / User explore endpoint
router.get('/explore', KitchenController.getExplore);

router.use(authenticate, requireKitchen);

router.get('/current', KitchenController.getCurrent);
router.patch('/current', requireOwner, KitchenController.updateCurrent);
router.get('/staff', KitchenController.getStaff);
router.post('/staff', requireOwner, KitchenController.addStaff);
router.post('/onboarding/complete', requireOwner, KitchenController.completeOnboarding);

export default router;
