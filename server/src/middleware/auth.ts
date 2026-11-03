import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { verifyToken, TokenPayload } from '../utils/token';
import { SESSION_COOKIE_NAME } from '../config/constants';
import { UserRole, MembershipRole } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  memberships: {
    kitchenId: string;
    role: MembershipRole;
    permissions: string[];
  }[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      kitchenId?: string;
      membership?: {
        kitchenId: string;
        role: MembershipRole;
        permissions: string[];
      };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.[SESSION_COOKIE_NAME];

    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
      return;
    }

    let payload: TokenPayload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      res.status(401).json({ success: false, error: 'Session expired or invalid. Please sign in again.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberships: {
          where: { isActive: true },
          include: { kitchen: true }
        }
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, error: 'User account is inactive or not found.' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
      memberships: user.memberships.map((m) => ({
        kitchenId: m.kitchenId,
        role: m.role,
        permissions: m.permissions
      }))
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function requireKitchen(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }

  // If user is a platform admin, they can specify any kitchenId in header or query
  const requestedKitchenId =
    (req.headers['x-kitchen-id'] as string) ||
    (req.query.kitchenId as string) ||
    req.body?.kitchenId;

  if (req.user.role === UserRole.PLATFORM_ADMIN) {
    if (requestedKitchenId) {
      req.kitchenId = requestedKitchenId;
      req.membership = {
        kitchenId: requestedKitchenId,
        role: MembershipRole.OWNER,
        permissions: ['*']
      };
      next();
      return;
    }
  }

  let activeMembership;

  if (requestedKitchenId) {
    activeMembership = req.user.memberships.find((m) => m.kitchenId === requestedKitchenId);
    if (!activeMembership) {
      res.status(403).json({
        success: false,
        error: 'Tenant isolation: Access denied. You do not belong to this kitchen.'
      });
      return;
    }
  } else {
    activeMembership = req.user.memberships[0];
  }

  if (!activeMembership) {
    res.status(403).json({
      success: false,
      error: 'Tenant isolation: Access denied. You do not belong to this kitchen.'
    });
    return;
  }

  req.kitchenId = activeMembership.kitchenId;
  req.membership = activeMembership;
  next();
}

export function requireOwner(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }

  if (req.user.role === UserRole.PLATFORM_ADMIN) {
    next();
    return;
  }

  if (req.user.role !== UserRole.KITCHEN_OWNER && req.membership?.role !== MembershipRole.OWNER) {
    res.status(403).json({
      success: false,
      error: 'Permission denied: This action is restricted to Kitchen Owners.'
    });
    return;
  }

  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required.' });
    return;
  }

  if (req.user.role !== UserRole.PLATFORM_ADMIN) {
    res.status(403).json({
      success: false,
      error: 'Forbidden: Platform Administrator privileges required.'
    });
    return;
  }

  next();
}
