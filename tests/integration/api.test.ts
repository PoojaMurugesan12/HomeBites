import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../server/src/index';

describe('HomeBites API Integration Tests', () => {
  let ownerToken: string;
  let ownerCookie: string;
  let ownerKitchenId: string;

  let separateOwnerToken: string;
  let separateKitchenId: string;

  it('GET /api/v1/health returns healthy status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.platform).toContain('HomeBites');
  });

  it('POST /api/v1/auth/login rejects invalid credentials with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rahul@biryanibox.in', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/auth/login succeeds for valid seeded kitchen owner', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'rahul@biryanibox.in', password: 'Owner@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('rahul@biryanibox.in');
    expect(res.body.activeKitchen.name).toBe('Biryani Box Express');

    ownerToken = res.body.token;
    ownerKitchenId = res.body.activeKitchen.id;
    const cookieHeader = res.headers['set-cookie'];
    ownerCookie = Array.isArray(cookieHeader) ? cookieHeader[0] : (cookieHeader || '');
    expect(ownerToken).toBeDefined();
  });

  it('GET /api/v1/auth/me returns current user and active kitchen with cookie', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', ownerCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('rahul@biryanibox.in');
    expect(res.body.activeKitchen.id).toBe(ownerKitchenId);
  });

  it('Enforces Tenant Isolation: Kitchen 1 cannot access another Kitchen\'s private orders', async () => {
    // Log in as second kitchen owner (Curry & Crust Kitchen)
    const res2 = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ananya@currycrust.in', password: 'Owner@123' });

    separateOwnerToken = res2.body.token;
    separateKitchenId = res2.body.activeKitchen.id;
    const separateCookie = Array.isArray(res2.headers['set-cookie']) ? res2.headers['set-cookie'][0] : res2.headers['set-cookie'];

    // Owner 2 tries to pass Kitchen 1's ID in header to access Kitchen 1's orders
    const maliciousAttempt = await request(app)
      .get('/api/v1/orders')
      .set('Cookie', separateCookie)
      .set('x-kitchen-id', ownerKitchenId);

    // Tenant isolation middleware MUST forbid this with 403 Forbidden!
    expect(maliciousAttempt.status).toBe(403);
    expect(maliciousAttempt.body.error).toContain('Tenant isolation');
  });

  it('GET /api/v1/orders returns paginated orders for authenticated kitchen', async () => {
    const res = await request(app)
      .get('/api/v1/orders')
      .set('Cookie', ownerCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.orders)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.orders.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/analytics/overview returns real database computed metrics', async () => {
    const res = await request(app)
      .get('/api/v1/analytics/overview')
      .set('Cookie', ownerCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.metrics.totalOrders).toBeGreaterThan(0);
    expect(res.body.metrics.grossSales).toBeGreaterThan(0);
  });

  it('POST /api/v1/contact accepts public contact submission and stores in database', async () => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({
        name: 'Pooja Agarwal',
        email: 'pooja@delightedbites.com',
        businessName: 'Delighted Bites Cloud Kitchen',
        subject: 'Platform demo request',
        message: 'We are expanding to 3 dark kitchens and want to try HomeBites order sync.'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.id).toBeDefined();
  });
});
