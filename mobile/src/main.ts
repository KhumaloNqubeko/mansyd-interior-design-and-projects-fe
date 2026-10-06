import { bootstrapApplication } from '@angular/platform-browser';
import { provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { catchError, firstValueFrom, of, switchMap } from 'rxjs';
import { AuthService } from '../../src/app/core/auth/auth.service';
import { authInterceptor } from '../../src/app/core/interceptors/auth.interceptor';
import { loadingInterceptor } from '../../src/app/core/interceptors/loading.interceptor';
import { apiErrorInterceptor } from '../../src/app/core/interceptors/api-error.interceptor';
import { MobileRoot } from './shell/mobile-root';
import { mobileRoutes } from './shell/mobile.routes';
import { mobileTransport } from './shell/mobile-transport';
bootstrapApplication(MobileRoot, { providers: [
  provideRouter(mobileRoutes, withComponentInputBinding()),
  provideHttpClient(withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
    withInterceptors([authInterceptor, loadingInterceptor, apiErrorInterceptor, mobileTransport])),
  provideAnimationsAsync(), provideIonicAngular({ mode: 'md' }),
  provideAppInitializer(() => {
    const auth = inject(AuthService);
    return firstValueFrom(auth.loadSession().pipe(
      switchMap(user => user ? auth.loadCsrfToken() : of(null)), catchError(() => of(null))));
  })
] }).catch(error => console.error(error));
