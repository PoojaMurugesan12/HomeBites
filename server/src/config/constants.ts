import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const PORT = parseInt(process.env.PORT || '5000', 10);
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const JWT_SECRET = process.env.JWT_SECRET || 'homebites-dev-secret-key-at-least-32-characters-long-2026';
export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'homebites_session';
export const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const JWT_EXPIRES_IN = '7d';
export const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
