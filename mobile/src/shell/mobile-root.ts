import { Component, DestroyRef, effect, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { LoadingService } from '../../../src/app/core/services/loading.service';
import { AuthService } from '../../../src/app/core/auth/auth.service';
import { MobileApi } from '../app/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({ selector: 'mobile-root', standalone: true, imports: [RouterOutlet, MatProgressBarModule],
  template: `@if (loading.isLoading()) { <mat-progress-bar class="global-loader" mode="indeterminate" aria-label="Loading" /> }<router-outlet />` })
export class MobileRoot {
  readonly loading = inject(LoadingService);
  constructor() {
    const router = inject(Router); const location = inject(Location); const auth = inject(AuthService);
    const api = inject(MobileApi); const destroy = inject(DestroyRef);
    auth.currentUser$.pipe(takeUntilDestroyed()).subscribe(() => api.reset());
    effect(() => { if (api.expired()) { auth.clearSession(); api.reset(); void router.navigate(['/login']); } });
    if (Capacitor.isNativePlatform()) {
      const listener = App.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack && !['/', '/login', '/customer', '/admin'].includes(router.url)) location.back();
        else void App.minimizeApp();
      });
      destroy.onDestroy(() => { void listener.then(handle => handle.remove()); });
    }
  }
}
