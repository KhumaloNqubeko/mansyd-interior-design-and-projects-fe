import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  it('adds credentials to API requests', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()] });
    TestBed.inject(HttpClient).get('/api/test').subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne('/api/test');
    expect(request.request.withCredentials).toBeTrue(); request.flush({});
  });
});

