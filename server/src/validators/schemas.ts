import { z } from 'zod';
import { OrderSource, OrderStatus } from '@prisma/client';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(2, 'Kitchen / business name must be at least 2 characters'),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms of service and privacy policy'
  })
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'New password must be at least 8 characters')
});

export const orderCreateSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().optional(),
  customerAddress: z.string().optional(),
  source: z.nativeEnum(OrderSource).default(OrderSource.DIRECT_ONLINE),
  paymentMethod: z.string().optional().default('UPI'),
  deliveryFee: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      menuItemId: z.string().optional(),
      itemName: z.string().min(1, 'Item name is required'),
      unitPrice: z.number().positive('Unit price must be greater than 0'),
      quantity: z.number().int().positive('Quantity must be at least 1'),
      notes: z.string().optional()
    })
  ).min(1, 'Order must include at least one item')
});

export const orderStatusUpdateSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  comment: z.string().optional()
});

export const orderCancelSchema = z.object({
  reason: z.string().min(3, 'Cancellation reason is required')
});

export const menuItemSchema = z.object({
  name: z.string().min(2, 'Menu item name is required'),
  categoryId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  sellingPrice: z.number().positive('Selling price must be greater than 0'),
  costPrice: z.number().min(0, 'Cost price cannot be negative'),
  prepTimeMinutes: z.number().int().min(1).default(15),
  isAvailable: z.boolean().default(true),
  tags: z.string().optional().nullable()
});

export const inventoryItemSchema = z.object({
  name: z.string().min(2, 'Item / ingredient name is required'),
  category: z.string().optional().nullable(),
  unit: z.string().min(1, 'Unit of measure is required (e.g. kg, g, L, pcs)'),
  currentStock: z.number().min(0, 'Current stock cannot be negative'),
  minStockThreshold: z.number().min(0, 'Min stock threshold cannot be negative'),
  unitCost: z.number().min(0, 'Unit cost cannot be negative'),
  supplierName: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable()
});

export const inventoryRestockSchema = z.object({
  quantity: z.number().positive('Restock quantity must be greater than 0'),
  unitCost: z.number().min(0).optional(),
  reason: z.string().optional().default('Standard supplier replenishment')
});

export const inventoryAdjustSchema = z.object({
  quantityChange: z.number(), // positive or negative
  reason: z.string().min(2, 'Reason for stock adjustment is required (e.g. spoilage, audit discrepancy)')
});

export const recipeSchema = z.object({
  menuItemId: z.string().uuid(),
  notes: z.string().optional(),
  yieldQuantity: z.number().int().positive().default(1),
  ingredients: z.array(
    z.object({
      ingredientId: z.string().uuid(),
      quantity: z.number().positive(),
      unit: z.string()
    })
  ).min(1, 'Recipe must have at least one ingredient')
});

export const pricingDecisionSchema = z.object({
  decision: z.enum(['ACCEPTED', 'REJECTED', 'DISMISSED']),
  approvedPrice: z.number().positive().optional()
});

export const contactMessageSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  businessName: z.string().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters')
});

export const kitchenUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  fssaiNumber: z.string().optional(),
  gstNumber: z.string().optional(),
  defaultTargetMargin: z.number().min(0.01).max(0.99).optional()
});
