import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { CsrfTokenStore } from '../auth/csrf-token.store';

describe('authInterceptor', () => {
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  });

  it('adds credentials to API requests', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()] });
    TestBed.inject(HttpClient).get('/api/test').subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/test');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.headers.has('X-XSRF-TOKEN')).toBeFalse();
    request.flush({});
  });

  it('adds the xsrf token header to unsafe API requests', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()] });
    TestBed.inject(CsrfTokenStore).set('test-token');

    TestBed.inject(HttpClient).put('http://localhost:8080/api/customers/me', {}).subscribe();

    const request = TestBed.inject(HttpTestingController).expectOne('http://localhost:8080/api/customers/me');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.headers.get('X-XSRF-TOKEN')).toBe('test-token');
    request.flush({});
  });
});
