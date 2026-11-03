import { PrismaClient, UserRole, MembershipRole, OrderSource, OrderStatus, PaymentStatus, MovementType, RecommendationStatus, NotificationType, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed...');

  // Clean existing data in reverse order of foreign keys
  await prisma.auditLog.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.kitchenSubscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.pricingRecommendation.deleteMany();
  await prisma.deliveryRecord.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.kitchenMembership.deleteMany();
  await prisma.kitchen.deleteMany();
  await prisma.user.deleteMany();

  console.log('[Seed] Cleaned existing data.');

  // 1. Subscription Plans
  const starterPlan = await prisma.subscriptionPlan.create({
    data: {
      code: 'starter',
      name: 'Starter Plan',
      description: 'Essential kitchen dashboard, manual order entry, and basic inventory tracking.',
      monthlyPrice: 100,
      annualPrice: 1000,
      maxOrdersPerMonth: 250,
      maxMenuItems: 20,
      maxStaffMembers: 2,
      features: ['Basic Dashboard', 'Manual Order Entry', 'Basic Inventory', 'CSV Export', 'Standard Support']
    }
  });

  const growthPlan = await prisma.subscriptionPlan.create({
    data: {
      code: 'growth',
      name: 'Growth Plan',
      description: 'Advanced analytics, smart pricing recommendations, and delivery performance tracking.',
      monthlyPrice: 299,
      annualPrice: 2990,
      maxOrdersPerMonth: 1000,
      maxMenuItems: 60,
      maxStaffMembers: 5,
      features: ['Full Analytics Suite', 'Smart Pricing Engine', 'Delivery Performance Monitoring', 'Recipe-level Inventory Sync', 'Priority Support']
    }
  });

  const proPlan = await prisma.subscriptionPlan.create({
    data: {
      code: 'pro',
      name: 'Pro Kitchen Plan',
      description: 'Enterprise grade reports, multi-user role access, bulk export tools, and priority delivery intelligence.',
      monthlyPrice: 500,
      annualPrice: 5000,
      maxOrdersPerMonth: 5000,
      maxMenuItems: 200,
      maxStaffMembers: 15,
      features: ['Multi-User Access & Granular Roles', 'Advanced Financial Reports', 'Automated Bulk CSV Sync', 'AI Demand Trends', 'Dedicated Account Manager']
    }
  });

  console.log('[Seed] Created subscription plans.');

  // 2. Users
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const ownerPasswordHash = await bcrypt.hash('Owner@123', 10);
  const staffPasswordHash = await bcrypt.hash('Staff@123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@homebites.in',
      passwordHash: adminPasswordHash,
      fullName: 'Vikramaditya Sen (Platform Administrator)',
      phone: '+91 98888 11111',
      role: UserRole.PLATFORM_ADMIN
    }
  });

  const rahulOwner = await prisma.user.create({
    data: {
      email: 'rahul@biryanibox.in',
      passwordHash: ownerPasswordHash,
      fullName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      role: UserRole.KITCHEN_OWNER
    }
  });

  const priyaStaff = await prisma.user.create({
    data: {
      email: 'priya@biryanibox.in',
      passwordHash: staffPasswordHash,
      fullName: 'Priya Nair',
      phone: '+91 98765 12345',
      role: UserRole.KITCHEN_STAFF
    }
  });

  const ananyaOwner = await prisma.user.create({
    data: {
      email: 'ananya@currycrust.in',
      passwordHash: ownerPasswordHash,
      fullName: 'Ananya Deshmukh',
      phone: '+91 98111 22233',
      role: UserRole.KITCHEN_OWNER
    }
  });

  const userPasswordHash = await bcrypt.hash('User@123', 10);

  const regularCustomer = await prisma.user.create({
    data: {
      email: 'user@homebites.in',
      passwordHash: userPasswordHash,
      fullName: 'Aarav Patel (Customer)',
      phone: '+91 98222 33445',
      role: UserRole.KITCHEN_OWNER
    }
  });

  console.log('[Seed] Created users.');

  // 3. Kitchen 1: Biryani Box Express (Bangalore)
  const kitchen1 = await prisma.kitchen.create({
    data: {
      name: 'Biryani Box Express',
      slug: 'biryani-box',
      description: 'Authentic slow-cooked Hyderabadi dum biryanis and royal Mughlai sides crafted for cloud delivery.',
      address: 'Shop 4, 12th Main Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      phone: '+91 80 4123 4567',
      email: 'orders@biryanibox.in',
      fssaiNumber: '11223344556677',
      gstNumber: '29ABCDE1234F1Z5',
      defaultTargetMargin: 0.65,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      onboardingCompleted: true
    }
  });

  // Assign memberships for Kitchen 1
  await prisma.kitchenMembership.create({
    data: {
      userId: rahulOwner.id,
      kitchenId: kitchen1.id,
      role: MembershipRole.OWNER,
      permissions: ['*']
    }
  });

  await prisma.kitchenMembership.create({
    data: {
      userId: priyaStaff.id,
      kitchenId: kitchen1.id,
      role: MembershipRole.STAFF,
      permissions: ['orders:read', 'orders:write', 'inventory:read', 'inventory:write']
    }
  });

  // Attach Growth Subscription to Kitchen 1
  await prisma.kitchenSubscription.create({
    data: {
      kitchenId: kitchen1.id,
      planId: growthPlan.id,
      status: SubscriptionStatus.ACTIVE,
      isDemoSubscription: true,
      startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  });

  // 4. Kitchen 2: Curry & Crust Kitchen (Mumbai) - for Tenant Isolation Demo
  const kitchen2 = await prisma.kitchen.create({
    data: {
      name: 'Curry & Crust Kitchen',
      slug: 'curry-crust',
      description: 'Artisanal coastal gravies and freshly baked garlic butter flatbreads.',
      address: 'Unit 12, Hill Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      phone: '+91 22 2640 1234',
      email: 'hello@currycrust.in',
      fssaiNumber: '22119988776655',
      gstNumber: '27XYZAB9876C1Z9',
      defaultTargetMargin: 0.60,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      onboardingCompleted: true
    }
  });

  await prisma.kitchenMembership.create({
    data: {
      userId: ananyaOwner.id,
      kitchenId: kitchen2.id,
      role: MembershipRole.OWNER,
      permissions: ['*']
    }
  });

  await prisma.kitchenSubscription.create({
    data: {
      kitchenId: kitchen2.id,
      planId: starterPlan.id,
      status: SubscriptionStatus.TRIAL,
      isDemoSubscription: true,
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  });

  console.log('[Seed] Created kitchens and memberships.');

  // 5. Menu Categories for Kitchen 1
  const catBiryani = await prisma.menuCategory.create({
    data: { kitchenId: kitchen1.id, name: 'Biryanis & Pulao', description: 'Royal dum cooked fragrant rice specialties', sortOrder: 1 }
  });

  const catStarters = await prisma.menuCategory.create({
    data: { kitchenId: kitchen1.id, name: 'Starters & Appetizers', description: 'Crispy, spiced and tandoori bites', sortOrder: 2 }
  });

  const catCurries = await prisma.menuCategory.create({
    data: { kitchenId: kitchen1.id, name: 'Curries & Breads', description: 'Slow-simmered rich curries with soft flatbreads', sortOrder: 3 }
  });

  const catDesserts = await prisma.menuCategory.create({
    data: { kitchenId: kitchen1.id, name: 'Beverages & Desserts', description: 'Traditional sweet treats and refreshing drinks', sortOrder: 4 }
  });

  // 6. Menu Items for Kitchen 1
  const itemChickenBiryani = await prisma.menuItem.create({
    data: {
      kitchenId: kitchen1.id,
      categoryId: catBiryani.id,
      name: 'Hyderabadi Chicken Dum Biryani',
      description: 'Tender chicken marinated in roasted spices and layered with fragrant long-grain Basmati rice, served with mirchi ka salan and raita.',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 280,
      costPrice: 95,
      prepTimeMinutes: 15,
      isAvailable: true,
      tags: 'Bestseller, Non-Veg, Signature'
    }
  });

  const itemMuttonBiryani = await prisma.menuItem.create({
    data: {
      kitchenId: kitchen1.id,
      categoryId: catBiryani.id,
      name: 'Royal Mutton Dum Biryani',
      description: 'Succulent cuts of fresh tender goat meat slow-steamed on charcoal with aromatic saffron rice.',
      imageUrl: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 380,
      costPrice: 155,
      prepTimeMinutes: 20,
      isAvailable: true,
      tags: 'Chef Special, Non-Veg'
    }
  });

  const itemPaneerBiryani = await prisma.menuItem.create({
    data: {
      kitchenId: kitchen1.id,
      categoryId: catBiryani.id,
      name: 'Paneer Tikka Dum Biryani',
      description: 'Char-grilled cottage cheese cubes simmered in spiced onion-tomato gravy layered with aromatic rice.',
      imageUrl: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 240,
      costPrice: 80,
      prepTimeMinutes: 15,
      isAvailable: true,
      tags: 'Vegetarian, Popular'
    }
  });

  const itemChicken65 = await prisma.menuItem.create({
    data: {
      kitchenId: kitchen1.id,
      categoryId: catStarters.id,
      name: 'Crispy Chicken 65',
      description: 'Deep-fried chicken morsels tossed in fiery curry leaves, crushed garlic, and green chili oil.',
      imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 220,
      costPrice: 75,
      prepTimeMinutes: 12,
      isAvailable: true,
      tags: 'Spicy, Non-Veg, Starter'
    }
  });

  const itemPaneerButterMasala = await prisma.menuItem.create({
    data: {
      kitchenId: kitchen1.id,
      categoryId: catCurries.id,
      name: 'Paneer Butter Masala',
      description: 'Velvety makhani gravy prepared with fresh cream, cashew butter, and soft cottage cheese chunks.',
      imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 250,
      costPrice: 85,
      prepTimeMinutes: 15,
      isAvailable: true,
      tags: 'Vegetarian, Gravy'
    }
  });

  const itemButterNaan = await prisma.menuItem.create({
    data: {
      kitchenId: kitchen1.id,
      categoryId: catCurries.id,
      name: 'Butter Naan (2 pcs)',
      description: 'Clay-oven baked leavened flatbread glazed with generous butter.',
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 70,
      costPrice: 18,
      prepTimeMinutes: 8,
      isAvailable: true,
      tags: 'Vegetarian, Bread'
    }
  });

  const itemGulabJamun = await prisma.menuItem.create({
    data: {
      kitchenId: kitchen1.id,
      categoryId: catDesserts.id,
      name: 'Gulab Jamun (2 pcs)',
      description: 'Warm, syrup-soaked milk dumplings flavored with green cardamom and saffron.',
      imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 60,
      costPrice: 15,
      prepTimeMinutes: 5,
      isAvailable: true,
      tags: 'Dessert, Sweet'
    }
  });

  const itemMasalaShikanji = await prisma.menuItem.create({
    data: {
      kitchenId: kitchen1.id,
      categoryId: catDesserts.id,
      name: 'Chilled Masala Shikanji',
      description: 'Fresh squeezed lime infused with roasted cumin, rock salt, mint, and soda.',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 50,
      costPrice: 10,
      prepTimeMinutes: 5,
      isAvailable: true,
      tags: 'Beverage, Cold'
    }
  });

  console.log('[Seed] Created menu items for Kitchen 1.');

  // 6b. Menu Categories & Items for Kitchen 2: Curry & Crust Kitchen
  const catCoastalCurries = await prisma.menuCategory.create({
    data: { kitchenId: kitchen2.id, name: 'Coastal Gravies & Curries', description: 'Slow-simmered seafood and regional curries', sortOrder: 1 }
  });

  const catBreadsRice = await prisma.menuCategory.create({
    data: { kitchenId: kitchen2.id, name: 'Artisanal Flatbreads & Rice', description: 'Freshly baked flaky rotis and soft naans', sortOrder: 2 }
  });

  const catDessertsDrinks = await prisma.menuCategory.create({
    data: { kitchenId: kitchen2.id, name: 'Coolers & Coastal Sweets', description: 'Authentic kokum drinks and coconut payasam', sortOrder: 3 }
  });

  await prisma.menuItem.create({
    data: {
      kitchenId: kitchen2.id,
      categoryId: catCoastalCurries.id,
      name: 'Mangalorean Fish Curry',
      description: 'Fresh seer fish steaks simmered in aromatic roasted Byadgi chilli, fresh grated coconut, and tangy teppal berries.',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 320,
      costPrice: 110,
      prepTimeMinutes: 20,
      isAvailable: true,
      tags: 'Seafood, Non-Veg, Spicy'
    }
  });

  await prisma.menuItem.create({
    data: {
      kitchenId: kitchen2.id,
      categoryId: catCoastalCurries.id,
      name: 'Goan Prawn Balchão',
      description: 'Tiger prawns pan-tossed in a fiery, tangy Goan spice preserve with palm vinegar and caramelized shallots.',
      imageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 360,
      costPrice: 130,
      prepTimeMinutes: 18,
      isAvailable: true,
      tags: 'Seafood, Non-Veg, Chef Special'
    }
  });

  await prisma.menuItem.create({
    data: {
      kitchenId: kitchen2.id,
      categoryId: catCoastalCurries.id,
      name: 'Kundapur Paneer Ghee Roast',
      description: 'Succulent malai cottage cheese cubes roasted in pure desi ghee and dry roasted whole spices.',
      imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 270,
      costPrice: 85,
      prepTimeMinutes: 15,
      isAvailable: true,
      tags: 'Vegetarian, Desi Ghee'
    }
  });

  await prisma.menuItem.create({
    data: {
      kitchenId: kitchen2.id,
      categoryId: catBreadsRice.id,
      name: 'Garlic Butter Naan (2 pcs)',
      description: 'Tandoor-blistered refined flour flatbread brushed with molten butter and minced roasted garlic.',
      imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 80,
      costPrice: 20,
      prepTimeMinutes: 8,
      isAvailable: true,
      tags: 'Vegetarian, Bread'
    }
  });

  await prisma.menuItem.create({
    data: {
      kitchenId: kitchen2.id,
      categoryId: catBreadsRice.id,
      name: 'Malabar Flaky Parotta (2 pcs)',
      description: 'Crisp, multi-layered spiral flatbread toasted golden brown on a heavy iron griddle.',
      imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 75,
      costPrice: 18,
      prepTimeMinutes: 10,
      isAvailable: true,
      tags: 'Vegetarian, Flaky'
    }
  });

  await prisma.menuItem.create({
    data: {
      kitchenId: kitchen2.id,
      categoryId: catDessertsDrinks.id,
      name: 'Authentic Sol Kadhi',
      description: 'Pink kokum nectar infused with coconut cream, garlic, cumin, and fresh green chillies.',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      sellingPrice: 60,
      costPrice: 14,
      prepTimeMinutes: 4,
      isAvailable: true,
      tags: 'Beverage, Cold, Digestive'
    }
  });

  console.log('[Seed] Created menu items for Kitchen 2.');

  // 7. Ingredients & Inventory for Kitchen 1
  const ingRice = await prisma.ingredient.create({
    data: { kitchenId: kitchen1.id, name: 'Premium Basmati Rice', category: 'Grains', unit: 'kg', defaultCostPerUnit: 90 }
  });

  const ingChicken = await prisma.ingredient.create({
    data: { kitchenId: kitchen1.id, name: 'Fresh Chicken Cuts', category: 'Poultry', unit: 'kg', defaultCostPerUnit: 190 }
  });

  const ingMutton = await prisma.ingredient.create({
    data: { kitchenId: kitchen1.id, name: 'Fresh Tender Mutton', category: 'Meat', unit: 'kg', defaultCostPerUnit: 680 }
  });

  const ingPaneer = await prisma.ingredient.create({
    data: { kitchenId: kitchen1.id, name: 'Malai Cottage Cheese (Paneer)', category: 'Dairy', unit: 'kg', defaultCostPerUnit: 320 }
  });

  const ingGhee = await prisma.ingredient.create({
    data: { kitchenId: kitchen1.id, name: 'Pure Desi Ghee', category: 'Dairy', unit: 'kg', defaultCostPerUnit: 620 }
  });

  const ingPackaging = await prisma.ingredient.create({
    data: { kitchenId: kitchen1.id, name: 'Eco Meal Box (750ml)', category: 'Packaging', unit: 'pcs', defaultCostPerUnit: 8 }
  });

  // Create Inventory Items
  const invRice = await prisma.inventoryItem.create({
    data: {
      kitchenId: kitchen1.id,
      ingredientId: ingRice.id,
      name: 'Premium Basmati Rice',
      category: 'Grains',
      unit: 'kg',
      currentStock: 48.5,
      minStockThreshold: 15.0,
      unitCost: 90,
      supplierName: 'Deccan Agro Wholesalers',
      lastRestockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  });

  const invChicken = await prisma.inventoryItem.create({
    data: {
      kitchenId: kitchen1.id,
      ingredientId: ingChicken.id,
      name: 'Fresh Chicken Cuts',
      category: 'Poultry',
      unit: 'kg',
      currentStock: 26.0,
      minStockThreshold: 10.0,
      unitCost: 190,
      supplierName: 'Fresh Farms Hub',
      lastRestockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });

  const invMutton = await prisma.inventoryItem.create({
    data: {
      kitchenId: kitchen1.id,
      ingredientId: ingMutton.id,
      name: 'Fresh Tender Mutton',
      category: 'Meat',
      unit: 'kg',
      currentStock: 12.0,
      minStockThreshold: 6.0,
      unitCost: 680,
      supplierName: 'Halal Royal Meats',
      lastRestockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  });

  const invPaneer = await prisma.inventoryItem.create({
    data: {
      kitchenId: kitchen1.id,
      ingredientId: ingPaneer.id,
      name: 'Malai Cottage Cheese (Paneer)',
      category: 'Dairy',
      unit: 'kg',
      currentStock: 3.2, // Below 5.0kg threshold -> LOW STOCK!
      minStockThreshold: 5.0,
      unitCost: 320,
      supplierName: 'Nandini Dairy Indiranagar',
      lastRestockedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    }
  });

  const invGhee = await prisma.inventoryItem.create({
    data: {
      kitchenId: kitchen1.id,
      ingredientId: ingGhee.id,
      name: 'Pure Desi Ghee',
      category: 'Dairy',
      unit: 'kg',
      currentStock: 14.0,
      minStockThreshold: 4.0,
      unitCost: 620,
      supplierName: 'Amul Depot',
      lastRestockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  });

  const invPackaging = await prisma.inventoryItem.create({
    data: {
      kitchenId: kitchen1.id,
      ingredientId: ingPackaging.id,
      name: 'Eco Meal Box (750ml)',
      category: 'Packaging',
      unit: 'pcs',
      currentStock: 340,
      minStockThreshold: 100,
      unitCost: 8,
      supplierName: 'EcoPack India Ltd',
      lastRestockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  });

  // Record initial restocking movements
  await prisma.inventoryMovement.createMany({
    data: [
      {
        kitchenId: kitchen1.id,
        inventoryItemId: invRice.id,
        movementType: MovementType.RESTOCK,
        quantityChange: 50,
        previousStock: 0,
        newStock: 50,
        unitCostAtTime: 90,
        reason: 'Initial monthly bulk inventory delivery'
      },
      {
        kitchenId: kitchen1.id,
        inventoryItemId: invChicken.id,
        movementType: MovementType.RESTOCK,
        quantityChange: 30,
        previousStock: 0,
        newStock: 30,
        unitCostAtTime: 190,
        reason: 'Daily farm fresh procurement'
      },
      {
        kitchenId: kitchen1.id,
        inventoryItemId: invPaneer.id,
        movementType: MovementType.RESTOCK,
        quantityChange: 10,
        previousStock: 0,
        newStock: 10,
        unitCostAtTime: 320,
        reason: 'Weekly dairy batch'
      }
    ]
  });

  // 8. Configure Recipe for Chicken Biryani
  const recipeChickenBiryani = await prisma.recipe.create({
    data: {
      kitchenId: kitchen1.id,
      menuItemId: itemChickenBiryani.id,
      notes: 'Authentic 1 portion chicken biryani requires 200g basmati rice, 250g chicken, 20g ghee, and 1 meal box.',
      yieldQuantity: 1
    }
  });

  await prisma.recipeIngredient.createMany({
    data: [
      { recipeId: recipeChickenBiryani.id, ingredientId: ingRice.id, quantity: 0.20, unit: 'kg' },
      { recipeId: recipeChickenBiryani.id, ingredientId: ingChicken.id, quantity: 0.25, unit: 'kg' },
      { recipeId: recipeChickenBiryani.id, ingredientId: ingGhee.id, quantity: 0.02, unit: 'kg' },
      { recipeId: recipeChickenBiryani.id, ingredientId: ingPackaging.id, quantity: 1.0, unit: 'pcs' }
    ]
  });

  console.log('[Seed] Created inventory, restock logs, and recipes.');

  // 9. Customers
  const customer1 = await prisma.customer.create({
    data: {
      kitchenId: kitchen1.id,
      name: 'Aditya Verma',
      phone: '+91 98450 11223',
      email: 'aditya.v@example.com',
      address: 'Flat 302, Palm Meadows, Whitefield, Bengaluru',
      totalOrdersCount: 6,
      totalSpent: 2150
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      kitchenId: kitchen1.id,
      name: 'Sneha Kulkarni',
      phone: '+91 99001 22334',
      email: 'sneha.k@example.com',
      address: 'Villa 14, Rainbow Drive, Sarjapur Road, Bengaluru',
      totalOrdersCount: 4,
      totalSpent: 1680
    }
  });

  const customer3 = await prisma.customer.create({
    data: {
      kitchenId: kitchen1.id,
      name: 'Karan Mehra',
      phone: '+91 98190 33445',
      email: 'karan.m@example.com',
      address: 'Tower 3, Prestige Shantiniketan, Bengaluru',
      totalOrdersCount: 3,
      totalSpent: 1240
    }
  });

  // 10. Realistic Order History (spanning 30 days)
  console.log('[Seed] Generating realistic order dataset...');
  const menuList = [
    itemChickenBiryani,
    itemMuttonBiryani,
    itemPaneerBiryani,
    itemChicken65,
    itemPaneerButterMasala,
    itemButterNaan,
    itemGulabJamun,
    itemMasalaShikanji
  ];

  const sources = [
    OrderSource.DIRECT_ONLINE,
    OrderSource.PHONE_TAKEAWAY,
    OrderSource.SWIGGY_ADAPTER,
    OrderSource.ZOMATO_ADAPTER,
    OrderSource.CSV_IMPORT
  ];

  const now = new Date();
  let orderSeq = 1001;

  // Generate 45 realistic orders distributed across the past 30 days
  for (let dayOffset = 29; dayOffset >= 0; dayOffset--) {
    // 1 to 3 orders per day
    const ordersTodayCount = dayOffset === 0 ? 3 : (dayOffset % 3 === 0 ? 3 : (dayOffset % 2 === 0 ? 2 : 1));

    for (let o = 0; o < ordersTodayCount; o++) {
      const orderDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000 + (12 + (o * 3)) * 60 * 60 * 1000);
      const isToday = dayOffset === 0;

      let status = OrderStatus.DELIVERED;
      let paymentStatus = PaymentStatus.PAID;

      if (isToday) {
        if (o === 0) status = OrderStatus.OUT_FOR_DELIVERY;
        else if (o === 1) status = OrderStatus.PREPARING;
        else status = OrderStatus.CONFIRMED;
      } else if (dayOffset === 1 && o === 0) {
        status = OrderStatus.DELIVERED;
      } else if (dayOffset === 7 && o === 1) {
        status = OrderStatus.CANCELLED;
        paymentStatus = PaymentStatus.REFUNDED;
      }

      const source = sources[(orderSeq + o) % sources.length];
      const customer = [customer1, customer2, customer3, null][orderSeq % 4];
      const customerName = customer ? customer.name : `Guest Diner #${(orderSeq % 900) + 100}`;
      const customerPhone = customer ? customer.phone : `+91 97410 ${10000 + (orderSeq % 89999)}`;
      const customerAddress = customer ? customer.address : 'Indiranagar 100ft Road, Bengaluru';

      // Pick 1 to 3 items
      const item1 = menuList[orderSeq % menuList.length];
      const item2 = menuList[(orderSeq + 2) % menuList.length];

      const qty1 = (orderSeq % 3) + 1;
      const subtotal1 = Number(item1.sellingPrice) * qty1;
      const cost1 = Number(item1.costPrice) * qty1;

      let subtotal2 = 0;
      let cost2 = 0;
      const hasItem2 = orderSeq % 2 === 0;
      const qty2 = 1;

      if (hasItem2) {
        subtotal2 = Number(item2.sellingPrice) * qty2;
        cost2 = Number(item2.costPrice) * qty2;
      }

      const subtotal = subtotal1 + subtotal2;
      const tax = Math.round(subtotal * 0.05); // 5% GST on cloud kitchen restaurant service
      const deliveryFee = source === OrderSource.PHONE_TAKEAWAY ? 0 : 35;
      const discount = (orderSeq % 5 === 0) ? 30 : 0;
      const total = subtotal + tax + deliveryFee - discount;

      const orderNumber = `HB-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}-${orderSeq}`;

      const createdOrder = await prisma.order.create({
        data: {
          orderNumber: orderNumber,
          kitchenId: kitchen1.id,
          customerId: customer?.id,
          customerName: customerName,
          customerPhone: customerPhone,
          customerAddress: customerAddress,
          source: source,
          externalReference: (source === OrderSource.SWIGGY_ADAPTER || source === OrderSource.ZOMATO_ADAPTER) ? `EXT-${orderSeq * 7}` : null,
          status: status,
          paymentStatus: paymentStatus,
          paymentMethod: source === OrderSource.PHONE_TAKEAWAY ? 'Cash on Pickup' : 'UPI (PhonePe / GPay)',
          subtotal: subtotal,
          taxAmount: tax,
          discountAmount: discount,
          deliveryFee: deliveryFee,
          totalAmount: total,
          notes: (orderSeq % 4 === 0) ? 'Please pack extra onions and green chutney.' : null,
          cancellationReason: status === OrderStatus.CANCELLED ? 'Delivery partner unable to assign rider in extreme rain' : null,
          cancelledAt: status === OrderStatus.CANCELLED ? new Date(orderDate.getTime() + 15 * 60 * 1000) : null,
          createdAt: orderDate,
          updatedAt: orderDate
        }
      });

      // Order Items
      await prisma.orderItem.create({
        data: {
          orderId: createdOrder.id,
          menuItemId: item1.id,
          itemName: item1.name,
          unitPrice: item1.sellingPrice,
          costPriceSnapshot: item1.costPrice,
          quantity: qty1,
          subtotal: subtotal1,
          createdAt: orderDate
        }
      });

      if (hasItem2) {
        await prisma.orderItem.create({
          data: {
            orderId: createdOrder.id,
            menuItemId: item2.id,
            itemName: item2.name,
            unitPrice: item2.sellingPrice,
            costPriceSnapshot: item2.costPrice,
            quantity: qty2,
            subtotal: subtotal2,
            createdAt: orderDate
          }
        });
      }

      // Status History
      await prisma.orderStatusHistory.create({
        data: {
          orderId: createdOrder.id,
          fromStatus: null,
          toStatus: OrderStatus.CONFIRMED,
          comment: 'Order placed and accepted automatically',
          timestamp: orderDate
        }
      });

      if (status !== OrderStatus.CANCELLED && status !== OrderStatus.CONFIRMED) {
        await prisma.orderStatusHistory.create({
          data: {
            orderId: createdOrder.id,
            fromStatus: OrderStatus.CONFIRMED,
            toStatus: OrderStatus.PREPARING,
            comment: 'Kitchen started food preparation',
            timestamp: new Date(orderDate.getTime() + 5 * 60 * 1000)
          }
        });

        if (status === OrderStatus.OUT_FOR_DELIVERY || status === OrderStatus.DELIVERED) {
          await prisma.orderStatusHistory.create({
            data: {
              orderId: createdOrder.id,
              fromStatus: OrderStatus.PREPARING,
              toStatus: OrderStatus.OUT_FOR_DELIVERY,
              comment: 'Order handed over to delivery executive',
              timestamp: new Date(orderDate.getTime() + 18 * 60 * 1000)
            }
          });
        }

        if (status === OrderStatus.DELIVERED) {
          await prisma.orderStatusHistory.create({
            data: {
              orderId: createdOrder.id,
              fromStatus: OrderStatus.OUT_FOR_DELIVERY,
              toStatus: OrderStatus.DELIVERED,
              comment: 'Customer received warm delivery',
              timestamp: new Date(orderDate.getTime() + 38 * 60 * 1000)
            }
          });
        }
      }

      // Delivery Record
      const prepDuration = 14 + (orderSeq % 8);
      const deliveryDuration = 18 + (orderSeq % 14);
      const isDelayed = deliveryDuration > 28;

      await prisma.deliveryRecord.create({
        data: {
          orderId: createdOrder.id,
          kitchenId: kitchen1.id,
          deliveryPartner: source === OrderSource.SWIGGY_ADAPTER ? 'Swiggy Fleet' : (source === OrderSource.ZOMATO_ADAPTER ? 'Zomato Fleet' : 'Shadowfax On-Demand'),
          riderName: `Rider ${['Ramesh', 'Manjunath', 'Imran', 'Suresh'][orderSeq % 4]}`,
          riderPhone: `+91 99887 ${20000 + (orderSeq % 50000)}`,
          prepStartTime: orderDate,
          prepEndTime: new Date(orderDate.getTime() + prepDuration * 60 * 1000),
          dispatchTime: new Date(orderDate.getTime() + prepDuration * 60 * 1000),
          estimatedDeliveryTime: new Date(orderDate.getTime() + 35 * 60 * 1000),
          actualDeliveryTime: status === OrderStatus.DELIVERED ? new Date(orderDate.getTime() + (prepDuration + deliveryDuration) * 60 * 1000) : null,
          prepDurationMinutes: prepDuration,
          deliveryDurationMinutes: status === OrderStatus.DELIVERED ? deliveryDuration : null,
          isDelayed: isDelayed,
          delayReason: isDelayed ? 'Peak traffic bottleneck on 100ft road' : null
        }
      });

      orderSeq++;
    }
  }

  console.log(`[Seed] Created ${orderSeq - 1001} historical and active orders.`);

  // 11. Smart Pricing Recommendations for Kitchen 1
  // Hyderabadi Chicken Biryani: Cost: 95, Current Selling: 280.
  // Formula: Candidate price = Cost / (1 - Target Margin) -> 95 / (1 - 0.65) = 95 / 0.35 = 271.42 -> ~280
  // Royal Mutton Biryani: Cost: 155, Current Selling: 380. Target 65% -> 155 / 0.35 = 442.85 -> Underpriced! Recommend 420-440!
  await prisma.pricingRecommendation.create({
    data: {
      kitchenId: kitchen1.id,
      menuItemId: itemMuttonBiryani.id,
      currentPrice: 380,
      estimatedCost: 155,
      currentContribution: 225, // 380 - 155 = 225 (59.2% margin, below target 65%)
      targetMargin: 0.65,
      candidatePrice: 440,
      suggestedMinPrice: 410,
      suggestedMaxPrice: 450,
      historicalSalesCount: 38,
      demandTrend: 'HIGH',
      confidenceScore: 0.88,
      status: RecommendationStatus.PENDING,
      reason: 'Raw mutton procurement prices have stabilized at Rs. 680/kg. Current unit contribution margin is 59.2%, below your target 65%. High demand elasticity indicates opportunity to adjust price to Rs. 420 - Rs. 440 without dropping volume.'
    }
  });

  await prisma.pricingRecommendation.create({
    data: {
      kitchenId: kitchen1.id,
      menuItemId: itemChicken65.id,
      currentPrice: 220,
      estimatedCost: 75,
      currentContribution: 145, // 220 - 75 = 145 (65.9% margin)
      targetMargin: 0.65,
      candidatePrice: 215,
      suggestedMinPrice: 210,
      suggestedMaxPrice: 230,
      historicalSalesCount: 42,
      demandTrend: 'HIGH',
      confidenceScore: 0.92,
      status: RecommendationStatus.PENDING,
      reason: 'Optimal unit contribution of Rs. 145 matches your 65% target margin perfectly. Consider bundling with Biryanis for higher average order value.'
    }
  });

  await prisma.pricingRecommendation.create({
    data: {
      kitchenId: kitchen1.id,
      menuItemId: itemPaneerBiryani.id,
      currentPrice: 240,
      estimatedCost: 80,
      currentContribution: 160,
      targetMargin: 0.65,
      candidatePrice: 250,
      suggestedMinPrice: 235,
      suggestedMaxPrice: 255,
      historicalSalesCount: 22,
      demandTrend: 'MODERATE',
      confidenceScore: 0.74,
      status: RecommendationStatus.PENDING,
      reason: 'Moderate weekend lunch demand spikes. Current margin is 66.6%. Maintaining price preserves vegetarian loyalty.'
    }
  });

  // 12. Notifications for Kitchen 1
  await prisma.notification.createMany({
    data: [
      {
        kitchenId: kitchen1.id,
        title: 'Low Stock Alert: Malai Paneer',
        message: 'Current inventory for Malai Cottage Cheese (Paneer) is 3.2 kg, which is below the safe threshold of 5.0 kg. Restock soon to prevent order rejections.',
        type: NotificationType.LOW_STOCK,
        isRead: false
      },
      {
        kitchenId: kitchen1.id,
        title: 'New Pricing Recommendation Available',
        message: 'An explainable pricing optimization recommendation is ready for Royal Mutton Dum Biryani.',
        type: NotificationType.PRICING_ALERT,
        isRead: false
      },
      {
        kitchenId: kitchen1.id,
        title: 'Daily Delivery Performance Summary',
        message: 'Yesterday 92% of orders were completed within estimated arrival time. Average preparation duration: 16.4 mins.',
        type: NotificationType.SYSTEM,
        isRead: true,
        readAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    ]
  });

  // 13. Contact Messages
  await prisma.contactMessage.createMany({
    data: [
      {
        name: 'Arjun Singhania',
        email: 'arjun@bowlcompany.in',
        businessName: 'BowlCo Kitchens',
        subject: 'Enterprise Multi-Outlet Setup Inquiry',
        message: 'We operate 8 cloud kitchen outlets across Pune and Hyderabad and want to evaluate HomeBites for multi-branch inventory tracking and real-time order visibility.',
        status: 'UNREAD'
      },
      {
        name: 'Fatima Zafar',
        email: 'fatima@zafarsdelights.com',
        businessName: 'Zafar Kitchen Delights',
        subject: 'Custom POS & Recipe Integration',
        message: 'Interested in understanding how the recipe-ingredient stock deduction functions when orders come via CSV import.',
        status: 'READ'
      }
    ]
  });

  // 14. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        kitchenId: kitchen1.id,
        userId: rahulOwner.id,
        action: 'KITCHEN_PROFILE_UPDATED',
        entityType: 'Kitchen',
        entityId: kitchen1.id,
        details: JSON.stringify({ message: 'Kitchen address and FSSAI license updated' })
      },
      {
        kitchenId: kitchen1.id,
        userId: rahulOwner.id,
        action: 'SUBSCRIPTION_ACTIVATED',
        entityType: 'KitchenSubscription',
        entityId: growthPlan.id,
        details: JSON.stringify({ plan: 'growth', mode: 'demonstration' })
      },
      {
        kitchenId: null,
        userId: adminUser.id,
        action: 'PLATFORM_LOGIN',
        entityType: 'User',
        entityId: adminUser.id,
        details: JSON.stringify({ ip: '127.0.0.1', userAgent: 'System Seed' })
      }
    ]
  });

  console.log('[Seed] Database seed completed successfully!');
  console.log('----------------------------------------------------');
  console.log('DEMO ACCOUNTS CREATED:');
  console.log('1. Admin: admin@homebites.in | Password: Admin@123');
  console.log('2. Kitchen Owner: rahul@biryanibox.in | Password: Owner@123 (Biryani Box Express)');
  console.log('3. Kitchen Staff: priya@biryanibox.in | Password: Staff@123');
  console.log('4. Separate Kitchen Owner: ananya@currycrust.in | Password: Owner@123 (Curry & Crust)');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('[Seed] Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
