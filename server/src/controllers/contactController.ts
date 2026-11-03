import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { contactMessageSchema } from '../validators/schemas';

export class ContactController {
  static async submitMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = contactMessageSchema.parse(req.body);

      const message = await prisma.contactMessage.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          businessName: data.businessName || null,
          subject: data.subject,
          message: data.message,
          status: 'UNREAD'
        }
      });

      res.status(201).json({
        success: true,
        message: 'Thank you! Your inquiry has been received. Our team will get back to you shortly.',
        id: message.id
      });
    } catch (error) {
      next(error);
    }
  }
}
