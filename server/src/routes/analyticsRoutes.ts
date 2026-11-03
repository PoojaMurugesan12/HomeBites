import { Router } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { authenticate, requireKitchen } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireKitchen);

router.get('/overview', AnalyticsController.getOverview);
router.get('/sales', AnalyticsController.getSales);
router.get('/peak-hours', AnalyticsController.getPeakHours);
router.get('/top-items', AnalyticsController.getTopItems);
router.get('/delivery', AnalyticsController.getDelivery);

export default router;
