import { Routes } from '@angular/router';
export const CARPENTER_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent) },
  { path: 'requests', loadComponent: () => import('../service-requests/carpenter-service-requests.component').then(m => m.CarpenterServiceRequestsComponent) },
  { path: 'quotations', loadComponent: () => import('../quotations/carpenter-quotations.component').then(m => m.CarpenterQuotationsComponent) },
  { path: 'orders', loadComponent: () => import('../orders/order-list.component').then(m => m.OrderListComponent), data: { scope: 'carpenter' } },
  { path: 'projects', loadComponent: () => import('../projects/project-list.component').then(m => m.ProjectListComponent), data: { scope: 'carpenter' } },
  { path: 'portfolio', loadComponent: () => import('../portfolio/portfolio.component').then(m => m.PortfolioComponent) },
  { path: 'billing', loadComponent: () => import('../billing/billing.component').then(m => m.BillingComponent), data: { scope: 'carpenter' } },
  { path: 'appointments', loadComponent: () => import('../appointments/appointment-list.component').then(m => m.AppointmentListComponent), data: { scope: 'carpenter' } },
  { path: 'notifications', loadComponent: () => import('../notifications/notification-list.component').then(m => m.NotificationListComponent) },
  { path: 'documents', loadComponent: () => import('../documents/document-list.component').then(m => m.DocumentListComponent), data: { scope: 'carpenter' } },
  { path: 'audit-logs', loadComponent: () => import('../audit/audit-log-list.component').then(m => m.AuditLogListComponent) }
];
