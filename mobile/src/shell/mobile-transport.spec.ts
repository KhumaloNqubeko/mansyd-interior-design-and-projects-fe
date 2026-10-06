import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { mobileTransport } from './mobile-transport';
import { environment } from '../environment';
import { authInterceptor } from '../../../src/app/core/interceptors/auth.interceptor';
import { AuthService } from '../../../src/app/core/auth/auth.service';
import { CsrfTokenStore } from '../../../src/app/core/auth/csrf-token.store';

describe('Mobile shared API transport', () => {
  let http: HttpClient; let requests: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([]),
      provideHttpClient(withInterceptors([authInterceptor, mobileTransport])), provideHttpClientTesting()] });
    http = TestBed.inject(HttpClient); requests = TestBed.inject(HttpTestingController);
  });
  afterEach(() => requests.verify());
  it('fetches CSRF before writes after an offline startup and keeps session credentials', () => {
    http.post(`${environment.apiBaseUrl}/auth/login`, { email: 'customer@example.com' }).subscribe();
    requests.expectOne(`${environment.apiBaseUrl}/auth/csrf`).flush({ token: 'fresh-token' });
    const write = requests.expectOne(`${environment.apiBaseUrl}/auth/login`);
    expect(write.request.headers.get('X-XSRF-TOKEN')).toBe('fresh-token');
    expect(write.request.withCredentials).toBeTrue(); write.flush({});
  });
  it('ends a stalled request with a usable connection error', fakeAsync(() => {
    let failure: HttpErrorResponse | undefined;
    http.get(`${environment.apiBaseUrl}/projects/my`).subscribe({ error: error => failure = error });
    const stalled = requests.expectOne(`${environment.apiBaseUrl}/projects/my`);
    tick(20001);
    expect(stalled.cancelled).toBeTrue(); expect(failure?.status).toBe(0);
    expect(failure?.error.message).toContain('Check your connection');
  }));
  it('clears an expired session and routes to login while leaving bad credentials on login', () => {
    const cleared = spyOn(TestBed.inject(AuthService), 'clearSession');
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    TestBed.inject(CsrfTokenStore).set('token');
    http.post(`${environment.apiBaseUrl}/auth/login`, {}).subscribe({ error: () => {} });
    requests.expectOne(`${environment.apiBaseUrl}/auth/login`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(cleared).not.toHaveBeenCalled();
    http.get(`${environment.apiBaseUrl}/projects/my`).subscribe({ error: () => {} });
    requests.expectOne(`${environment.apiBaseUrl}/projects/my`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(cleared).toHaveBeenCalled(); expect(navigate).toHaveBeenCalledWith(['/login']);
    expect(TestBed.inject(CsrfTokenStore).token).toBeNull();
  });
});
