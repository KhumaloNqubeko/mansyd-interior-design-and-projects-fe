import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../../src/app/core/auth/auth.service';
import { environment } from '../environment';
describe('Mobile account roles', () => {
  for (const role of ['CUSTOMER', 'CARPENTER'] as const) {
    it(`retains an authenticated ${role} account for its workspace`, () => {
      TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
      const auth = TestBed.inject(AuthService); const http = TestBed.inject(HttpTestingController);
      auth.login({ email: 'test@example.com', password: 'fixture-password' }).subscribe();
      http.expectOne(`${environment.apiBaseUrl}/auth/login`).flush({ id: 'fixture', email: 'test@example.com', displayName: 'Test', role });
      expect(auth.currentUser?.role).toBe(role); http.verify();
    });
  }
});
