import { HttpInterceptorFn } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const document = inject(DOCUMENT);
  const token = csrfToken(document.cookie);
  const shouldAttachToken = UNSAFE_METHODS.has(request.method.toUpperCase()) && token && !request.headers.has('X-XSRF-TOKEN');
  return next(request.clone({
    withCredentials: true,
    setHeaders: shouldAttachToken ? { 'X-XSRF-TOKEN': token } : {}
  }));
};

function csrfToken(cookieHeader: string): string | null {
  return cookieHeader
    .split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith('XSRF-TOKEN='))
    ?.substring('XSRF-TOKEN='.length) ?? null;
}
