import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ValidationMessageComponent } from '../../shared/components/validation-message.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule, ValidationMessageComponent],
  template: `
    <div class="auth-card">
      <p class="eyebrow">Welcome back</p><h1>Sign in</h1>
      <p class="muted">Manage projects and customer work from one place.</p>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <label for="email">Email address</label>
        <input id="email" type="email" formControlName="email" autocomplete="email">
        <app-validation-message [control]="form.controls.email" label="Email" />
        <label for="password">Password</label>
        <input id="password" type="password" formControlName="password" autocomplete="current-password">
        <app-validation-message [control]="form.controls.password" label="Password" />
        <button class="primary-button" type="submit" [disabled]="submitting()">
          {{ submitting() ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>
      <p class="auth-footer">New customer? <a routerLink="/register">Create an account</a></p>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService);
  readonly submitting = signal(false);
  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]], password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.auth.login(this.form.getRawValue()).pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: user => {
        this.notifications.success(`Welcome, ${user.displayName}.`);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const safeReturnUrl = returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : null;
        void this.router.navigateByUrl(safeReturnUrl ?? (user.role === 'CARPENTER' ? '/carpenter' : '/customer'));
      }
    });
  }
}

