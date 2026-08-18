import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { NotificationBadgeService } from '../services/notification-badge.service';
import { NotificationService } from '../services/notification.service';

@Component({
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive, RouterOutlet, MatIconModule],
  template: `
    <div class="portal-shell">
      <header class="topbar">
        <a class="brand brand-inverse" [routerLink]="homeLink"><span class="brand-mark">CB</span><span>Carpenter Business</span></a>
        <div class="user-area">
          @if (auth.currentUser$ | async; as user) { <span>{{ user.displayName }}</span> }
          <button type="button" class="text-button" (click)="logout()">Sign out</button>
        </div>
      </header>
      <aside class="sidebar" aria-label="Primary navigation">
        <a [routerLink]="homeLink" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          <mat-icon aria-hidden="true">dashboard</mat-icon> Dashboard
        </a>
        @if (auth.currentUser?.role === 'CUSTOMER') {
          <a routerLink="/customer/profile" routerLinkActive="active">
            <mat-icon aria-hidden="true">person</mat-icon> My profile
          </a>
          <a routerLink="/customer/requests" routerLinkActive="active">
            <mat-icon aria-hidden="true">construction</mat-icon> My requests
          </a>
          <a routerLink="/customer/quotations" routerLinkActive="active">
            <mat-icon aria-hidden="true">request_quote</mat-icon> Quotations
          </a>
          <a routerLink="/customer/orders" routerLinkActive="active">
            <mat-icon aria-hidden="true">inventory_2</mat-icon> Orders
          </a>
          <a routerLink="/customer/projects" routerLinkActive="active">
            <mat-icon aria-hidden="true">timeline</mat-icon> Projects
          </a>
          <a routerLink="/customer/portfolio" routerLinkActive="active">
            <mat-icon aria-hidden="true">photo_library</mat-icon> Portfolio
          </a>
          <a routerLink="/customer/appointments" routerLinkActive="active">
            <mat-icon aria-hidden="true">event</mat-icon> Appointments
          </a>
          <a routerLink="/customer/billing" routerLinkActive="active">
            <mat-icon aria-hidden="true">payments</mat-icon> Billing
          </a>
          <a routerLink="/customer/notifications" routerLinkActive="active">
            <mat-icon aria-hidden="true">notifications</mat-icon>
            <span class="nav-label">Notifications</span>
            @if (notificationBadge.unreadCount() > 0) {
              <span class="notification-badge" aria-label="Unread notifications">{{ badgeText() }}</span>
            }
          </a>
          <a routerLink="/customer/documents" routerLinkActive="active">
            <mat-icon aria-hidden="true">folder</mat-icon> Documents
          </a>
        }
        @if (auth.currentUser?.role === 'CARPENTER') {
          <a routerLink="/carpenter/requests" routerLinkActive="active">
            <mat-icon aria-hidden="true">assignment</mat-icon> Requests
          </a>
          <a routerLink="/carpenter/quotations" routerLinkActive="active">
            <mat-icon aria-hidden="true">request_quote</mat-icon> Quotations
          </a>
          <a routerLink="/carpenter/orders" routerLinkActive="active">
            <mat-icon aria-hidden="true">inventory_2</mat-icon> Orders
          </a>
          <a routerLink="/carpenter/projects" routerLinkActive="active">
            <mat-icon aria-hidden="true">timeline</mat-icon> Projects
          </a>
          <a routerLink="/carpenter/portfolio" routerLinkActive="active">
            <mat-icon aria-hidden="true">photo_library</mat-icon> Portfolio
          </a>
          <a routerLink="/carpenter/appointments" routerLinkActive="active">
            <mat-icon aria-hidden="true">event</mat-icon> Appointments
          </a>
          <a routerLink="/carpenter/billing" routerLinkActive="active">
            <mat-icon aria-hidden="true">payments</mat-icon> Billing
          </a>
          <a routerLink="/carpenter/notifications" routerLinkActive="active">
            <mat-icon aria-hidden="true">notifications</mat-icon>
            <span class="nav-label">Notifications</span>
            @if (notificationBadge.unreadCount() > 0) {
              <span class="notification-badge" aria-label="Unread notifications">{{ badgeText() }}</span>
            }
          </a>
          <a routerLink="/carpenter/documents" routerLinkActive="active">
            <mat-icon aria-hidden="true">folder</mat-icon> Documents
          </a>
          <a routerLink="/carpenter/audit-logs" routerLinkActive="active">
            <mat-icon aria-hidden="true">fact_check</mat-icon> Audit logs
          </a>
        }
      </aside>
      <main class="portal-content"><router-outlet /></main>
    </div>
  `
})
export class PortalLayoutComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly notificationBadge = inject(NotificationBadgeService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  get homeLink(): string { return this.auth.currentUser?.role === 'CARPENTER' ? '/carpenter' : '/customer'; }

  ngOnInit(): void {
    this.notificationBadge.refresh();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.notificationBadge.refresh());
  }

  badgeText(): string {
    const count = this.notificationBadge.unreadCount();
    return count > 99 ? '99+' : String(count);
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => { this.notifications.success('You have signed out.'); void this.router.navigate(['/login']); },
      error: () => this.auth.clearSession()
    });
  }
}
