import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticate, requireKitchen } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireKitchen);

router.get('/', NotificationController.list);
router.patch('/read-all', NotificationController.markAllRead);
router.patch('/:id/read', NotificationController.markAsRead);

export default router;
