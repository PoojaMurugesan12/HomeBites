import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticate, requireKitchen } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireKitchen);

router.get('/', OrderController.list);
router.post('/', OrderController.create);
router.get('/export', OrderController.exportCsv);
router.post('/import', OrderController.importCsv);
router.get('/:id', OrderController.getById);
router.post('/:id/status', OrderController.updateStatus);
router.post('/:id/cancel', OrderController.cancel);

export default router;
