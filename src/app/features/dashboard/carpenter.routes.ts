import { Routes } from '@angular/router';
export const CARPENTER_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent) },
  { path: 'requests', loadComponent: () => import('../service-requests/carpenter-service-requests.component').then(m => m.CarpenterServiceRequestsComponent) },
  { path: 'quotations', loadComponent: () => import('../quotations/carpenter-quotations.component').then(m => m.CarpenterQuotationsComponent) },
  { path: 'orders', loadComponent: () => import('../orders/order-list.component').then(m => m.OrderListComponent), data: { scope: 'carpenter' } }
];
