import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { CurrentUser } from '../models/auth.models';
import { authGuard, carpenterGuard, customerGuard } from './auth.guards';

describe('authentication guards', () => {
  const users = new BehaviorSubject<CurrentUser | null>(null);
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: { currentUser$: users.asObservable() } }] }));
  afterEach(() => users.next(null));

  it('redirects an anonymous user to login', done => {
    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as never, { url: '/customer' } as never);
      if (typeof result === 'boolean') return;
      (result as import('rxjs').Observable<unknown>).subscribe(value => { expect(TestBed.inject(Router).serializeUrl(value as import('@angular/router').UrlTree)).toContain('/login'); done(); });
    });
  });

  it('allows only the matching role', done => {
    users.next({ id: '1', email: 'c@example.com', role: 'CUSTOMER', displayName: 'C' });
    TestBed.runInInjectionContext(() => {
      (customerGuard({} as never, {} as never) as import('rxjs').Observable<unknown>).subscribe(allowed => {
        expect(allowed).toBeTrue();
        (carpenterGuard({} as never, {} as never) as import('rxjs').Observable<unknown>).subscribe(denied => {
          expect(denied).not.toBeTrue(); done();
        });
      });
    });
  });
});

