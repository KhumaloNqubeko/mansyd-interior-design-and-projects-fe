import { inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, switchMap, throwError, timeout } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environment';
import { AuthService } from '../../../src/app/core/auth/auth.service';
import { CsrfTokenStore } from '../../../src/app/core/auth/csrf-token.store';

export const mobileTransport: HttpInterceptorFn = (request, next) => {
  const tokens = inject(CsrfTokenStore); const http = inject(HttpClient);
  const auth = inject(AuthService); const router = inject(Router);
  if (!request.url.startsWith(environment.apiBaseUrl + '/')) return next(request);
  const unsafe = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  const pending = unsafe && !tokens.token
    ? http.get<{ token: string }>(`${environment.apiBaseUrl}/auth/csrf`).pipe(switchMap(({ token }) => {
      tokens.set(token);
      return next(request.clone({ setHeaders: { 'X-XSRF-TOKEN': token } }));
    })) : next(request);
  return pending.pipe(timeout(20000), catchError(error => {
    if (error instanceof HttpErrorResponse && error.status === 401 && !request.url.includes('/auth/')) {
      auth.clearSession(); tokens.clear(); void router.navigate(['/login']);
    }
    return throwError(() => error instanceof HttpErrorResponse ? error : new HttpErrorResponse({
      status: 0, url: request.url, error: { message: 'Cannot reach Mansyd. Check your connection and try again.' }
    }));
  }));
};
