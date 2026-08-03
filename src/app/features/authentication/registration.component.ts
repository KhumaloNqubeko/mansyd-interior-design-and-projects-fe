import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ValidationMessageComponent } from '../../shared/components/validation-message.component';
import { passwordMatchValidator } from '../../shared/validators/password-match.validator';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ValidationMessageComponent],
  template: `
    <div class="auth-card wide-card">
      <p class="eyebrow">Customer portal</p><h1>Create your account</h1>
      <p class="muted">Your details help the carpenter plan visits and quotations.</p>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="form-grid">
          <div><label for="fullName">Full name</label><input id="fullName" formControlName="fullName" autocomplete="name"><app-validation-message [control]="form.controls.fullName" label="Full name" /></div>
          <div><label for="phoneNumber">Phone number</label><input id="phoneNumber" formControlName="phoneNumber" autocomplete="tel"><app-validation-message [control]="form.controls.phoneNumber" label="Phone number" /></div>
          <div class="full"><label for="email">Email address</label><input id="email" type="email" formControlName="email" autocomplete="email"><app-validation-message [control]="form.controls.email" label="Email" /></div>
          <div class="full"><label for="addressLine1">Address line 1</label><input id="addressLine1" formControlName="addressLine1" autocomplete="address-line1"><app-validation-message [control]="form.controls.addressLine1" label="Address" /></div>
          <div class="full"><label for="addressLine2">Address line 2 <span class="optional">(optional)</span></label><input id="addressLine2" formControlName="addressLine2" autocomplete="address-line2"></div>
          <div><label for="city">City</label><input id="city" formControlName="city" autocomplete="address-level2"><app-validation-message [control]="form.controls.city" label="City" /></div>
          <div><label for="postalCode">Postal code</label><input id="postalCode" formControlName="postalCode" autocomplete="postal-code"><app-validation-message [control]="form.controls.postalCode" label="Postal code" /></div>
          <div><label for="password">Password</label><input id="password" type="password" formControlName="password" autocomplete="new-password"><app-validation-message [control]="form.controls.password" label="Password" /><span class="hint">12+ characters with upper/lower case, number and symbol.</span></div>
          <div><label for="confirmPassword">Confirm password</label><input id="confirmPassword" type="password" formControlName="confirmPassword" autocomplete="new-password"><app-validation-message [control]="form.controls.confirmPassword" label="Password confirmation" />@if (form.touched && form.hasError('passwordMismatch')) { <span class="field-error">Passwords must match.</span> }</div>
        </div>
        <button class="primary-button" type="submit" [disabled]="submitting()">{{ submitting() ? 'Creating account…' : 'Create account' }}</button>
      </form>
      <p class="auth-footer">Already registered? <a routerLink="/login">Sign in</a></p>
    </div>
  `
})
export class RegistrationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  readonly submitting = signal(false);
  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.maxLength(30)]],
    addressLine1: ['', Validators.required], addressLine2: [''], city: ['', Validators.required], postalCode: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(12), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    this.submitting.set(true);
    this.auth.register({ fullName: value.fullName, email: value.email, phoneNumber: value.phoneNumber, password: value.password,
      address: { addressLine1: value.addressLine1, addressLine2: value.addressLine2 || undefined, city: value.city, postalCode: value.postalCode }
    }).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => {
      this.notifications.success('Your account is ready.'); void this.router.navigate(['/customer']);
    }});
  }
}

