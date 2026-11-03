import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController';
import { authenticate, requireKitchen, requireOwner } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireKitchen);

router.get('/', InventoryController.list);
router.post('/', requireOwner, InventoryController.create);
router.get('/export', InventoryController.exportCsv);
router.get('/movements', InventoryController.getMovements);
router.patch('/:id', requireOwner, InventoryController.update);
router.post('/:id/restock', InventoryController.restock);
router.post('/:id/adjust', InventoryController.adjust);

export default router;
