import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CustomerAuth } from './auth.service';
export const customerOnly: CanActivateFn = () => inject(CustomerAuth).user()?.role === 'CUSTOMER' || inject(Router).createUrlTree(['/login']);
