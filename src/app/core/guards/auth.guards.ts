import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { map, take } from 'rxjs';
import { UserRole } from '../models/auth.models';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser$.pipe(take(1), map(user => user ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })));
};

const roleGuard = (role: UserRole): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser$.pipe(take(1), map(user => user?.role === role ? true : router.createUrlTree(['/access-denied'])));
};

export const carpenterGuard = roleGuard('CARPENTER');
export const customerGuard = roleGuard('CUSTOMER');

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser$.pipe(take(1), map(user => !user ? true : router.createUrlTree([user.role === 'CARPENTER' ? '/carpenter' : '/customer'])));
};

