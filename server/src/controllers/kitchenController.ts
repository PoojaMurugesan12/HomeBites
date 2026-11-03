import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { kitchenUpdateSchema } from '../validators/schemas';
import { hashPassword } from '../utils/token';
import { UserRole, MembershipRole } from '@prisma/client';

export class KitchenController {
  static async getExplore(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchens = await prisma.kitchen.findMany({
        where: { isActive: true },
        include: {
          categories: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
            include: {
              menuItems: {
                where: { isArchived: false, isAvailable: true },
                orderBy: { createdAt: 'asc' }
              }
            }
          },
          menuItems: {
            where: { isArchived: false, isAvailable: true }
          },
          _count: {
            select: {
              menuItems: { where: { isArchived: false } },
              orders: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      res.status(200).json({
        success: true,
        kitchens
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCurrent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const kitchen = await prisma.kitchen.findUnique({
        where: { id: kitchenId },
        include: {
          subscription: {
            include: { plan: true }
          },
          _count: {
            select: {
              menuItems: { where: { isArchived: false } },
              orders: true,
              inventoryItems: { where: { isArchived: false } },
              memberships: { where: { isActive: true } }
            }
          }
        }
      });

      if (!kitchen) {
        res.status(404).json({ success: false, error: 'Kitchen not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        kitchen
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCurrent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const data = kitchenUpdateSchema.parse(req.body);

      const updated = await prisma.kitchen.update({
        where: { id: kitchenId },
        data: {
          ...(data.name ? { name: data.name } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.address !== undefined ? { address: data.address } : {}),
          ...(data.city !== undefined ? { city: data.city } : {}),
          ...(data.state !== undefined ? { state: data.state } : {}),
          ...(data.pincode !== undefined ? { pincode: data.pincode } : {}),
          ...(data.phone !== undefined ? { phone: data.phone } : {}),
          ...(data.email !== undefined ? { email: data.email } : {}),
          ...(data.fssaiNumber !== undefined ? { fssaiNumber: data.fssaiNumber } : {}),
          ...(data.gstNumber !== undefined ? { gstNumber: data.gstNumber } : {}),
          ...(data.defaultTargetMargin !== undefined ? { defaultTargetMargin: data.defaultTargetMargin } : {})
        }
      });

      await prisma.auditLog.create({
        data: {
          kitchenId,
          userId: req.user?.id,
          action: 'KITCHEN_PROFILE_UPDATED',
          entityType: 'Kitchen',
          entityId: kitchenId,
          details: JSON.stringify(data)
        }
      });

      res.status(200).json({
        success: true,
        message: 'Kitchen profile updated successfully.',
        kitchen: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const members = await prisma.kitchenMembership.findMany({
        where: { kitchenId, isActive: true },
        include: {
          user: {
            select: { id: true, fullName: true, email: true, phone: true, role: true, createdAt: true }
          }
        },
        orderBy: { createdAt: 'asc' }
      });

      res.status(200).json({
        success: true,
        staff: members.map((m) => ({
          membershipId: m.id,
          userId: m.user.id,
          fullName: m.user.fullName,
          email: m.user.email,
          phone: m.user.phone,
          role: m.role,
          permissions: m.permissions,
          joinedAt: m.createdAt
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  static async addStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const { fullName, email, phone, role = 'STAFF' } = req.body;

      if (!fullName || !email) {
        res.status(400).json({ success: false, error: 'Full name and email are required.' });
        return;
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        const defaultPassword = await hashPassword('Staff@123');
        user = await prisma.user.create({
          data: {
            fullName,
            email: email.toLowerCase(),
            phone: phone || null,
            passwordHash: defaultPassword,
            role: UserRole.KITCHEN_STAFF
          }
        });
      }

      // Check if membership already exists
      const existing = await prisma.kitchenMembership.findUnique({
        where: {
          userId_kitchenId: { userId: user.id, kitchenId }
        }
      });

      if (existing) {
        res.status(400).json({ success: false, error: 'This user is already a member of this kitchen.' });
        return;
      }

      const membershipRole =
        role === 'MANAGER'
          ? MembershipRole.MANAGER
          : role === 'CHEF'
          ? MembershipRole.CHEF
          : MembershipRole.STAFF;

      const membership = await prisma.kitchenMembership.create({
        data: {
          userId: user.id,
          kitchenId,
          role: membershipRole,
          permissions: ['orders:read', 'orders:write', 'inventory:read', 'inventory:write']
        }
      });

      await prisma.auditLog.create({
        data: {
          kitchenId,
          userId: req.user?.id,
          action: 'STAFF_ADDED',
          entityType: 'KitchenMembership',
          entityId: membership.id,
          details: JSON.stringify({ email, role })
        }
      });

      res.status(201).json({
        success: true,
        message: 'Staff member added successfully.',
        staff: {
          membershipId: membership.id,
          userId: user.id,
          fullName: user.fullName,
          email: user.email,
          role: membership.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async completeOnboarding(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const kitchenId = req.kitchenId!;
      const updated = await prisma.kitchen.update({
        where: { id: kitchenId },
        data: { onboardingCompleted: true }
      });

      res.status(200).json({
        success: true,
        message: 'Onboarding marked as completed.',
        kitchen: updated
      });
    } catch (error) {
      next(error);
    }
  }
}
