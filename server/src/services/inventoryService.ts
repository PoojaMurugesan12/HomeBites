import prisma from '../config/db';
import { MovementType, NotificationType, Prisma } from '@prisma/client';

export class InventoryService {
  /**
   * Restock an inventory item
   */
  static async restockItem(
    kitchenId: string,
    itemId: string,
    quantity: number,
    unitCost?: number,
    reason?: string,
    userId?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findFirst({
        where: { id: itemId, kitchenId }
      });

      if (!item) {
        throw new Error('Inventory item not found.');
      }

      const prevStock = Number(item.currentStock);
      const newStock = prevStock + quantity;

      const updated = await tx.inventoryItem.update({
        where: { id: itemId },
        data: {
          currentStock: newStock,
          lastRestockedAt: new Date(),
          ...(unitCost ? { unitCost } : {})
        }
      });

      await tx.inventoryMovement.create({
        data: {
          kitchenId,
          inventoryItemId: itemId,
          movementType: MovementType.RESTOCK,
          quantityChange: quantity,
          previousStock: prevStock,
          newStock: newStock,
          unitCostAtTime: unitCost ?? item.unitCost,
          reason: reason || 'Standard replenishment',
          performedByUserId: userId
        }
      });

      return updated;
    });
  }

  /**
   * Adjust inventory stock (e.g. spoilage, wastage, audit discrepancy)
   */
  static async adjustStock(
    kitchenId: string,
    itemId: string,
    quantityChange: number,
    reason: string,
    userId?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findFirst({
        where: { id: itemId, kitchenId }
      });

      if (!item) {
        throw new Error('Inventory item not found.');
      }

      const prevStock = Number(item.currentStock);
      const newStock = Math.max(0, prevStock + quantityChange);

      const movementType =
        quantityChange < 0
          ? reason.toLowerCase().includes('spoil') || reason.toLowerCase().includes('waste')
            ? MovementType.SPOILAGE_WASTE
            : MovementType.AUDIT_ADJUSTMENT
          : MovementType.AUDIT_ADJUSTMENT;

      const updated = await tx.inventoryItem.update({
        where: { id: itemId },
        data: { currentStock: newStock }
      });

      await tx.inventoryMovement.create({
        data: {
          kitchenId,
          inventoryItemId: itemId,
          movementType,
          quantityChange,
          previousStock: prevStock,
          newStock,
          unitCostAtTime: item.unitCost,
          reason,
          performedByUserId: userId
        }
      });

      // Low stock check
      if (newStock <= Number(item.minStockThreshold)) {
        await tx.notification.create({
          data: {
            kitchenId,
            title: `Low Stock Alert: ${item.name}`,
            message: `Current stock of ${item.name} is ${newStock} ${item.unit}, which is at or below threshold (${item.minStockThreshold} ${item.unit}).`,
            type: NotificationType.LOW_STOCK,
            referenceId: item.id,
            referenceType: 'InventoryItem'
          }
        });
      }

      return updated;
    });
  }

  /**
   * Deduct recipe ingredients for an order.
   * Uses database transaction and checks existing movements to avoid double deductions!
   */
  static async deductOrderIngredients(kitchenId: string, orderId: string, tx: Prisma.TransactionClient = prisma) {
    // Check if stock has already been deducted for this order
    const existingMovement = await tx.inventoryMovement.findFirst({
      where: { orderId, movementType: MovementType.ORDER_DEDUCTION }
    });

    if (existingMovement) {
      console.log(`[Inventory] Ingredients already deducted for order ${orderId}. Skipping.`);
      return;
    }

    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: {
              include: {
                recipe: {
                  include: {
                    ingredients: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!order || order.kitchenId !== kitchenId) return;

    for (const orderItem of order.items) {
      const recipe = orderItem.menuItem?.recipe;
      if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
        continue;
      }

      const orderQty = orderItem.quantity;

      for (const recipeIng of recipe.ingredients) {
        const requiredAmount = Number(recipeIng.quantity) * orderQty;

        // Find inventory item linked to this ingredient
        const invItem = await tx.inventoryItem.findFirst({
          where: { kitchenId, ingredientId: recipeIng.ingredientId }
        });

        if (invItem) {
          const prev = Number(invItem.currentStock);
          const nextStock = Math.max(0, prev - requiredAmount);

          await tx.inventoryItem.update({
            where: { id: invItem.id },
            data: { currentStock: nextStock }
          });

          await tx.inventoryMovement.create({
            data: {
              kitchenId,
              inventoryItemId: invItem.id,
              orderId,
              movementType: MovementType.ORDER_DEDUCTION,
              quantityChange: -requiredAmount,
              previousStock: prev,
              newStock: nextStock,
              unitCostAtTime: invItem.unitCost,
              reason: `Order #${order.orderNumber} (${orderItem.quantity}x ${orderItem.itemName})`
            }
          });

          // Check low stock trigger
          if (nextStock <= Number(invItem.minStockThreshold)) {
            await tx.notification.create({
              data: {
                kitchenId,
                title: `Low Stock Alert: ${invItem.name}`,
                message: `Current stock of ${invItem.name} dropped to ${nextStock.toFixed(2)} ${invItem.unit} (Threshold: ${invItem.minStockThreshold} ${invItem.unit}).`,
                type: NotificationType.LOW_STOCK,
                referenceId: invItem.id,
                referenceType: 'InventoryItem'
              }
            });
          }
        }
      }
    }
  }
}
