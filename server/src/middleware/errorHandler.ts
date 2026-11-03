import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { NODE_ENV } from '../config/constants';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  console.error('[Error Handler]', err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
    return;
  }

  // Handle known Prisma errors
  if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      error: 'A record with this unique information already exists.'
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({
      success: false,
      error: 'Requested record was not found.'
    });
    return;
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);
  const message = err.message || 'An unexpected server error occurred. Please try again.';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}
