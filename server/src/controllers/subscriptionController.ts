import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { SubscriptionStatus } from '@prisma/client';

export class SubscriptionController {
  static async getPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { monthlyPrice: 'asc' }
      });

      res.status(200).json({ success: true, plans });
    } catch (error) {
      next(error);
    }
  }

  static async getCurrent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const subscription = await prisma.kitchenSubscription.findUnique({
        where: { kitchenId },
        include: { plan: true }
      });

      const orderCountThisMonth = await prisma.order.count({
        where: {
          kitchenId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      });

      const menuItemsCount = await prisma.menuItem.count({
        where: { kitchenId, isArchived: false }
      });

      const staffCount = await prisma.kitchenMembership.count({
        where: { kitchenId, isActive: true }
      });

      res.status(200).json({
        success: true,
        subscription,
        usage: {
          orderCountThisMonth,
          menuItemsCount,
          staffCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async selectPlan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const { planCode } = req.body;

      if (!planCode) {
        res.status(400).json({ success: false, error: 'Plan code is required.' });
        return;
      }

      const plan = await prisma.subscriptionPlan.findUnique({
        where: { code: planCode }
      });

      if (!plan) {
        res.status(404).json({ success: false, error: 'Subscription plan not found.' });
        return;
      }

      // Upsert subscription
      const updated = await prisma.kitchenSubscription.upsert({
        where: { kitchenId },
        create: {
          kitchenId,
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          isDemoSubscription: true,
          startedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        update: {
          planId: plan.id,
          status: SubscriptionStatus.ACTIVE,
          isDemoSubscription: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        include: { plan: true }
      });

      await prisma.auditLog.create({
        data: {
          kitchenId,
          userId: req.user?.id,
          action: 'SUBSCRIPTION_PLAN_SELECTED',
          entityType: 'KitchenSubscription',
          entityId: updated.id,
          details: JSON.stringify({ plan: plan.name, price: Number(plan.monthlyPrice) })
        }
      });

      res.status(200).json({
        success: true,
        message: `Plan updated to ${plan.name} (Demonstration Subscription).`,
        subscription: updated
      });
    } catch (error) {
      next(error);
    }
  }
}
