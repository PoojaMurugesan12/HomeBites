import { describe, it, expect } from 'vitest';
import { OrderService } from '../../server/src/services/orderService';
import { OrderStatus } from '@prisma/client';

describe('Order Lifecycle State Machine', () => {
  it('allows valid sequential status progression', () => {
    expect(OrderService.isValidTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED)).toBe(true);
    expect(OrderService.isValidTransition(OrderStatus.CONFIRMED, OrderStatus.PREPARING)).toBe(true);
    expect(OrderService.isValidTransition(OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP)).toBe(true);
    expect(OrderService.isValidTransition(OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY)).toBe(true);
    expect(OrderService.isValidTransition(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED)).toBe(true);
  });

  it('allows cancellation from any active in-flight stage prior to delivery', () => {
    expect(OrderService.isValidTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true);
    expect(OrderService.isValidTransition(OrderStatus.CONFIRMED, OrderStatus.CANCELLED)).toBe(true);
    expect(OrderService.isValidTransition(OrderStatus.PREPARING, OrderStatus.CANCELLED)).toBe(true);
    expect(OrderService.isValidTransition(OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED)).toBe(true);
    expect(OrderService.isValidTransition(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED)).toBe(true);
  });

  it('prohibits invalid status skips or backwards transitions', () => {
    // Cannot skip from PENDING directly to DELIVERED
    expect(OrderService.isValidTransition(OrderStatus.PENDING, OrderStatus.DELIVERED)).toBe(false);
    // Cannot move backwards from DELIVERED to PREPARING
    expect(OrderService.isValidTransition(OrderStatus.DELIVERED, OrderStatus.PREPARING)).toBe(false);
    // Cannot un-cancel a cancelled order
    expect(OrderService.isValidTransition(OrderStatus.CANCELLED, OrderStatus.CONFIRMED)).toBe(false);
    // Cannot cancel already delivered order
    expect(OrderService.isValidTransition(OrderStatus.DELIVERED, OrderStatus.CANCELLED)).toBe(false);
  });
});
