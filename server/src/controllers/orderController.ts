import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { orderCreateSchema, orderStatusUpdateSchema, orderCancelSchema } from '../validators/schemas';
import { OrderService } from '../services/orderService';
import { OrderStatus, OrderSource, Prisma } from '@prisma/client';

export class OrderController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || '20', 10)));
      const skip = (page - 1) * limit;

      const search = (req.query.search as string || '').trim();
      const status = req.query.status as OrderStatus | undefined;
      const source = req.query.source as OrderSource | undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const where: Prisma.OrderWhereInput = {
        kitchenId,
        ...(status ? { status } : {}),
        ...(source ? { source } : {}),
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {})
              }
            }
          : {}),
        ...(search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { customerName: { contains: search, mode: 'insensitive' } },
                { customerPhone: { contains: search } }
              ]
            }
          : {})
      };

      const [total, orders] = await prisma.$transaction([
        prisma.order.count({ where }),
        prisma.order.findMany({
          where,
          include: {
            items: true,
            deliveryRecord: true,
            statusHistory: {
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        })
      ]);

      res.status(200).json({
        success: true,
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const id = req.params.id as string;

      const order = await prisma.order.findFirst({
        where: { id, kitchenId },
        include: {
          items: true,
          deliveryRecord: true,
          statusHistory: {
            orderBy: { timestamp: 'asc' },
            include: { changedByUser: { select: { fullName: true, role: true } } }
          },
          customer: true
        }
      });

      if (!order) {
        res.status(404).json({ success: false, error: 'Order not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        order
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const data = orderCreateSchema.parse(req.body);

      const order = await OrderService.createOrder({
        ...data,
        kitchenId,
        userId: req.user?.id
      });

      res.status(201).json({
        success: true,
        message: `Order #${order.orderNumber} created successfully.`,
        order
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const id = req.params.id as string;
      const { status, comment } = orderStatusUpdateSchema.parse(req.body);

      const updated = await OrderService.updateOrderStatus(
        id,
        kitchenId,
        status,
        comment,
        req.user?.id
      );

      res.status(200).json({
        success: true,
        message: `Order #${updated.orderNumber} status updated to ${status}.`,
        order: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const id = req.params.id as string;
      const { reason } = orderCancelSchema.parse(req.body);

      const cancelled = await OrderService.cancelOrder(id, kitchenId, reason, req.user?.id);

      res.status(200).json({
        success: true,
        message: `Order #${cancelled.orderNumber} has been cancelled.`,
        order: cancelled
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const status = req.query.status as OrderStatus | undefined;
      const source = req.query.source as OrderSource | undefined;

      const orders = await prisma.order.findMany({
        where: {
          kitchenId,
          ...(status ? { status } : {}),
          ...(source ? { source } : {})
        },
        include: { items: true, deliveryRecord: true },
        orderBy: { createdAt: 'desc' }
      });

      const rows = [
        ['Order ID', 'Date & Time', 'Customer Name', 'Phone', 'Source', 'Status', 'Payment Method', 'Items Count', 'Subtotal', 'Tax', 'Discount', 'Total (INR)', 'Prep Duration (mins)', 'Delivery Duration (mins)'].join(',')
      ];

      orders.forEach((o) => {
        rows.push([
          `"${o.orderNumber}"`,
          `"${o.createdAt.toISOString()}"`,
          `"${(o.customerName || '').replace(/"/g, '""')}"`,
          `"${o.customerPhone || ''}"`,
          `"${o.source}"`,
          `"${o.status}"`,
          `"${o.paymentMethod || 'UPI'}"`,
          o.items.length,
          Number(o.subtotal).toFixed(2),
          Number(o.taxAmount).toFixed(2),
          Number(o.discountAmount).toFixed(2),
          Number(o.totalAmount).toFixed(2),
          o.deliveryRecord?.prepDurationMinutes ?? '',
          o.deliveryRecord?.deliveryDurationMinutes ?? ''
        ].join(','));
      });

      const csvContent = rows.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="orders-${kitchenId.slice(0, 8)}-${Date.now()}.csv"`);
      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }

  static async importCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const { rows } = req.body; // Expects parsed rows: array of { orderNumber, customerName, customerPhone, items, totalAmount, source }

      if (!Array.isArray(rows) || rows.length === 0) {
        res.status(400).json({ success: false, error: 'No order records provided in import payload.' });
        return;
      }

      let importedCount = 0;
      let skippedDuplicates = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row.customerName || !row.totalAmount) {
          errors.push(`Row ${i + 1}: Missing customer name or total amount.`);
          continue;
        }

        // Check duplicate external or order number
        if (row.orderNumber) {
          const exists = await prisma.order.findFirst({
            where: { kitchenId, orderNumber: String(row.orderNumber) }
          });
          if (exists) {
            skippedDuplicates++;
            continue;
          }
        }

        try {
          const totalAmount = Number(row.totalAmount);
          const subtotal = Math.round(totalAmount / 1.05);
          const taxAmount = totalAmount - subtotal;
          const orderNumber = row.orderNumber || `HB-IMP-${Date.now()}-${i + 1}`;

          await prisma.order.create({
            data: {
              kitchenId,
              orderNumber,
              customerName: row.customerName,
              customerPhone: row.customerPhone || null,
              customerAddress: row.customerAddress || null,
              source: OrderSource.CSV_IMPORT,
              status: OrderStatus.DELIVERED,
              paymentStatus: 'PAID',
              paymentMethod: 'Imported Partner Settlement',
              subtotal,
              taxAmount,
              totalAmount,
              notes: row.notes || 'Imported via CSV batch',
              items: {
                create: [
                  {
                    itemName: row.itemName || 'Meal Platter',
                    unitPrice: totalAmount,
                    costPriceSnapshot: Math.round(totalAmount * 0.35),
                    quantity: 1,
                    subtotal: totalAmount
                  }
                ]
              },
              deliveryRecord: {
                create: {
                  kitchenId,
                  prepDurationMinutes: 18,
                  deliveryDurationMinutes: 24
                }
              }
            }
          });
          importedCount++;
        } catch (err: any) {
          errors.push(`Row ${i + 1}: ${err.message}`);
        }
      }

      res.status(200).json({
        success: true,
        message: `Import processed: ${importedCount} imported, ${skippedDuplicates} duplicates skipped.`,
        importedCount,
        skippedDuplicates,
        errors
      });
    } catch (error) {
      next(error);
    }
  }
}
