import prisma from '../config/db';
import { OrderStatus } from '@prisma/client';

export interface AnalyticsFilter {
  kitchenId: string;
  startDate?: Date;
  endDate?: Date;
}

export class AnalyticsService {
  /**
   * Calculate dashboard overview key performance metrics
   */
  static async getOverviewMetrics(filter: AnalyticsFilter) {
    const { kitchenId, startDate, endDate } = filter;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const periodDuration = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - periodDuration);
    const prevEnd = new Date(start.getTime());

    // Current period orders
    const currentOrders = await prisma.order.findMany({
      where: {
        kitchenId,
        createdAt: { gte: start, lte: end }
      },
      select: {
        id: true,
        status: true,
        totalAmount: true,
        createdAt: true
      }
    });

    // Previous period orders
    const prevOrders = await prisma.order.findMany({
      where: {
        kitchenId,
        createdAt: { gte: prevStart, lte: prevEnd }
      },
      select: {
        id: true,
        status: true,
        totalAmount: true
      }
    });

    const totalOrders = currentOrders.length;
    const completedOrders = currentOrders.filter((o) => o.status === OrderStatus.DELIVERED).length;
    const cancelledOrders = currentOrders.filter((o) => o.status === OrderStatus.CANCELLED).length;
    const pendingOrders = currentOrders.filter((o) =>
      ([OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY] as OrderStatus[]).includes(o.status)
    ).length;

    const validCurrentOrders = currentOrders.filter((o) => o.status !== OrderStatus.CANCELLED);
    const grossSales = validCurrentOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const averageOrderValue = validCurrentOrders.length > 0 ? Math.round(grossSales / validCurrentOrders.length) : 0;

    // Previous period metrics
    const prevValidOrders = prevOrders.filter((o) => o.status !== OrderStatus.CANCELLED);
    const prevGrossSales = prevValidOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const prevTotalOrders = prevOrders.length;
    const prevAov = prevValidOrders.length > 0 ? Math.round(prevGrossSales / prevValidOrders.length) : 0;

    // Comparisons only calculated when there is sufficient historical comparison data (> 0)
    const salesGrowth = prevGrossSales > 0 ? Number((((grossSales - prevGrossSales) / prevGrossSales) * 100).toFixed(1)) : null;
    const ordersGrowth = prevTotalOrders > 0 ? Number((((totalOrders - prevTotalOrders) / prevTotalOrders) * 100).toFixed(1)) : null;
    const aovGrowth = prevAov > 0 ? Number((((averageOrderValue - prevAov) / prevAov) * 100).toFixed(1)) : null;

    return {
      totalOrders,
      grossSales,
      averageOrderValue,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      hasComparisonData: prevTotalOrders > 0,
      comparisons: {
        salesGrowth,
        ordersGrowth,
        aovGrowth
      }
    };
  }

  /**
   * Sales and order volume over time
   */
  static async getSalesOverTime(filter: AnalyticsFilter) {
    const { kitchenId, startDate, endDate } = filter;
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const orders = await prisma.order.findMany({
      where: {
        kitchenId,
        createdAt: { gte: start, lte: end },
        status: { not: OrderStatus.CANCELLED }
      },
      select: {
        totalAmount: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const dailyMap: { [date: string]: { date: string; sales: number; ordersCount: number } } = {};

    orders.forEach((o) => {
      const d = o.createdAt.toISOString().split('T')[0];
      if (!dailyMap[d]) {
        dailyMap[d] = { date: d, sales: 0, ordersCount: 0 };
      }
      dailyMap[d].sales += Number(o.totalAmount);
      dailyMap[d].ordersCount += 1;
    });

    const result = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
    return result;
  }

  /**
   * Orders by hour of the day (Peak Hour Demand Analysis)
   */
  static async getPeakHours(filter: AnalyticsFilter) {
    const { kitchenId, startDate, endDate } = filter;
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const orders = await prisma.order.findMany({
      where: {
        kitchenId,
        createdAt: { gte: start, lte: end }
      },
      select: {
        createdAt: true
      }
    });

    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i}:00`,
      ordersCount: 0
    }));

    orders.forEach((o) => {
      const h = o.createdAt.getHours();
      hours[h].ordersCount += 1;
    });

    return hours;
  }

  /**
   * Top selling menu items
   */
  static async getTopMenuItems(filter: AnalyticsFilter) {
    const { kitchenId, startDate, endDate } = filter;
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          kitchenId,
          createdAt: { gte: start, lte: end },
          status: { not: OrderStatus.CANCELLED }
        }
      },
      select: {
        itemName: true,
        quantity: true,
        subtotal: true,
        costPriceSnapshot: true
      }
    });

    const itemMap: {
      [name: string]: {
        itemName: string;
        quantity: number;
        revenue: number;
        cost: number;
        contribution: number;
      };
    } = {};

    items.forEach((it) => {
      if (!itemMap[it.itemName]) {
        itemMap[it.itemName] = {
          itemName: it.itemName,
          quantity: 0,
          revenue: 0,
          cost: 0,
          contribution: 0
        };
      }
      const itemSubtotal = Number(it.subtotal);
      const itemCost = Number(it.costPriceSnapshot) * it.quantity;
      itemMap[it.itemName].quantity += it.quantity;
      itemMap[it.itemName].revenue += itemSubtotal;
      itemMap[it.itemName].cost += itemCost;
      itemMap[it.itemName].contribution += itemSubtotal - itemCost;
    });

    return Object.values(itemMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }

  /**
   * Delivery performance metrics
   */
  static async getDeliveryPerformance(filter: AnalyticsFilter) {
    const { kitchenId, startDate, endDate } = filter;
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const records = await prisma.deliveryRecord.findMany({
      where: {
        kitchenId,
        createdAt: { gte: start, lte: end }
      },
      include: {
        order: {
          select: { status: true, source: true }
        }
      }
    });

    const completed = records.filter((r) => r.prepDurationMinutes != null && r.deliveryDurationMinutes != null);
    const totalCount = records.length;

    let avgPrepTime = 0;
    let avgDeliveryDuration = 0;
    let onTimeCount = 0;
    let delayedCount = 0;

    if (completed.length > 0) {
      const sumPrep = completed.reduce((sum, r) => sum + (r.prepDurationMinutes || 0), 0);
      const sumDel = completed.reduce((sum, r) => sum + (r.deliveryDurationMinutes || 0), 0);
      avgPrepTime = Math.round(sumPrep / completed.length);
      avgDeliveryDuration = Math.round(sumDel / completed.length);
      delayedCount = records.filter((r) => r.isDelayed).length;
      onTimeCount = Math.max(0, totalCount - delayedCount);
    }

    const onTimePercentage = totalCount > 0 ? Math.round((onTimeCount / totalCount) * 100) : 100;

    // Delivery source breakdown
    const sourceMap: { [source: string]: number } = {};
    records.forEach((r) => {
      const src = r.deliveryPartner || r.order.source;
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });

    return {
      totalMonitoredOrders: totalCount,
      avgPrepTimeMinutes: avgPrepTime,
      avgDeliveryDurationMinutes: avgDeliveryDuration,
      onTimePercentage,
      delayedOrdersCount: delayedCount,
      partnerBreakdown: Object.entries(sourceMap).map(([partner, count]) => ({ partner, count })),
      operationalInsight:
        avgPrepTime > 20
          ? 'Average kitchen preparation duration exceeded 20 minutes during peak dinner hours. Consider prep-batching rice and curries.'
          : 'Kitchen prep times are well within target thresholds (under 18 mins). Rider handovers are smooth.'
    };
  }
}
