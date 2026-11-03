import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { pricingDecisionSchema } from '../validators/schemas';
import { PricingService } from '../services/pricingService';

export class PricingController {
  static async getRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const status = req.query.status as string || 'PENDING';

      // Always ensure recommendations are up to date
      await PricingService.refreshKitchenRecommendations(kitchenId);

      const recommendations = await prisma.pricingRecommendation.findMany({
        where: {
          kitchenId,
          ...(status !== 'ALL' ? { status: status as any } : {})
        },
        include: {
          menuItem: {
            select: { id: true, name: true, imageUrl: true, sellingPrice: true, costPrice: true }
          },
          decidedByUser: {
            select: { fullName: true }
          }
        },
        orderBy: { confidenceScore: 'desc' }
      });

      const kitchen = await prisma.kitchen.findUnique({
        where: { id: kitchenId },
        select: { defaultTargetMargin: true }
      });

      res.status(200).json({
        success: true,
        targetMargin: Number(kitchen?.defaultTargetMargin || 0.65),
        formulaExplanation: {
          unitContributionFormula: 'Contribution = Selling Price - Estimated Cost',
          candidatePriceFormula: 'Candidate Price = Estimated Cost / (1 - Target Margin)',
          notes: 'Candidate prices are recommended estimates based on historical demand and target unit margins. HomeBites never changes prices automatically without explicit owner approval.'
        },
        recommendations
      });
    } catch (error) {
      next(error);
    }
  }

  static async handleDecision(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const id = req.params.id as string;
      const { decision, approvedPrice } = pricingDecisionSchema.parse(req.body);

      const updated = await PricingService.handleDecision(
        id,
        kitchenId,
        req.user?.id || 'system',
        decision,
        approvedPrice
      );

      res.status(200).json({
        success: true,
        message:
          decision === 'ACCEPTED'
            ? `Price recommendation accepted! Menu price updated to Rs. ${approvedPrice || updated.candidatePrice}.`
            : `Recommendation marked as ${decision.toLowerCase()}.`,
        recommendation: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      await PricingService.refreshKitchenRecommendations(kitchenId);

      res.status(200).json({
        success: true,
        message: 'Pricing intelligence recommendations refreshed from actual sales records.'
      });
    } catch (error) {
      next(error);
    }
  }
}
