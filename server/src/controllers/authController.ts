import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/schemas';
import { hashPassword, comparePassword, generateToken, generateRandomToken, hashToken } from '../utils/token';
import { SESSION_COOKIE_NAME, COOKIE_SECURE, SESSION_COOKIE_MAX_AGE } from '../config/constants';
import { UserRole, MembershipRole, SubscriptionStatus } from '@prisma/client';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() }
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          error: 'An account with this email address already exists.'
        });
        return;
      }

      const passwordHash = await hashPassword(data.password);
      const kitchenSlug = data.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);

      // Create User, Kitchen, Membership, and Trial Subscription in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email.toLowerCase(),
            passwordHash,
            fullName: data.fullName,
            phone: data.phone || null,
            role: UserRole.KITCHEN_OWNER
          }
        });

        const kitchen = await tx.kitchen.create({
          data: {
            name: data.businessName,
            slug: kitchenSlug,
            defaultTargetMargin: 0.65,
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            onboardingCompleted: false
          }
        });

        await tx.kitchenMembership.create({
          data: {
            userId: user.id,
            kitchenId: kitchen.id,
            role: MembershipRole.OWNER,
            permissions: ['*']
          }
        });

        // Attach default Starter Plan
        const starterPlan = await tx.subscriptionPlan.findUnique({
          where: { code: 'starter' }
        });

        if (starterPlan) {
          await tx.kitchenSubscription.create({
            data: {
              kitchenId: kitchen.id,
              planId: starterPlan.id,
              status: SubscriptionStatus.TRIAL,
              isDemoSubscription: true,
              trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            }
          });
        }

        // Welcome notification
        await tx.notification.create({
          data: {
            kitchenId: kitchen.id,
            title: 'Welcome to HomeBites!',
            message: `Welcome ${data.fullName}! Complete your onboarding wizard to configure your menu and inventory.`,
            type: 'SYSTEM'
          }
        });

        // Audit log
        await tx.auditLog.create({
          data: {
            kitchenId: kitchen.id,
            userId: user.id,
            action: 'USER_REGISTERED',
            entityType: 'User',
            entityId: user.id,
            details: JSON.stringify({ kitchenName: data.businessName })
          }
        });

        return { user, kitchen };
      });

      const token = generateToken({
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        kitchenId: result.kitchen.id
      });

      res.cookie(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: 'lax',
        maxAge: SESSION_COOKIE_MAX_AGE,
        path: '/'
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully.',
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          role: result.user.role
        },
        activeKitchen: {
          id: result.kitchen.id,
          name: result.kitchen.name,
          slug: result.kitchen.slug,
          role: MembershipRole.OWNER,
          onboardingCompleted: false
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
        include: {
          memberships: {
            where: { isActive: true },
            include: { kitchen: true }
          }
        }
      });

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid email address or password.'
        });
        return;
      }

      const isMatch = await comparePassword(data.password, user.passwordHash);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          error: 'Invalid email address or password.'
        });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({
          success: false,
          error: 'This account has been deactivated. Please contact support.'
        });
        return;
      }

      const primaryKitchen = user.memberships[0]?.kitchen;
      const primaryMembership = user.memberships[0];

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        kitchenId: primaryKitchen?.id
      });

      res.cookie(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: COOKIE_SECURE,
        sameSite: 'lax',
        maxAge: SESSION_COOKIE_MAX_AGE,
        path: '/'
      });

      // Audit log login
      await prisma.auditLog.create({
        data: {
          kitchenId: primaryKitchen?.id || null,
          userId: user.id,
          action: 'USER_LOGIN',
          entityType: 'User',
          entityId: user.id,
          details: JSON.stringify({ ip: req.ip })
        }
      });

      res.status(200).json({
        success: true,
        message: 'Signed in successfully.',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        },
        activeKitchen: primaryKitchen
          ? {
              id: primaryKitchen.id,
              name: primaryKitchen.name,
              slug: primaryKitchen.slug,
              role: primaryMembership.role,
              onboardingCompleted: primaryKitchen.onboardingCompleted
            }
          : null,
        memberships: user.memberships.map((m) => ({
          kitchenId: m.kitchenId,
          kitchenName: m.kitchen.name,
          role: m.role,
          permissions: m.permissions
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: COOKIE_SECURE,
      sameSite: 'lax',
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: 'Not authenticated' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          memberships: {
            where: { isActive: true },
            include: {
              kitchen: {
                include: {
                  subscription: {
                    include: { plan: true }
                  }
                }
              }
            }
          }
        }
      });

      if (!user) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      const activeKitchenMembership =
        user.memberships.find((m) => req.kitchenId ? m.kitchenId === req.kitchenId : true) ||
        user.memberships[0];

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phone: user.phone,
          role: user.role
        },
        activeKitchen: activeKitchenMembership
          ? {
              id: activeKitchenMembership.kitchen.id,
              name: activeKitchenMembership.kitchen.name,
              slug: activeKitchenMembership.kitchen.slug,
              role: activeKitchenMembership.role,
              onboardingCompleted: activeKitchenMembership.kitchen.onboardingCompleted,
              subscription: activeKitchenMembership.kitchen.subscription
            }
          : null,
        memberships: user.memberships.map((m) => ({
          kitchenId: m.kitchenId,
          kitchenName: m.kitchen.name,
          role: m.role,
          permissions: m.permissions
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      // Do not disclose whether email exists for security
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (user) {
        const rawToken = generateRandomToken();
        const hashed = hashToken(rawToken);

        await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash: hashed,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiration
          }
        });

        // In a live production environment with configured SMTP, an email would be dispatched.
        // For local development and demonstration, return instruction token safely
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Dev Password Reset] Token generated for ${email}: ${rawToken}`);
        }
      }

      res.status(200).json({
        success: true,
        message: 'If an account matches that email address, a password reset link has been dispatched.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      const tokenHash = hashToken(token);

      const resetRecord = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: true }
      });

      if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
        res.status(400).json({
          success: false,
          error: 'Password reset link is invalid, expired, or has already been used.'
        });
        return;
      }

      const passwordHash = await hashPassword(password);

      await prisma.$transaction([
        prisma.user.update({
          where: { id: resetRecord.userId },
          data: { passwordHash }
        }),
        prisma.passwordResetToken.update({
          where: { id: resetRecord.id },
          data: { usedAt: new Date() }
        })
      ]);

      res.status(200).json({
        success: true,
        message: 'Your password has been successfully reset. You may now sign in with your new password.'
      });
    } catch (error) {
      next(error);
    }
  }
}
