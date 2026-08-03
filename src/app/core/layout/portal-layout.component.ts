import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth.service';
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
          <a routerLink="/customer/appointments" routerLinkActive="active">
            <mat-icon aria-hidden="true">event</mat-icon> Appointments
          </a>
          <a routerLink="/customer/billing" routerLinkActive="active">
            <mat-icon aria-hidden="true">payments</mat-icon> Billing
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
          <a routerLink="/carpenter/appointments" routerLinkActive="active">
            <mat-icon aria-hidden="true">event</mat-icon> Appointments
          </a>
          <a routerLink="/carpenter/billing" routerLinkActive="active">
            <mat-icon aria-hidden="true">payments</mat-icon> Billing
          </a>
          <a routerLink="/carpenter/inventory" routerLinkActive="active">
            <mat-icon aria-hidden="true">warehouse</mat-icon> Inventory
          </a>
          <a routerLink="/carpenter/expenses" routerLinkActive="active">
            <mat-icon aria-hidden="true">receipt_long</mat-icon> Expenses
          </a>
          <a routerLink="/carpenter/reporting" routerLinkActive="active">
            <mat-icon aria-hidden="true">monitoring</mat-icon> Reporting
          </a>
        }
        <span class="coming-soon">Notifications and documents come next.</span>
      </aside>
      <main class="portal-content"><router-outlet /></main>
    </div>
  `
})
export class PortalLayoutComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);
  get homeLink(): string { return this.auth.currentUser?.role === 'CARPENTER' ? '/carpenter' : '/customer'; }
  logout(): void {
    this.auth.logout().subscribe({
      next: () => { this.notifications.success('You have signed out.'); void this.router.navigate(['/login']); },
      error: () => this.auth.clearSession()
    });
  }
}
