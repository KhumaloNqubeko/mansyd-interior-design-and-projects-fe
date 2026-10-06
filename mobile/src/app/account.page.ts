import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton } from '@ionic/angular/standalone';
import { CustomerAuth } from './auth.service';
import { MobileApi, errorMessage } from './api.service';
import { CustomerProfile } from './models';
@Component({ standalone: true, imports: [IonButton], template: `<p class="eyebrow">Your account</p><h1>{{ auth.user()?.displayName }}</h1><p class="muted">{{ auth.user()?.email }}</p>
  @if (loading()) { <p role="status">Loading profile…</p> } @else if (profile(); as profile) { <section class="outline-card"><h2>Contact details</h2><p>{{ profile.phoneNumber }}</p><p>{{ profile.addressLine1 }} {{ profile.addressLine2 }}</p><p>{{ profile.city }} {{ profile.postalCode }}</p><p class="small muted">Update your details in the website customer portal.</p></section> }
  @if (error()) { <p class="error" role="alert">{{ error() }}</p><ion-button fill="clear" (click)="load()">Retry profile</ion-button> }
  <ion-button expand="block" fill="outline" (click)="logout()" [disabled]="busy()">{{ busy() ? 'Signing out…' : 'Sign out' }}</ion-button>` })
export class AccountPage {
  readonly auth = inject(CustomerAuth); private readonly api = inject(MobileApi); private readonly router = inject(Router);
  readonly profile = signal<CustomerProfile | null>(null); readonly loading = signal(true); readonly error = signal(''); readonly busy = signal(false);
  constructor() { void this.load(); }
  async load(): Promise<void> { this.loading.set(true); this.error.set(''); try { this.profile.set(await this.api.get<CustomerProfile>('/customers/me')); } catch (error) { this.error.set(errorMessage(error)); } finally { this.loading.set(false); } }
  async logout(): Promise<void> { if (this.busy()) return; this.busy.set(true); this.error.set(''); try { await this.auth.signOut(); await this.router.navigateByUrl('/login', { replaceUrl: true }); } catch (error) { this.error.set(errorMessage(error)); } finally { this.busy.set(false); } }
}
