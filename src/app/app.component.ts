import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatProgressBarModule],
  template: `
    @if (loading.isLoading()) {
      <mat-progress-bar class="global-loader" mode="indeterminate" aria-label="Loading"></mat-progress-bar>
    }
    <router-outlet />
  `
})
export class AppComponent { readonly loading = inject(LoadingService); }

