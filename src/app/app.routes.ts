import { Routes } from '@angular/router';
import { authGuard, carpenterGuard, customerGuard, loginGuard } from './core/guards/auth.guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/layout/public-layout.component').then(m => m.PublicLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', canActivate: [loginGuard], loadComponent: () => import('./features/portfolio/portfolio-landing.component').then(m => m.PortfolioLandingComponent) },
      { path: 'login', canActivate: [loginGuard], loadComponent: () => import('./features/authentication/login.component').then(m => m.LoginComponent) },
      { path: 'register', canActivate: [loginGuard], loadComponent: () => import('./features/authentication/registration.component').then(m => m.RegistrationComponent) },
      { path: 'access-denied', loadComponent: () => import('./features/authentication/access-denied.component').then(m => m.AccessDeniedComponent) }
    ]
  },
  {
    path: 'customer', canActivate: [authGuard, customerGuard],
    loadComponent: () => import('./core/layout/portal-layout.component').then(m => m.PortalLayoutComponent),
    data: { role: 'CUSTOMER' },
    children: [{ path: '', loadChildren: () => import('./features/dashboard/customer.routes').then(m => m.CUSTOMER_ROUTES) }]
  },
  {
    path: 'carpenter', canActivate: [authGuard, carpenterGuard],
    loadComponent: () => import('./core/layout/portal-layout.component').then(m => m.PortalLayoutComponent),
    data: { role: 'CARPENTER' },
    children: [{ path: '', loadChildren: () => import('./features/dashboard/carpenter.routes').then(m => m.CARPENTER_ROUTES) }]
  },
  { path: '**', loadComponent: () => import('./features/authentication/not-found.component').then(m => m.NotFoundComponent) }
];
