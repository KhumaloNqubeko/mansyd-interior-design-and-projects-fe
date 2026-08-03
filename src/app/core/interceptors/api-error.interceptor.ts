import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/api-error.model';
import { NotificationService } from '../services/notification.service';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const notifications = inject(NotificationService);
  return next(request).pipe(catchError((error: HttpErrorResponse) => {
    const body = error.error as Partial<ApiError> | null;
    if (error.status !== 401 || !request.url.endsWith('/auth/session')) {
      notifications.error(body?.message ?? 'The server could not complete your request.');
    }
    return throwError(() => error);
  }));
};

