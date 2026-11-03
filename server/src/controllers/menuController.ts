import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { menuItemSchema, recipeSchema } from '../validators/schemas';

export class MenuController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const categoryId = req.query.categoryId as string | undefined;
      const search = (req.query.search as string || '').trim();

      const items = await prisma.menuItem.findMany({
        where: {
          kitchenId,
          isArchived: false,
          ...(categoryId ? { categoryId } : {}),
          ...(search ? { name: { contains: search, mode: 'insensitive' } } : {})
        },
        include: {
          category: true,
          recipe: {
            include: {
              ingredients: {
                include: { ingredient: true }
              }
            }
          },
          _count: {
            select: { orderItems: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const categories = await prisma.menuCategory.findMany({
        where: { kitchenId, isActive: true },
        orderBy: { sortOrder: 'asc' }
      });

      res.status(200).json({
        success: true,
        items,
        categories
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const data = menuItemSchema.parse(req.body);

      const item = await prisma.menuItem.create({
        data: {
          kitchenId,
          name: data.name,
          categoryId: data.categoryId || null,
          description: data.description || null,
          imageUrl: data.imageUrl || null,
          sellingPrice: data.sellingPrice,
          costPrice: data.costPrice,
          prepTimeMinutes: data.prepTimeMinutes,
          isAvailable: data.isAvailable,
          tags: data.tags || null
        },
        include: { category: true }
      });

      await prisma.auditLog.create({
        data: {
          kitchenId,
          userId: req.user?.id,
          action: 'MENU_ITEM_CREATED',
          entityType: 'MenuItem',
          entityId: item.id,
          details: JSON.stringify({ name: item.name, price: item.sellingPrice })
        }
      });

      res.status(201).json({
        success: true,
        message: `Menu item "${item.name}" added successfully.`,
        item
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const id = req.params.id as string;
      const data = menuItemSchema.parse(req.body);

      const existing = await prisma.menuItem.findFirst({
        where: { id, kitchenId }
      });

      if (!existing) {
        res.status(404).json({ success: false, error: 'Menu item not found.' });
        return;
      }

      const updated = await prisma.menuItem.update({
        where: { id },
        data: {
          name: data.name,
          categoryId: data.categoryId || null,
          description: data.description || null,
          imageUrl: data.imageUrl || null,
          sellingPrice: data.sellingPrice,
          costPrice: data.costPrice,
          prepTimeMinutes: data.prepTimeMinutes,
          isAvailable: data.isAvailable,
          tags: data.tags || null
        },
        include: { category: true }
      });

      res.status(200).json({
        success: true,
        message: 'Menu item updated successfully.',
        item: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const id = req.params.id as string;

      const item = await prisma.menuItem.findFirst({
        where: { id, kitchenId }
      });

      if (!item) {
        res.status(404).json({ success: false, error: 'Menu item not found.' });
        return;
      }

      const updated = await prisma.menuItem.update({
        where: { id },
        data: { isAvailable: !item.isAvailable }
      });

      res.status(200).json({
        success: true,
        message: `"${updated.name}" is now ${updated.isAvailable ? 'available' : 'unavailable'}.`,
        item: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async archive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const id = req.params.id as string;

      const item = await prisma.menuItem.findFirst({
        where: { id, kitchenId }
      });

      if (!item) {
        res.status(404).json({ success: false, error: 'Menu item not found.' });
        return;
      }

      // Soft delete preserves historical order line item snapshots
      await prisma.menuItem.update({
        where: { id },
        data: { isArchived: true, isAvailable: false }
      });

      res.status(200).json({
        success: true,
        message: `"${item.name}" has been archived from the menu.`
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const categories = await prisma.menuCategory.findMany({
        where: { kitchenId, isActive: true },
        include: {
          _count: {
            select: { menuItems: { where: { isArchived: false } } }
          }
        },
        orderBy: { sortOrder: 'asc' }
      });

      res.status(200).json({ success: true, categories });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const { name, description } = req.body;

      if (!name) {
        res.status(400).json({ success: false, error: 'Category name is required.' });
        return;
      }

      const category = await prisma.menuCategory.create({
        data: {
          kitchenId,
          name,
          description: description || null
        }
      });

      res.status(201).json({ success: true, category });
    } catch (error) {
      next(error);
    }
  }

  static async saveRecipe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const data = recipeSchema.parse(req.body);

      const result = await prisma.$transaction(async (tx) => {
        // Upsert recipe record
        let recipe = await tx.recipe.findUnique({
          where: { menuItemId: data.menuItemId }
        });

        if (!recipe) {
          recipe = await tx.recipe.create({
            data: {
              kitchenId,
              menuItemId: data.menuItemId,
              notes: data.notes || null,
              yieldQuantity: data.yieldQuantity
            }
          });
        } else {
          recipe = await tx.recipe.update({
            where: { id: recipe.id },
            data: {
              notes: data.notes || null,
              yieldQuantity: data.yieldQuantity
            }
          });
          // Remove old ingredients
          await tx.recipeIngredient.deleteMany({
            where: { recipeId: recipe.id }
          });
        }

        // Add ingredients
        await tx.recipeIngredient.createMany({
          data: data.ingredients.map((ing) => ({
            recipeId: recipe.id,
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
            unit: ing.unit
          }))
        });

        return tx.recipe.findUnique({
          where: { id: recipe.id },
          include: {
            ingredients: {
              include: { ingredient: true }
            }
          }
        });
      });

      res.status(200).json({
        success: true,
        message: 'Recipe configured successfully.',
        recipe: result
      });
    } catch (error) {
      next(error);
    }
  }
}
