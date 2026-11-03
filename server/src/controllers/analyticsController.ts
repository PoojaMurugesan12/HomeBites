import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analyticsService';

export class AnalyticsController {
  private static parseDates(req: Request) {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    return { startDate, endDate };
  }

  static async getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const { startDate, endDate } = AnalyticsController.parseDates(req);
      const metrics = await AnalyticsService.getOverviewMetrics({ kitchenId, startDate, endDate });

      res.status(200).json({ success: true, metrics });
    } catch (error) {
      next(error);
    }
  }

  static async getSales(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const { startDate, endDate } = AnalyticsController.parseDates(req);
      const sales = await AnalyticsService.getSalesOverTime({ kitchenId, startDate, endDate });

      res.status(200).json({ success: true, sales });
    } catch (error) {
      next(error);
    }
  }

  static async getPeakHours(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const { startDate, endDate } = AnalyticsController.parseDates(req);
      const peakHours = await AnalyticsService.getPeakHours({ kitchenId, startDate, endDate });

      res.status(200).json({ success: true, peakHours });
    } catch (error) {
      next(error);
    }
  }

  static async getTopItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const { startDate, endDate } = AnalyticsController.parseDates(req);
      const topItems = await AnalyticsService.getTopMenuItems({ kitchenId, startDate, endDate });

      res.status(200).json({ success: true, topItems });
    } catch (error) {
      next(error);
    }
  }

  static async getDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const { startDate, endDate } = AnalyticsController.parseDates(req);
      const delivery = await AnalyticsService.getDeliveryPerformance({ kitchenId, startDate, endDate });

      res.status(200).json({ success: true, delivery });
    } catch (error) {
      next(error);
    }
  }
}
