import { Routes } from '@angular/router';
export const CUSTOMER_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent) },
  { path: 'profile', loadComponent: () => import('../profile/customer-profile.component').then(m => m.CustomerProfileComponent) },
  { path: 'requests', loadComponent: () => import('../service-requests/customer-service-requests.component').then(m => m.CustomerServiceRequestsComponent) },
  { path: 'quotations', loadComponent: () => import('../quotations/customer-quotations.component').then(m => m.CustomerQuotationsComponent) },
  { path: 'orders', loadComponent: () => import('../orders/order-list.component').then(m => m.OrderListComponent), data: { scope: 'customer' } }
];
