import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/overview', AdminController.getOverview);
router.get('/kitchens', AdminController.getKitchens);
router.get('/users', AdminController.getUsers);
router.get('/contact-messages', AdminController.getContactMessages);
router.patch('/contact-messages/:id', AdminController.updateMessageStatus);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
