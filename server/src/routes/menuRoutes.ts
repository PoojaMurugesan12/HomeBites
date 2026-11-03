import { Router } from 'express';
import { MenuController } from '../controllers/menuController';
import { authenticate, requireKitchen, requireOwner } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireKitchen);

router.get('/', MenuController.list);
router.post('/', requireOwner, MenuController.create);
router.get('/categories', MenuController.getCategories);
router.post('/categories', requireOwner, MenuController.createCategory);
router.post('/recipes', requireOwner, MenuController.saveRecipe);
router.patch('/:id', requireOwner, MenuController.update);
router.patch('/:id/toggle-availability', MenuController.toggleAvailability);
router.delete('/:id', requireOwner, MenuController.archive);

export default router;
