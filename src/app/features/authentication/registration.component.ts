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
      <p class="muted">Your details help the carpentry team plan visits and quotations.</p>
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="form-grid">
          <div><label for="fullName">Full name</label><input id="fullName" formControlName="fullName" autocomplete="name"><app-validation-message [control]="form.controls.fullName" label="Full name" /></div>
          <div>
            <label for="phoneNumber">Cell number</label>
            <input id="phoneNumber" formControlName="phoneNumber" autocomplete="tel" inputmode="numeric" maxlength="10" placeholder="10 digits">
            <app-validation-message [control]="form.controls.phoneNumber" label="Cell number" />
          </div>
          <div class="full"><label for="email">Email address</label><input id="email" type="email" formControlName="email" autocomplete="email"><app-validation-message [control]="form.controls.email" label="Email" /></div>
          @if (codeSent()) {
            <div class="full">
              <label for="verificationCode">Email verification code</label>
              <input id="verificationCode" [formControl]="verificationCode" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="Enter the 6-digit code">
              <app-validation-message [control]="verificationCode" label="Verification code" />
              <span class="hint">Enter the code sent to {{ form.controls.email.value }}. Check your spam folder, or edit the email address above to use a different one.</span>
              <button class="text-button dark compact-link" type="button" (click)="resendCode()" [disabled]="sendingCode() || form.invalid">
                {{ sendingCode() ? 'Sending…' : 'Resend code' }}
              </button>
            </div>
          }
          <div class="full"><label for="addressLine1">Address line 1</label><input id="addressLine1" formControlName="addressLine1" autocomplete="address-line1"><app-validation-message [control]="form.controls.addressLine1" label="Address" /></div>
          <div class="full"><label for="addressLine2">Address line 2 <span class="optional">(optional)</span></label><input id="addressLine2" formControlName="addressLine2" autocomplete="address-line2"></div>
          <div><label for="city">City</label><input id="city" formControlName="city" autocomplete="address-level2"><app-validation-message [control]="form.controls.city" label="City" /></div>
          <div><label for="postalCode">Postal code</label><input id="postalCode" formControlName="postalCode" autocomplete="postal-code"><app-validation-message [control]="form.controls.postalCode" label="Postal code" /></div>
          <div><label for="password">Password</label><input id="password" type="password" formControlName="password" autocomplete="new-password" maxlength="11"><app-validation-message [control]="form.controls.password" label="Password" /><span class="hint">8–11 characters with upper/lower case, number and symbol.</span></div>
          <div><label for="confirmPassword">Confirm password</label><input id="confirmPassword" type="password" formControlName="confirmPassword" autocomplete="new-password"><app-validation-message [control]="form.controls.confirmPassword" label="Password confirmation" />@if (form.touched && form.hasError('passwordMismatch')) { <span class="field-error">Passwords must match.</span> }</div>
        </div>
        <button class="primary-button" type="submit" [disabled]="submitting() || sendingCode() || verifyingCode()">
          {{ submitButtonLabel() }}
        </button>
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
  readonly sendingCode = signal(false);
  readonly verifyingCode = signal(false);
  readonly codeSent = signal(false);
  readonly verificationCode = this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/^\d{6}$/)]);
  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^0\d{9}$/)]],
    addressLine1: ['', Validators.required], addressLine2: [''], city: ['', Validators.required], postalCode: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(11), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)]],
    confirmPassword: ['', Validators.required]
  }, { validators: passwordMatchValidator });

  constructor() {
    const resetVerification = () => {
      this.codeSent.set(false);
      this.verificationCode.reset('');
    };
    this.form.controls.email.valueChanges.subscribe(resetVerification);
    this.form.controls.phoneNumber.valueChanges.subscribe(resetVerification);
  }

  resendCode(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.requestCode();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.codeSent()) { this.requestCode(); return; }
    if (this.verificationCode.invalid) {
      this.verificationCode.markAsTouched();
      return;
    }
    this.verifyAndCreateAccount();
  }

  submitButtonLabel(): string {
    if (this.sendingCode()) return 'Sending verification code…';
    if (this.verifyingCode()) return 'Verifying code…';
    if (this.submitting()) return 'Creating account…';
    return this.codeSent() ? 'Verify and create account' : 'Create account';
  }

  private requestCode(): void {
    const email = this.form.controls.email.value;
    const phoneNumber = this.form.controls.phoneNumber.value;
    this.sendingCode.set(true);
    this.auth.sendEmailVerification(email, phoneNumber).pipe(finalize(() => this.sendingCode.set(false))).subscribe(() => {
      this.codeSent.set(true);
      this.notifications.success('A verification code was sent to your email address.');
    });
  }

  private verifyAndCreateAccount(): void {
    this.verifyingCode.set(true);
    this.auth.verifyEmailCode(this.form.controls.email.value, this.verificationCode.value)
      .pipe(finalize(() => this.verifyingCode.set(false)))
      .subscribe(token => {
        this.notifications.success('Email address verified.');
        this.createAccount(token);
      });
  }

  private createAccount(emailVerificationToken: string): void {
    const value = this.form.getRawValue();
    this.submitting.set(true);
    this.auth.register({ fullName: value.fullName, email: value.email, phoneNumber: value.phoneNumber, password: value.password,
      emailVerificationToken,
      address: { addressLine1: value.addressLine1, addressLine2: value.addressLine2 || undefined, city: value.city, postalCode: value.postalCode }
    }).pipe(finalize(() => this.submitting.set(false))).subscribe({ next: () => {
      this.notifications.success('Your account is ready.'); void this.router.navigate(['/customer']);
    }});
  }
}
