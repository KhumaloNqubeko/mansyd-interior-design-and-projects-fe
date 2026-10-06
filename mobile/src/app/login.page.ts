import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { CustomerAuth } from './auth.service';
import { errorMessage } from './api.service';
@Component({ standalone: true, imports: [ReactiveFormsModule, IonContent, IonButton],
  template: `<ion-content><main class="login-page"><div class="brand-monogram">M</div><p class="eyebrow">Mansyd · Customer app</p><h1>Your project.<br>Your place.</h1><p class="muted">Follow your home's transformation, share photos and stay in touch.</p>
  <form [formGroup]="form" (ngSubmit)="login()"><label for="email">Email address</label><input id="email" type="email" autocomplete="username" formControlName="email"><label for="password">Password</label><input id="password" type="password" autocomplete="current-password" formControlName="password">
    @if (form.invalid && form.touched) { <p class="error" role="alert">Enter a valid email address and password.</p> }
    @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
    <ion-button expand="block" type="submit" [disabled]="busy()">{{ busy() ? 'Signing in…' : 'Sign in' }}</ion-button>
  </form><p class="muted small">Use your existing Mansyd customer account. New customers can register on the website.</p></main></ion-content>` })
export class LoginPage {
  private readonly auth = inject(CustomerAuth); private readonly router = inject(Router); private readonly fb = inject(FormBuilder);
  readonly busy = signal(false); readonly error = signal('');
  readonly form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  async login(): Promise<void> { if (this.busy()) return; if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.busy.set(true); this.error.set(''); try { const value = this.form.getRawValue(); await this.auth.signIn(value.email.trim(), value.password); this.form.reset(); await this.router.navigateByUrl('/home', { replaceUrl: true }); }
    catch (error) { this.error.set(errorMessage(error)); } finally { this.busy.set(false); } }
}
