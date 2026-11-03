# HomeBites — Cloud Kitchen Growth & Intelligence Platform

> “Your cloud kitchen. Your data. Your growth.”
> 
> A Real-Time Order Processing and Visibility Enhancement System for Cloud Kitchens and D2C Food Brands.

---

## 🍽️ Overview

**HomeBites** is a full-stack FoodTech SaaS application engineered to help independent cloud kitchens, delivery-only dark bays, and emerging direct-to-consumer (D2C) food brands understand their business performance, manage orders and inventory, receive explainable pricing recommendations, and monitor delivery speed.

Unlike traditional order-entry tools, HomeBites combines real-time order telemetry with:
- **Explainable Smart Pricing Engine**: Unit contribution margin calculations derived from variable ingredient costs and historical order demand velocity.
- **Recipe-Level Inventory Synchronization**: Automatic, atomic deduction of raw ingredient quantities when orders are confirmed, complete with movement logs and low-stock alerts.
- **Delivery Latency Forensics**: Separation of kitchen preparation latency from delivery fleet travel time to eliminate customer bottlenecks.
- **Strict Tenant Isolation**: Full data privacy ensuring one kitchen cannot access or query another kitchen's menu, sales, customers, or staff.
- **Superadmin Governance**: Separate protected console for managing platforms, kitchen accounts, plans, and system audit logs.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React icons, Recharts, React Router v7.
- **Backend**: Node.js, Express.js, TypeScript, REST API architecture (`/api/v1`), Zod validation, bcryptjs, JSON Web Tokens (JWT) stored in secure HttpOnly cookies, Socket.IO.
- **Database**: PostgreSQL with Prisma ORM, version-controlled migrations, decimal-safe monetary types, foreign-key constraints, and automated embedded PostgreSQL fallback for zero-dependency local execution.
- **Testing**: Vitest unit tests, React Testing Library, Supertest integration tests.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24.x)
- **npm**: v9+

### 2. Installation
Clone the repository and install all dependencies:
```bash
npm install
```

### 3. Database Setup (PostgreSQL)
HomeBites supports two database modes:

#### Option A: Zero-Config Embedded PostgreSQL (Recommended for Local Dev & Evaluation)
HomeBites automatically initializes and boots a native PostgreSQL 18 database into `.pgdata` on port `5433`. No Docker or system installation required!
```bash
npm run db:ensure
```

#### Option B: External PostgreSQL (AWS RDS / Neon / Supabase / Local PostgreSQL)
Configure your `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/homebites?schema=public"
```

### 4. Push Schema & Seed Demonstration Data
Initialize the 23 relational database tables and seed realistic Indian cloud kitchen data (dishes, inventory, 60+ realistic historical orders, pricing recommendations, delivery records, and staff):
```bash
npm run db:push
npm run db:seed
```

### 5. Start the Full-Stack Application
Start both the backend Express REST API (port 5000) and frontend Vite application (port 5173):
```bash
npm run dev
```

Open your browser to:
- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **API Health Check**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

## 👥 Seeded Demonstration Accounts

The database seed provides 4 pre-configured accounts:

| Role | Email | Password | Kitchen / Scope |
| :--- | :--- | :--- | :--- |
| **Kitchen Owner** | `rahul@biryanibox.in` | `Owner@123` | **Biryani Box Express** (Full owner access, menu, pricing, staff, inventory) |
| **Kitchen Staff** | `priya@biryanibox.in` | `Staff@123` | **Biryani Box Express** (Permitted orders & inventory; owner settings locked) |
| **Platform Admin** | `admin@homebites.in` | `Admin@123` | **Global Platform Governance** (Access to `/admin` oversight console) |
| **Separate Owner** | `ananya@currycrust.in` | `Owner@123` | **Curry & Crust Kitchen** (Demonstrates strict multi-tenant isolation) |

*Tip: The Sign In page features convenient 1-click quick-fill buttons for each of these test accounts.*

---

## 🧪 Running the Automated Test Suite

Run the full suite of unit tests and API integration tests:
```bash
npm test
```

The test suite validates:
1. **Pricing Intelligence Engine**:
   - Unit contribution formula: `Contribution = Selling Price − Estimated Cost`
   - Candidate price formula: `Candidate Price = Cost / (1 − Target Margin)`
   - Target margin boundary conditions ($0 \le \text{margin} < 1$)
2. **Order Lifecycle State Machine**:
   - Valid progression: `PENDING` $\to$ `CONFIRMED` $\to$ `PREPARING` $\to$ `READY_FOR_PICKUP` $\to$ `OUT_FOR_DELIVERY` $\to$ `DELIVERED`
   - In-flight cancellations with recorded reason
   - Prohibition of backwards transitions or un-cancelling
3. **API & Security**:
   - Health check endpoint verification
   - Credential rejection & secure cookie issuance
   - **Strict Multi-Tenant Isolation Enforcement**: Verifies that an owner of Kitchen A cannot access or query Kitchen B's orders or revenue (403 Forbidden).

---

## 📊 Core Business Modules

### 1. Smart Pricing Recommendation Engine
- **Unit Contribution**:
  $$\text{Contribution} = \text{Selling Price} - \text{Estimated Variable Cost}$$
- **Candidate Price**:
  $$\text{Candidate Price} = \frac{\text{Estimated Variable Cost}}{1 - \text{Target Gross Margin}}$$
- Evaluates 30-day historical order velocity to determine demand elasticity (`HIGH`, `MODERATE`, `LOW`, or `INSUFFICIENT DATA`).
- Recommendations require explicit owner authorization: clicking "Accept" immediately updates the active menu price in PostgreSQL and logs an audit record.

### 2. Recipe-Level Inventory Deductions
- Connects menu items to raw inventory ingredients with portion weights (e.g., 0.20 kg Basmati Rice, 0.25 kg Chicken, 1 Meal Box).
- When an order transitions to `CONFIRMED` or `PREPARING`, an atomic database transaction deducts ingredient quantities, preventing double-counting and triggering low-stock notifications when thresholds are crossed.

### 3. Food Delivery Partner Integrations (Honest Architecture)
- HomeBites provides an integration adapter architecture with explicit status honesty:
  *“Integration not connected — upload order data or enter orders manually.”*
- Supports manual order creation and batch CSV order imports with column mapping, preview, and duplicate order detection.

### 4. Platform Administration Console (`/admin`)
- Accessible only to users with the `PLATFORM_ADMIN` role.
- Aggregates platform-wide registered kitchens, active subscriptions, gross sales, and system audit trails.

---

## 📜 License
HomeBites is released under the MIT License.
