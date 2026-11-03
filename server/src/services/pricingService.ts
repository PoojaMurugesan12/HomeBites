import prisma from '../config/db';
import { RecommendationStatus, Prisma } from '@prisma/client';

export class PricingService {
  /**
   * Calculate unit contribution:
   * Contribution per item = Selling price - Estimated variable cost per item
   */
  static calculateContribution(sellingPrice: number, costPrice: number): number {
    return Number((sellingPrice - costPrice).toFixed(2));
  }

  /**
   * Calculate candidate price:
   * Candidate price = Cost / (1 - Target margin)
   */
  static calculateCandidatePrice(costPrice: number, targetMargin: number): number {
    if (targetMargin < 0 || targetMargin >= 1) {
      throw new Error('Target margin must be greater than or equal to 0 and strictly less than 1 (100%).');
    }
    const candidate = costPrice / (1 - targetMargin);
    // Round to clean restaurant price (e.g. nearest 5 or 10 rupees)
    return Math.ceil(candidate / 5) * 5;
  }

  /**
   * Generate recommendations for all active menu items in a kitchen
   */
  static async refreshKitchenRecommendations(kitchenId: string) {
    const kitchen = await prisma.kitchen.findUnique({
      where: { id: kitchenId },
      include: {
        menuItems: {
          where: { isArchived: false }
        }
      }
    });

    if (!kitchen) return;

    const targetMargin = Number(kitchen.defaultTargetMargin) || 0.65;
    const recommendations = [];

    for (const item of kitchen.menuItems) {
      const sellingPrice = Number(item.sellingPrice);
      const costPrice = Number(item.costPrice);
      const currentContribution = this.calculateContribution(sellingPrice, costPrice);
      const currentMargin = sellingPrice > 0 ? (sellingPrice - costPrice) / sellingPrice : 0;

      // Count actual orders for this item in past 30 days
      const orderCountResult = await prisma.orderItem.aggregate({
        where: {
          menuItemId: item.id,
          order: {
            kitchenId: kitchenId,
            createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        _sum: { quantity: true },
        _count: { id: true }
      });

      const totalQuantitySold = orderCountResult._sum.quantity || 0;
      const orderCount = orderCountResult._count.id;

      let demandTrend = 'INSUFFICIENT_DATA';
      let confidence = 0.50;
      let reason = '';
      let candidatePrice = sellingPrice;
      let minPrice = sellingPrice;
      let maxPrice = sellingPrice;

      if (totalQuantitySold < 5) {
        demandTrend = 'INSUFFICIENT_DATA';
        confidence = 0.35;
        candidatePrice = this.calculateCandidatePrice(costPrice, targetMargin);
        minPrice = Math.floor(candidatePrice * 0.95);
        maxPrice = Math.ceil(candidatePrice * 1.05);
        reason = `Insufficient data for a reliable recommendation (${totalQuantitySold} units sold in last 30 days). Mathematical candidate price based purely on ${(targetMargin * 100).toFixed(0)}% target margin is Rs. ${candidatePrice}.`;
      } else {
        if (totalQuantitySold >= 30) {
          demandTrend = 'HIGH';
          confidence = 0.90;
        } else if (totalQuantitySold >= 15) {
          demandTrend = 'MODERATE';
          confidence = 0.78;
        } else {
          demandTrend = 'LOW';
          confidence = 0.62;
        }

        candidatePrice = this.calculateCandidatePrice(costPrice, targetMargin);
        minPrice = Math.round(candidatePrice * 0.94 / 5) * 5;
        maxPrice = Math.round(candidatePrice * 1.06 / 5) * 5;

        if (currentMargin < targetMargin - 0.05) {
          reason = `Current margin of ${(currentMargin * 100).toFixed(1)}% is below your ${(targetMargin * 100).toFixed(0)}% target. With ${demandTrend.toLowerCase()} order volume (${totalQuantitySold} sold), adjusting price to Rs. ${candidatePrice} will lift unit contribution to Rs. ${this.calculateContribution(candidatePrice, costPrice)}.`;
        } else if (currentMargin > targetMargin + 0.08 && demandTrend === 'LOW') {
          reason = `High current margin of ${(currentMargin * 100).toFixed(1)}% may be dampening demand. Consider a promotional range of Rs. ${minPrice} - Rs. ${candidatePrice} to stimulate order frequency.`;
        } else {
          reason = `Item has healthy unit economics (${(currentMargin * 100).toFixed(1)}% margin vs ${(targetMargin * 100).toFixed(0)}% target). Price is well-calibrated for current ${demandTrend.toLowerCase()} demand.`;
        }
      }

      // Upsert recommendation
      const existing = await prisma.pricingRecommendation.findFirst({
        where: {
          kitchenId,
          menuItemId: item.id,
          status: RecommendationStatus.PENDING
        }
      });

      if (existing) {
        await prisma.pricingRecommendation.update({
          where: { id: existing.id },
          data: {
            currentPrice: sellingPrice,
            estimatedCost: costPrice,
            currentContribution: currentContribution,
            targetMargin: targetMargin,
            candidatePrice: candidatePrice,
            suggestedMinPrice: minPrice,
            suggestedMaxPrice: maxPrice,
            historicalSalesCount: totalQuantitySold,
            demandTrend: demandTrend,
            confidenceScore: confidence,
            reason: reason
          }
        });
      } else {
        await prisma.pricingRecommendation.create({
          data: {
            kitchenId,
            menuItemId: item.id,
            currentPrice: sellingPrice,
            estimatedCost: costPrice,
            currentContribution: currentContribution,
            targetMargin: targetMargin,
            candidatePrice: candidatePrice,
            suggestedMinPrice: minPrice,
            suggestedMaxPrice: maxPrice,
            historicalSalesCount: totalQuantitySold,
            demandTrend: demandTrend,
            confidenceScore: confidence,
            status: RecommendationStatus.PENDING,
            reason: reason
          }
        });
      }
    }
  }

  /**
   * Apply owner decision to a recommendation
   */
  static async handleDecision(
    recommendationId: string,
    kitchenId: string,
    userId: string,
    decision: 'ACCEPTED' | 'REJECTED' | 'DISMISSED',
    approvedPrice?: number
  ) {
    const rec = await prisma.pricingRecommendation.findFirst({
      where: { id: recommendationId, kitchenId },
      include: { menuItem: true }
    });

    if (!rec) {
      throw new Error('Pricing recommendation not found or access denied.');
    }

    const newStatus =
      decision === 'ACCEPTED'
        ? RecommendationStatus.ACCEPTED
        : decision === 'REJECTED'
        ? RecommendationStatus.REJECTED
        : RecommendationStatus.DISMISSED;

    return await prisma.$transaction(async (tx) => {
      // If accepted, update the menu item's selling price with explicit owner approval
      if (decision === 'ACCEPTED') {
        const finalPrice = approvedPrice || Number(rec.candidatePrice);
        await tx.menuItem.update({
          where: { id: rec.menuItemId },
          data: { sellingPrice: finalPrice }
        });

        // Audit log price update
        await tx.auditLog.create({
          data: {
            kitchenId,
            userId,
            action: 'MENU_PRICE_UPDATED_VIA_RECOMMENDATION',
            entityType: 'MenuItem',
            entityId: rec.menuItemId,
            details: JSON.stringify({
              previousPrice: Number(rec.currentPrice),
              newPrice: finalPrice,
              recommendationId: rec.id
            })
          }
        });
      }

      // Update recommendation record
      const updatedRec = await tx.pricingRecommendation.update({
        where: { id: rec.id },
        data: {
          status: newStatus,
          decisionTimestamp: new Date(),
          decidedByUserId: userId
        }
      });

      return updatedRec;
    });
  }
}
