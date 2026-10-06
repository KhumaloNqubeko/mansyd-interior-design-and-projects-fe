import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { mobileRoutes } from './mobile.routes';
import { routes } from '../../../src/app/app.routes';
import { CUSTOMER_ROUTES } from '../../../src/app/features/dashboard/customer.routes';
import { authGuard, carpenterGuard, customerGuard } from '../../../src/app/core/guards/auth.guards';
import { AuthService } from '../../../src/app/core/auth/auth.service';

describe('Full mobile workspace routing', () => {
  it('retains every public and business route from the website', () => {
    expect(mobileRoutes.map(route => route.path)).toEqual(routes.map(route => route.path));
    expect(mobileRoutes.find(route => route.path === 'admin')?.children)
      .toBe(routes.find(route => route.path === 'admin')?.children);
    expect(mobileRoutes.find(route => route.path === '')?.children)
      .toBe(routes.find(route => route.path === '')?.children);
  });
  it('includes all customer features and the camera/review detail screen', () => {
    const customer = mobileRoutes.find(route => route.path === 'customer')!;
    for (const website of CUSTOMER_ROUTES) {
      const mobile = customer.children!.find(route => route.path === website.path)!;
      expect(mobile.loadComponent).toBe(website.loadComponent);
    }
    expect(customer.children!.find(route => route.path === 'projects/:id')?.loadComponent).toBeDefined();
    expect(customer.children!.find(route => route.path === 'projects')?.data?.['mobileDetail']).toBeTrue();
  });
  for (const role of ['CUSTOMER', 'CARPENTER', null]) {
    it(`enforces role isolation for ${role ?? 'anonymous'} accounts`, () => {
      TestBed.configureTestingModule({ providers: [provideRouter([]),
        { provide: AuthService, useValue: { currentUser$: of(role ? { role } : null) } }] });
      const run = (guard: typeof authGuard) => TestBed.runInInjectionContext(() => guard({} as never, { url: '/admin' } as never));
      const customer = run(customerGuard) as import('rxjs').Observable<unknown>;
      const business = run(carpenterGuard) as import('rxjs').Observable<unknown>;
      customer.subscribe(value => expect(value === true).toBe(role === 'CUSTOMER'));
      business.subscribe(value => expect(value === true).toBe(role === 'CARPENTER'));
      const router = TestBed.inject(Router);
      (run(authGuard) as import('rxjs').Observable<unknown>).subscribe(value => {
        if (role) expect(value).toBeTrue();
        else expect(router.serializeUrl(value as import('@angular/router').UrlTree)).toContain('/login');
      });
    });
  }
});
