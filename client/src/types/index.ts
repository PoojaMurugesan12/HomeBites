export type UserRole = 'KITCHEN_OWNER' | 'KITCHEN_STAFF' | 'PLATFORM_ADMIN';
export type MembershipRole = 'OWNER' | 'MANAGER' | 'CHEF' | 'STAFF';

export type OrderSource =
  | 'DIRECT_ONLINE'
  | 'PHONE_TAKEAWAY'
  | 'DINE_IN'
  | 'CSV_IMPORT'
  | 'SWIGGY_ADAPTER'
  | 'ZOMATO_ADAPTER'
  | 'OTHER';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type MovementType = 'RESTOCK' | 'ORDER_DEDUCTION' | 'SPOILAGE_WASTE' | 'AUDIT_ADJUSTMENT' | 'RETURN';
export type RecommendationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'DISMISSED';
export type NotificationType = 'NEW_ORDER' | 'ORDER_STATUS' | 'LOW_STOCK' | 'PRICING_ALERT' | 'SYSTEM';
export type SubscriptionStatus = 'TRIAL' | 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  role: UserRole;
}

export interface KitchenMembership {
  kitchenId: string;
  kitchenName?: string;
  role: MembershipRole;
  permissions: string[];
}

export interface Kitchen {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  phone?: string | null;
  email?: string | null;
  fssaiNumber?: string | null;
  gstNumber?: string | null;
  defaultTargetMargin: number;
  currency: string;
  timezone: string;
  onboardingCompleted: boolean;
  role?: MembershipRole;
  subscription?: {
    id: string;
    status: SubscriptionStatus;
    isDemoSubscription: boolean;
    expiresAt?: string | null;
    plan: {
      id: string;
      code: string;
      name: string;
      monthlyPrice: number;
      features: string[];
    };
  } | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId?: string | null;
  itemName: string;
  unitPrice: number;
  costPriceSnapshot: number;
  quantity: number;
  subtotal: number;
  notes?: string | null;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  fromStatus?: OrderStatus | null;
  toStatus: OrderStatus;
  comment?: string | null;
  timestamp: string;
  changedByUser?: { fullName: string; role: string } | null;
}

export interface DeliveryRecord {
  id: string;
  orderId: string;
  deliveryPartner?: string | null;
  riderName?: string | null;
  riderPhone?: string | null;
  prepStartTime?: string | null;
  prepEndTime?: string | null;
  dispatchTime?: string | null;
  estimatedDeliveryTime?: string | null;
  actualDeliveryTime?: string | null;
  prepDurationMinutes?: number | null;
  deliveryDurationMinutes?: number | null;
  isDelayed: boolean;
  delayReason?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  kitchenId: string;
  customerId?: string | null;
  customerName: string;
  customerPhone?: string | null;
  customerAddress?: string | null;
  source: OrderSource;
  externalReference?: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string | null;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  deliveryFee: number;
  totalAmount: number;
  notes?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  deliveryRecord?: DeliveryRecord | null;
  statusHistory?: OrderStatusHistory[];
}

export interface MenuCategory {
  id: string;
  kitchenId: string;
  name: string;
  description?: string | null;
  sortOrder: number;
  _count?: { menuItems: number };
}

export interface MenuItem {
  id: string;
  kitchenId: string;
  categoryId?: string | null;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  sellingPrice: number;
  costPrice: number;
  prepTimeMinutes: number;
  isAvailable: boolean;
  tags?: string | null;
  category?: MenuCategory | null;
  recipe?: {
    id: string;
    notes?: string | null;
    yieldQuantity: number;
    ingredients: {
      id: string;
      ingredientId: string;
      quantity: number;
      unit: string;
      ingredient: { name: string; unit: string };
    }[];
  } | null;
  _count?: { orderItems: number };
}

export interface InventoryItem {
  id: string;
  kitchenId: string;
  ingredientId?: string | null;
  name: string;
  category?: string | null;
  unit: string;
  currentStock: number;
  minStockThreshold: number;
  unitCost: number;
  supplierName?: string | null;
  lastRestockedAt?: string | null;
  expiryDate?: string | null;
}

export interface InventoryMovement {
  id: string;
  kitchenId: string;
  inventoryItemId: string;
  orderId?: string | null;
  movementType: MovementType;
  quantityChange: number;
  previousStock: number;
  newStock: number;
  unitCostAtTime?: number | null;
  reason?: string | null;
  createdAt: string;
  inventoryItem?: { name: string; unit: string };
  order?: { orderNumber: string; customerName: string } | null;
}

export interface PricingRecommendation {
  id: string;
  kitchenId: string;
  menuItemId: string;
  currentPrice: number;
  estimatedCost: number;
  currentContribution: number;
  targetMargin: number;
  candidatePrice: number;
  suggestedMinPrice: number;
  suggestedMaxPrice: number;
  historicalSalesCount: number;
  demandTrend: 'HIGH' | 'MODERATE' | 'LOW' | 'INSUFFICIENT_DATA';
  confidenceScore: number;
  status: RecommendationStatus;
  reason: string;
  decisionTimestamp?: string | null;
  menuItem: {
    id: string;
    name: string;
    imageUrl?: string | null;
    sellingPrice: number;
    costPrice: number;
  };
  decidedByUser?: { fullName: string } | null;
}

export interface Notification {
  id: string;
  kitchenId: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: string | null;
  referenceType?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice?: number | null;
  maxOrdersPerMonth?: number | null;
  maxMenuItems?: number | null;
  maxStaffMembers?: number | null;
  features: string[];
}
