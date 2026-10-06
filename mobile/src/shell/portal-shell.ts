import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../../src/app/core/auth/auth.service';
import { CsrfTokenStore } from '../../../src/app/core/auth/csrf-token.store';
import { NotificationApiService } from '../../../src/app/core/services/notification-api.service';
import { NotificationService } from '../../../src/app/core/services/notification.service';
import { MobileIcon } from './mobile-icon';

type NavItem = { path: string; label: string };
@Component({ standalone: true, imports: [RouterLink, RouterLinkActive, RouterOutlet, CdkTrapFocus, MobileIcon], template: `
  <div class="mobile-portal">
    <header class="mobile-topbar">
      <a class="brand" [routerLink]="base"><span class="brand-mark">M</span><span>Mansyd<small>{{ business ? 'Business workspace' : 'Your home, in progress' }}</small></span></a>
      <a class="mobile-alert-button" [routerLink]="base + '/notifications'" aria-label="Notifications"><mobile-icon name="/notifications" />
        @if (unread() > 0) { <span class="mobile-count">{{ unread() > 99 ? '99+' : unread() }}</span> }
      </a>
    </header>
    <main class="mobile-page"><router-outlet /></main>
    <nav class="mobile-bottom-nav" aria-label="Quick navigation">
      <a [routerLink]="base" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"><mobile-icon />Home</a>
      <a [routerLink]="base + '/projects'" routerLinkActive="active"><mobile-icon name="/projects" />Projects</a>
      <a [routerLink]="base + '/requests'" routerLinkActive="active"><mobile-icon name="/requests" />Requests</a>
      <button type="button" (click)="menu.set(true)" [attr.aria-expanded]="menu()" aria-controls="mobile-menu"><mobile-icon name="menu" />More</button>
    </nav>
    @if (menu()) {
      <div class="mobile-menu-backdrop" (click)="menu.set(false)">
        <section id="mobile-menu" class="mobile-menu" role="dialog" aria-modal="true" aria-labelledby="menu-heading"
          cdkTrapFocus [cdkTrapFocusAutoCapture]="true" (click)="$event.stopPropagation()" (keydown.escape)="menu.set(false)">
          <div class="mobile-menu-heading"><div><p class="eyebrow">{{ business ? 'Business workspace' : 'Customer workspace' }}</p><h2 id="menu-heading">Explore your workspace</h2></div>
            <button class="mobile-close" type="button" (click)="menu.set(false)" aria-label="Close menu">×</button></div>
          <p class="mobile-user">{{ auth.currentUser?.displayName }}</p>
          <nav class="mobile-menu-grid" aria-label="All features">
            @for (item of items(); track item.path) {
              <a [routerLink]="base + item.path" routerLinkActive="active" [routerLinkActiveOptions]="{exact: item.path === ''}" (click)="menu.set(false)">
                <mobile-icon [name]="item.path" />{{ item.label }}
              </a>
            }
          </nav>
          <button class="mobile-signout" type="button" (click)="logout()" [disabled]="signingOut()">{{ signingOut() ? 'Signing out…' : 'Sign out' }}</button>
        </section>
      </div>
    }
  </div>` })
export class MobilePortalShell {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly tokens = inject(CsrfTokenStore);
  private readonly notifications = inject(NotificationService);
  private readonly notificationsApi = inject(NotificationApiService);
  private readonly destroy = inject(DestroyRef);
  readonly menu = signal(false); readonly unread = signal(0); readonly signingOut = signal(false);
  get business(): boolean { return this.auth.currentUser?.role === 'CARPENTER'; }
  get base(): string { return this.business ? '/admin' : '/customer'; }
  readonly items = computed<NavItem[]>(() => [
    { path: '', label: 'Dashboard' },
    ...(this.business ? [{ path: '/customers', label: 'Customers' }, { path: '/suppliers', label: 'Suppliers' }]
      : [{ path: '/profile', label: 'My profile' }]),
    { path: '/requests', label: 'Requests' }, { path: '/quotations', label: 'Quotations' },
    { path: '/orders', label: 'Orders' }, { path: '/projects', label: 'Projects' },
    { path: '/portfolio', label: 'Portfolio' }, { path: '/appointments', label: 'Appointments' },
    { path: '/billing', label: 'Billing & payments' }, { path: '/notifications', label: 'Notifications' },
    { path: '/documents', label: 'Documents' },
    ...(this.business ? [{ path: '/audit-logs', label: 'Audit logs' }] : [])
  ]);
  constructor() {
    this.refreshBadge();
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed()).subscribe(() => {
      this.menu.set(false); this.refreshBadge(); window.scrollTo({ top: 0 });
    });
  }
  private refreshBadge(): void {
    this.notificationsApi.unreadCount().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: value => this.unread.set(value.unreadCount), error: () => {} });
  }
  logout(): void {
    if (this.signingOut()) return; this.signingOut.set(true);
    this.auth.logout().subscribe({ next: () => {
      this.tokens.clear(); this.menu.set(false); void this.router.navigate(['/login']);
    }, error: () => { this.signingOut.set(false); this.notifications.error('Sign out could not finish. Please try again.'); } });
  }
}

