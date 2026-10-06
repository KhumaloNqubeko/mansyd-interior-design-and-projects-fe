import { Routes } from '@angular/router';
import { routes } from '../../../src/app/app.routes';
import { CUSTOMER_ROUTES } from '../../../src/app/features/dashboard/customer.routes';

// Share every website route and feature, replacing only the containing layouts.
export const mobileRoutes: Routes = routes.map(route => {
  if (route.path === '' && route.children) return { ...route,
    loadComponent: () => import('./public-shell').then(m => m.MobilePublicShell) };
  if (route.path === 'customer') return { ...route,
    loadComponent: () => import('./portal-shell').then(m => m.MobilePortalShell),
    children: [ ...CUSTOMER_ROUTES.map(child => child.path === 'projects'
      ? { ...child, data: { ...child.data, mobileDetail: true } } : child),
      { path: 'projects/:id', loadComponent: () => import('../app/project-detail.page').then(m => m.ProjectDetailPage) }
    ] };
  if (route.path === 'admin') return { ...route,
    loadComponent: () => import('./portal-shell').then(m => m.MobilePortalShell) };
  return route;
});
