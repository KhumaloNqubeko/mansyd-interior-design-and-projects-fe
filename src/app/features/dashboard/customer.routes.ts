import { Routes } from '@angular/router';
export const CUSTOMER_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent) },
  { path: 'profile', loadComponent: () => import('../profile/customer-profile.component').then(m => m.CustomerProfileComponent) },
  { path: 'requests', loadComponent: () => import('../service-requests/customer-service-requests.component').then(m => m.CustomerServiceRequestsComponent) },
  { path: 'quotations', loadComponent: () => import('../quotations/customer-quotations.component').then(m => m.CustomerQuotationsComponent) },
  { path: 'orders', loadComponent: () => import('../orders/order-list.component').then(m => m.OrderListComponent), data: { scope: 'customer' } },
  { path: 'projects', loadComponent: () => import('../projects/project-list.component').then(m => m.ProjectListComponent), data: { scope: 'customer' } },
  { path: 'portfolio', loadComponent: () => import('../portfolio/portfolio.component').then(m => m.PortfolioComponent) },
  { path: 'billing', loadComponent: () => import('../billing/billing.component').then(m => m.BillingComponent), data: { scope: 'customer' } },
  { path: 'appointments', loadComponent: () => import('../appointments/appointment-list.component').then(m => m.AppointmentListComponent), data: { scope: 'customer' } },
  { path: 'notifications', loadComponent: () => import('../notifications/notification-list.component').then(m => m.NotificationListComponent) },
  { path: 'documents', loadComponent: () => import('../documents/document-list.component').then(m => m.DocumentListComponent), data: { scope: 'customer' } }
];
