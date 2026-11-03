import { Router } from 'express';
import authRoutes from './authRoutes';
import kitchenRoutes from './kitchenRoutes';
import orderRoutes from './orderRoutes';
import menuRoutes from './menuRoutes';
import inventoryRoutes from './inventoryRoutes';
import pricingRoutes from './pricingRoutes';
import analyticsRoutes from './analyticsRoutes';
import notificationRoutes from './notificationRoutes';
import subscriptionRoutes from './subscriptionRoutes';
import contactRoutes from './contactRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/kitchens', kitchenRoutes);
router.use('/orders', orderRoutes);
router.use('/menu', menuRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/pricing', pricingRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/notifications', notificationRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/contact', contactRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'HomeBites Cloud Kitchen Platform',
    timestamp: new Date().toISOString()
  });
});

export default router;
