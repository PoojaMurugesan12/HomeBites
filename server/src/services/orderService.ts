import prisma from '../config/db';
import { OrderStatus, OrderSource, PaymentStatus, Prisma } from '@prisma/client';
import { InventoryService } from './inventoryService';
import { emitToKitchen } from '../socket';

export interface CreateOrderInput {
  kitchenId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  source?: OrderSource;
  paymentMethod?: string;
  deliveryFee?: number;
  discountAmount?: number;
  notes?: string;
  items: {
    menuItemId?: string;
    itemName: string;
    unitPrice: number;
    quantity: number;
    notes?: string;
  }[];
  userId?: string;
}

export class OrderService {
  /**
   * Validate order status transitions
   */
  static isValidTransition(current: OrderStatus, target: OrderStatus): boolean {
    if (current === target) return true;
    if (current === OrderStatus.CANCELLED) return false;
    if (current === OrderStatus.DELIVERED) return false;

    // Any status prior to DELIVERED can transition to CANCELLED
    if (target === OrderStatus.CANCELLED) return true;

    const allowedNextSteps: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
      [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: []
    };

    return allowedNextSteps[current]?.includes(target) || false;
  }

  /**
   * Create an order with line items, price snapshots, and delivery record
   */
  static async createOrder(input: CreateOrderInput) {
    const { kitchenId, customerName, customerPhone, customerAddress, source, paymentMethod, deliveryFee = 0, discountAmount = 0, notes, items, userId } = input;

    return await prisma.$transaction(async (tx) => {
      // Calculate totals
      let subtotal = 0;
      const preparedItems = [];

      for (const item of items) {
        let costPrice = 0;
        if (item.menuItemId) {
          const menuItem = await tx.menuItem.findUnique({ where: { id: item.menuItemId } });
          if (menuItem) {
            costPrice = Number(menuItem.costPrice);
          }
        }
        const itemSubtotal = item.unitPrice * item.quantity;
        subtotal += itemSubtotal;

        preparedItems.push({
          menuItemId: item.menuItemId || null,
          itemName: item.itemName,
          unitPrice: item.unitPrice,
          costPriceSnapshot: costPrice,
          quantity: item.quantity,
          subtotal: itemSubtotal,
          notes: item.notes
        });
      }

      // 5% standard GST on restaurant food service in India
      const taxAmount = Math.round(subtotal * 0.05);
      const totalAmount = Math.max(0, subtotal + taxAmount + deliveryFee - discountAmount);

      // Generate sequential order number: HB-YYYYMMDD-XXXX
      const today = new Date();
      const datePrefix = `HB-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      const countToday = await tx.order.count({
        where: {
          kitchenId,
          orderNumber: { startsWith: datePrefix }
        }
      });
      const orderNumber = `${datePrefix}-${String(countToday + 101).padStart(4, '0')}`;

      // Find or create customer if phone provided
      let customerId: string | null = null;
      if (customerPhone) {
        let customer = await tx.customer.findFirst({
          where: { kitchenId, phone: customerPhone }
        });
        if (!customer) {
          customer = await tx.customer.create({
            data: {
              kitchenId,
              name: customerName,
              phone: customerPhone,
              address: customerAddress,
              totalOrdersCount: 1,
              totalSpent: totalAmount
            }
          });
        } else {
          await tx.customer.update({
            where: { id: customer.id },
            data: {
              totalOrdersCount: { increment: 1 },
              totalSpent: { increment: totalAmount },
              name: customerName,
              address: customerAddress || customer.address
            }
          });
        }
        customerId = customer.id;
      }

      const initialStatus = OrderStatus.CONFIRMED;

      const order = await tx.order.create({
        data: {
          orderNumber,
          kitchenId,
          customerId,
          customerName,
          customerPhone,
          customerAddress,
          source: source || OrderSource.DIRECT_ONLINE,
          status: initialStatus,
          paymentStatus: PaymentStatus.PAID,
          paymentMethod: paymentMethod || 'UPI',
          subtotal,
          taxAmount,
          discountAmount,
          deliveryFee,
          totalAmount,
          notes,
          items: {
            create: preparedItems
          },
          statusHistory: {
            create: {
              toStatus: initialStatus,
              comment: 'Order placed and confirmed',
              changedByUserId: userId
            }
          },
          deliveryRecord: {
            create: {
              kitchenId,
              prepStartTime: new Date(),
              estimatedDeliveryTime: new Date(Date.now() + 35 * 60 * 1000)
            }
          }
        },
        include: {
          items: true,
          deliveryRecord: true
        }
      });

      // Deduct recipe ingredients automatically
      await InventoryService.deductOrderIngredients(kitchenId, order.id, tx);

      // Create notification
      await tx.notification.create({
        data: {
          kitchenId,
          title: `New Order: #${order.orderNumber}`,
          message: `${order.customerName} placed an order of Rs. ${totalAmount} (${items.length} items)`,
          type: 'NEW_ORDER',
          referenceId: order.id,
          referenceType: 'Order'
        }
      });

