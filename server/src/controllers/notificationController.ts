import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';

export class NotificationController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const notifications = await prisma.notification.findMany({
        where: { kitchenId },
        orderBy: { createdAt: 'desc' },
        take: 30
      });

      const unreadCount = await prisma.notification.count({
        where: { kitchenId, isRead: false }
      });

      res.status(200).json({
        success: true,
        notifications,
        unreadCount
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const id = req.params.id as string;

      await prisma.notification.updateMany({
        where: { id, kitchenId },
        data: { isRead: true, readAt: new Date() }
      });

      res.status(200).json({ success: true, message: 'Notification marked as read.' });
    } catch (error) {
      next(error);
    }
  }

  static async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;

      await prisma.notification.updateMany({
        where: { kitchenId, isRead: false },
        data: { isRead: true, readAt: new Date() }
      });

      res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
      next(error);
    }
  }
}
