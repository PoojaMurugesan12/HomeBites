import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export class AdminController {
  static async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [totalKitchens, totalUsers, totalOrders, activeSubscriptions, unreadMessages] = await Promise.all([
        prisma.kitchen.count(),
        prisma.user.count(),
        prisma.order.count(),
        prisma.kitchenSubscription.count({ where: { status: 'ACTIVE' } }),
        prisma.contactMessage.count({ where: { status: 'UNREAD' } })
      ]);

      const salesResult = await prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true }
      });

      const platformGrossRevenue = Number(salesResult._sum.totalAmount || 0);

      // Recent kitchens
      const recentKitchens = await prisma.kitchen.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          subscription: { include: { plan: true } },
          _count: { select: { orders: true, menuItems: true } }
        }
      });

      res.status(200).json({
        success: true,
        stats: {
          totalKitchens,
          totalUsers,
          totalOrders,
          activeSubscriptions,
          unreadMessages,
          platformGrossRevenue
        },
        recentKitchens
      });
    } catch (error) {
      next(error);
    }
  }

  static async getKitchens(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchens = await prisma.kitchen.findMany({
        include: {
          subscription: { include: { plan: true } },
          memberships: {
            where: { role: 'OWNER' },
            include: { user: { select: { fullName: true, email: true, phone: true } } }
          },
          _count: { select: { orders: true, menuItems: true, inventoryItems: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, kitchens });
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
          memberships: {
            include: { kitchen: { select: { name: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, users });
    } catch (error) {
      next(error);
    }
  }

  static async getContactMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const messages = await prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' }
      });

      res.status(200).json({ success: true, messages });
    } catch (error) {
      next(error);
    }
  }

  static async updateMessageStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      const message = await prisma.contactMessage.update({
        where: { id },
        data: {
          status: status || 'READ',
          respondedAt: status === 'RESPONDED' ? new Date() : undefined
        }
      });

      res.status(200).json({ success: true, message });
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await prisma.auditLog.findMany({
        include: {
          user: { select: { fullName: true, email: true, role: true } },
          kitchen: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      res.status(200).json({ success: true, logs });
    } catch (error) {
      next(error);
    }
  }
}