      // Emit real-time socket event to the kitchen
      emitToKitchen(kitchenId, 'order_created', order);

      return order;
    });
  }

  /**
   * Update order status with state machine checks and delivery metrics updates
   */
  static async updateOrderStatus(
    orderId: string,
    kitchenId: string,
    targetStatus: OrderStatus,
    comment?: string,
    userId?: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, kitchenId },
        include: { deliveryRecord: true }
      });

      if (!order) {
        throw new Error('Order not found or access denied.');
      }

      if (!this.isValidTransition(order.status, targetStatus)) {
        throw new Error(`Invalid status transition from "${order.status}" to "${targetStatus}".`);
      }

      const now = new Date();

      // Update delivery record timings
      if (order.deliveryRecord) {
        const updateData: any = {};
        if (targetStatus === OrderStatus.PREPARING && !order.deliveryRecord.prepStartTime) {
          updateData.prepStartTime = now;
        } else if (
          (targetStatus === OrderStatus.READY_FOR_PICKUP || targetStatus === OrderStatus.OUT_FOR_DELIVERY) &&
          !order.deliveryRecord.prepEndTime
        ) {
          updateData.prepEndTime = now;
          updateData.dispatchTime = now;
          if (order.deliveryRecord.prepStartTime) {
            const prepMins = Math.round((now.getTime() - new Date(order.deliveryRecord.prepStartTime).getTime()) / 60000);
            updateData.prepDurationMinutes = Math.max(1, prepMins);
          }
        } else if (targetStatus === OrderStatus.DELIVERED) {
          updateData.actualDeliveryTime = now;
          const startTime = order.deliveryRecord.dispatchTime || order.deliveryRecord.prepEndTime || order.createdAt;
          const deliveryMins = Math.round((now.getTime() - new Date(startTime).getTime()) / 60000);
          updateData.deliveryDurationMinutes = Math.max(1, deliveryMins);

          // Check if delayed past estimatedDeliveryTime
          if (order.deliveryRecord.estimatedDeliveryTime) {
            updateData.isDelayed = now > new Date(order.deliveryRecord.estimatedDeliveryTime);
            if (updateData.isDelayed) {
              updateData.delayReason = 'Transit delay during delivery';
            }
          }
        }

        if (Object.keys(updateData).length > 0) {
          await tx.deliveryRecord.update({
            where: { id: order.deliveryRecord.id },
            data: updateData
          });
        }
      }

      // Update order
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: targetStatus,
          statusHistory: {
            create: {
              fromStatus: order.status,
              toStatus: targetStatus,
              comment: comment || `Status updated to ${targetStatus}`,
              changedByUserId: userId,
              timestamp: now
            }
          }
        },
        include: {
          items: true,
          deliveryRecord: true,
          statusHistory: {
            orderBy: { timestamp: 'desc' }
          }
        }
      });

      // If moved to CONFIRMED or PREPARING, ensure ingredients deducted
      if (targetStatus === OrderStatus.CONFIRMED || targetStatus === OrderStatus.PREPARING) {
        await InventoryService.deductOrderIngredients(kitchenId, orderId, tx);
      }

      emitToKitchen(kitchenId, 'order_status_updated', updatedOrder);

      return updatedOrder;
    });
  }

  /**
   * Cancel an order with recorded reason
   */
  static async cancelOrder(orderId: string, kitchenId: string, reason: string, userId?: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, kitchenId }
      });

      if (!order) {
        throw new Error('Order not found.');
      }

      if (order.status === OrderStatus.DELIVERED) {
        throw new Error('Cannot cancel an order that has already been delivered.');
      }

      const cancelledOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancellationReason: reason,
          cancelledAt: new Date(),
          statusHistory: {
            create: {
              fromStatus: order.status,
              toStatus: OrderStatus.CANCELLED,
              comment: `Cancelled: ${reason}`,
              changedByUserId: userId
            }
          }
        },
        include: {
          items: true,
          deliveryRecord: true
        }
      });

      emitToKitchen(kitchenId, 'order_cancelled', cancelledOrder);

      return cancelledOrder;
    });
  }
}
