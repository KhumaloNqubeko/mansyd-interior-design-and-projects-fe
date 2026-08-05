# Carpenter Business Frontend

Angular 20 standalone application using strict TypeScript, Angular Material, Reactive Forms, RxJS, functional interceptors/guards and lazy-loaded routes.

## Install, run and verify

Node.js 22 or later is recommended.

```bash
npm install
npm start
npm test -- --watch=false --browsers=ChromeHeadless
npm run build
```

Development runs at `http://localhost:4200`. `environment.development.ts` points to `http://localhost:8080/api`; production uses relative `/api` through Nginx.

## Authentication flow

An application initializer calls `/auth/session` before routing. `AuthService` exposes `currentUser$`, `isAuthenticated$` and `currentRole$`. The credentials interceptor sets `withCredentials` once for every request; components do not repeat it. Guards protect authentication and roles. The API error interceptor displays server messages, and the loading interceptor drives the global progress bar.

Public routes are `/login`, `/register`, `/access-denied`; `/customer` and `/carpenter` lazy-load their respective route groups and layouts. Customers can update their profile at `/customer/profile`, submit/list service requests at `/customer/requests`, review quotations at `/customer/quotations`, view orders at `/customer/orders`, follow project timelines at `/customer/projects`, view appointments at `/customer/appointments`, submit payment references at `/customer/billing`, review notifications at `/customer/notifications`, and access shared documents at `/customer/documents`. The carpenter can review service requests at `/carpenter/requests`, build quotations at `/carpenter/quotations`, manage orders at `/carpenter/orders`, update project delivery at `/carpenter/projects`, schedule appointments at `/carpenter/appointments`, issue invoices/review payments at `/carpenter/billing`, manage suppliers/material stock at `/carpenter/inventory`, track expenses at `/carpenter/expenses`, review rollups at `/carpenter/reporting`, review notifications at `/carpenter/notifications`, manage document references at `/carpenter/documents`, and review audit logs at `/carpenter/audit-logs`.

The multi-stage Dockerfile builds with Node and serves with Nginx. Nginx falls back to `index.html` and proxies `/api` to `backend:8080`.
