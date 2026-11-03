import { Router } from 'express';
import { ContactController } from '../controllers/contactController';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public contact submission
router.post('/', authRateLimiter, ContactController.submitMessage);

export default router;
