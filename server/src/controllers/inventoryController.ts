import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { inventoryItemSchema, inventoryRestockSchema, inventoryAdjustSchema } from '../validators/schemas';
import { InventoryService } from '../services/inventoryService';

export class InventoryController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const category = req.query.category as string | undefined;
      const search = (req.query.search as string || '').trim();

      const items = await prisma.inventoryItem.findMany({
        where: {
          kitchenId,
          isArchived: false,
          ...(category ? { category } : {}),
          ...(search ? { name: { contains: search, mode: 'insensitive' } } : {})
        },
        include: {
          ingredient: true
        },
        orderBy: { name: 'asc' }
      });

      // Calculate total inventory valuation
      const totalInventoryValue = items.reduce(
        (sum, item) => sum + Number(item.currentStock) * Number(item.unitCost),
        0
      );

      const lowStockCount = items.filter(
        (item) => Number(item.currentStock) <= Number(item.minStockThreshold)
      ).length;

      res.status(200).json({
        success: true,
        items,
        summary: {
          totalItems: items.length,
          lowStockCount,
          totalInventoryValue: Math.round(totalInventoryValue)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const data = inventoryItemSchema.parse(req.body);

      const result = await prisma.$transaction(async (tx) => {
        // Create matching ingredient
        const ingredient = await tx.ingredient.create({
          data: {
            kitchenId,
            name: data.name,
            category: data.category || null,
            unit: data.unit,
            defaultCostPerUnit: data.unitCost
          }
        });

        const invItem = await tx.inventoryItem.create({
          data: {
            kitchenId,
            ingredientId: ingredient.id,
            name: data.name,
            category: data.category || null,
            unit: data.unit,
            currentStock: data.currentStock,
            minStockThreshold: data.minStockThreshold,
            unitCost: data.unitCost,
            supplierName: data.supplierName || null,
            lastRestockedAt: new Date()
          }
        });

        if (data.currentStock > 0) {
          await tx.inventoryMovement.create({
            data: {
              kitchenId,
              inventoryItemId: invItem.id,
              movementType: 'RESTOCK',
              quantityChange: data.currentStock,
              previousStock: 0,
              newStock: data.currentStock,
              unitCostAtTime: data.unitCost,
              reason: 'Initial inventory entry',
              performedByUserId: req.user?.id
            }
          });
        }

        return invItem;
      });

      res.status(201).json({
        success: true,
        message: `Inventory item "${result.name}" added successfully.`,
        item: result
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const id = req.params.id as string;
      const data = inventoryItemSchema.parse(req.body);

      const existing = await prisma.inventoryItem.findFirst({
        where: { id, kitchenId }
      });

      if (!existing) {
        res.status(404).json({ success: false, error: 'Inventory item not found.' });
        return;
      }

      const updated = await prisma.inventoryItem.update({
        where: { id },
        data: {
          name: data.name,
          category: data.category || null,
          unit: data.unit,
          minStockThreshold: data.minStockThreshold,
          unitCost: data.unitCost,
          supplierName: data.supplierName || null
        }
      });

      res.status(200).json({
        success: true,
        message: 'Inventory item updated.',
        item: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async restock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const id = req.params.id as string;
      const { quantity, unitCost, reason } = inventoryRestockSchema.parse(req.body);

      const updated = await InventoryService.restockItem(
        kitchenId,
        id,
        quantity,
        unitCost,
        reason,
        req.user?.id
      );

      res.status(200).json({
        success: true,
        message: `Successfully restocked ${quantity} ${updated.unit}. New balance: ${updated.currentStock} ${updated.unit}.`,
        item: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async adjust(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const id = req.params.id as string;
      const { quantityChange, reason } = inventoryAdjustSchema.parse(req.body);

      const updated = await InventoryService.adjustStock(
        kitchenId,
        id,
        quantityChange,
        reason,
        req.user?.id
      );

      res.status(200).json({
        success: true,
        message: `Inventory adjusted. New balance: ${updated.currentStock} ${updated.unit}.`,
        item: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMovements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const itemId = req.query.itemId as string | undefined;

      const movements = await prisma.inventoryMovement.findMany({
        where: {
          kitchenId,
          ...(itemId ? { inventoryItemId: itemId } : {})
        },
        include: {
          inventoryItem: {
            select: { name: true, unit: true }
          },
          order: {
            select: { orderNumber: true, customerName: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      res.status(200).json({ success: true, movements });
    } catch (error) {
      next(error);
    }
  }

  static async exportCsv(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const items = await prisma.inventoryItem.findMany({
        where: { kitchenId, isArchived: false },
        orderBy: { name: 'asc' }
      });

      const rows = [
        ['Item Name', 'Category', 'Unit', 'Current Stock', 'Min Threshold', 'Unit Cost (INR)', 'Total Value (INR)', 'Supplier', 'Status'].join(',')
      ];

      items.forEach((item) => {
        const isLow = Number(item.currentStock) <= Number(item.minStockThreshold);
        const value = Number(item.currentStock) * Number(item.unitCost);
        rows.push([
          `"${item.name.replace(/"/g, '""')}"`,
          `"${item.category || ''}"`,
          `"${item.unit}"`,
          Number(item.currentStock).toFixed(2),
          Number(item.minStockThreshold).toFixed(2),
          Number(item.unitCost).toFixed(2),
          value.toFixed(2),
          `"${item.supplierName || ''}"`,
          isLow ? 'LOW STOCK' : 'HEALTHY'
        ].join(','));
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="inventory-${kitchenId.slice(0, 8)}-${Date.now()}.csv"`);
      res.status(200).send(rows.join('\n'));
    } catch (error) {
      next(error);
    }
  }
}
