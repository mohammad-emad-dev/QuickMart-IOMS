# QuickMart IOMS Production Handoff

Status: Production-ready
Application: QuickMart Inventory & Operations Management System (IOMS)
Runtime: Node.js 22 LTS / Express 5 Clean Architecture

This document outlines the deployment, operational configuration, and runtime requirements for staging and production hosting.

## 1. System Architecture

QuickMart IOMS is a modular Node.js application built on Express 5, implementing a Clean Architecture pattern:

- **Presentation Layer**: Pre-compiled RTL views rendered from memory, served with Bootstrap 5.3.0 and custom responsive stylesheets.
- **Routing & Controllers (`src/routes/`)**: Decoupled HTTP routes matching `/backend/views/*` and `/backend/api/*`.
- **Middleware Pipeline (`src/middleware/`)**: Browser security headers, session resolution, role-based access control (Admin, Manager, Staff), and sliding-window rate limiting.
- **Business Logic (`src/services/`)**: Domain services for authentication, catalog inventory, transactional order processing, staff directory, and executive KPI reporting.
- **Data Persistence (`src/data/`)**: Centralized data store managing entity state and atomic inventory adjustments.

## 2. Prerequisites

- **Node.js**: Version 20.x or 22.x LTS.
- **npm**: Version 10.x or newer.
- **Reverse Proxy / Ingress**: Nginx, Caddy, AWS ALB, or GCP Cloud Run for TLS termination and public traffic ingress.
- **Process Manager**: Docker, systemd, or PM2 for process lifecycle management, health monitoring, and automatic restarts.

## 3. Environment Configuration

The application reads configuration from standard process environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Port on which the HTTP server listens. |
| `HOST` | `0.0.0.0` | Network interface to bind to (all interfaces for containers). |
| `NODE_ENV` | `production` | Node runtime environment mode. |

No external database daemon or credentials are required for the default application lifecycle.

## 4. Build and Deployment Pipeline

### Install Dependencies

```bash
npm ci --omit=dev
```

### Compile Production Assets

Minifies CSS stylesheets and JavaScript bundles into `dist/`:

```bash
npm run build
```

This executes:
- `scripts/build-css.js`: Compresses stylesheets using Clean-CSS with level 2 optimizations and rewrites font asset paths.
- `scripts/build-js.js`: Compresses browser JavaScript with Terser while preserving global function references for inline UI handlers.

### Start the Service

```bash
npm start
```

Runs `node server.js` binding to `http://0.0.0.0:3000`.

## 5. Security & Runtime Controls

- **Defensive HTTP Headers**: Emitted automatically via `src/middleware/security-headers.js`:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: same-origin`
- **Session Security**: HTTP-only session cookies (`qm_session_id`) with `SameSite=Lax`.
- **CSRF Defense**: Cryptographic CSRF tokens issued on session initialization and rotated on successful login.
- **Brute-Force Rate Limiting**: 10 failed login attempts per 15-minute sliding window per identifier. Emits HTTP 429 with `Retry-After` header when exceeded.
- **Role-Based Access Control**:
  - `Admin`: Full access to inventory, orders, staff directory, and executive reports.
  - `Manager`: Access to inventory updates and order workspaces; restricted from staff management and financial reports.
  - `Staff`: Restricted to order operations and self-service profile management.
- **Ledger & Audit Integrity**: Products with existing order history cannot be deleted; staff members with recorded transactions cannot be removed.

## 6. Staging & Operational Smoke Checklist

Verify the following before and after deployment:

- [ ] Web root (`/`) redirects unauthenticated requests to `/assets/login-signup/login.html`.
- [ ] Login page assets (`dist/css/login.min.css`, `dist/js/login.min.js`) load with 200 OK.
- [ ] Admin authentication succeeds (`admin@quickmart.com` / `admin123`) and redirects to `/backend/views/dashboard.php`.
- [ ] Session endpoint (`GET /backend/api/auth/session.php`) returns authenticated state and user profile.
- [ ] Restricted endpoints (`GET /backend/api/reports/stats.php`, `GET /backend/api/staff/list.php`) return 403 when requested by Staff role.
- [ ] Orders list (`GET /backend/api/orders/list.php`) properly filters orders by role permissions.
- [ ] Asset compilation test (`npm run build`) runs cleanly without errors.
- [ ] Node syntax check (`npm run lint`) passes with zero syntax defects.

## 7. Container Deployment (Docker Example)

```dockerfile
FROM node:22-alpine AS runtime
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
USER node
CMD ["node", "server.js"]
```
