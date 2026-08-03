import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;
  const user = { id: '1', email: 'user@example.com', role: 'CUSTOMER' as const, displayName: 'User' };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('stores the authenticated user after login', () => {
    service.login({ email: 'user@example.com', password: 'password' }).subscribe(result => expect(result).toEqual(user));
    const request = http.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(request.request.method).toBe('POST'); request.flush(user);
    expect(service.currentUser).toEqual(user);
  });

  it('clears state when session restoration is unauthorized', () => {
    service.loadSession().subscribe(result => expect(result).toBeNull());
    http.expectOne(`${environment.apiBaseUrl}/auth/session`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(service.currentUser).toBeNull();
  });
});

