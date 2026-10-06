import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonButton } from '@ionic/angular/standalone';
import { MobileApi, errorMessage } from './api.service';
import { Page, AppNotification } from './models';
export function projectNotificationLink(notification: AppNotification): string | null {
  if (notification.type !== 'PROJECT') return null;
  try { const url = new URL(notification.actionUrl, 'https://mansyd.invalid');
    if (url.origin !== 'https://mansyd.invalid' || url.pathname !== '/customer/projects') return null;
    const id = url.searchParams.get('projectId'); return id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? `/projects/${id}` : '/projects';
  } catch { return null; }
}
@Component({ standalone: true, imports: [DatePipe, RouterLink, IonButton], template: `<p class="eyebrow">Stay connected</p><h1>Notifications</h1><ion-button fill="clear" (click)="load(page())" [disabled]="loading() || busy()">Refresh</ion-button>
  @if (loading()) { <p role="status">Loading notifications…</p> } @else {
    @if (error()) { <p class="error" role="alert">{{ error() }}</p><ion-button fill="outline" (click)="load(page())">Try again</ion-button> }
    @for (notification of notifications(); track notification.id) { <article class="activity-card" [class.unread]="!notification.read"><div class="row"><strong>{{ notification.title }}</strong>@if (!notification.read) { <span class="pill">New</span> }</div><p>{{ notification.message }}</p><p class="muted small">{{ notification.createdAt | date:'medium' }}</p><div class="row">@if (link(notification); as target) { <a [routerLink]="target">View project →</a> }@if (!notification.read) { <ion-button size="small" fill="clear" (click)="markRead(notification)" [disabled]="busy()">Mark as read</ion-button> }</div></article> }
    @empty { @if (!error()) { <p class="muted">No notifications yet.</p> } }
    <div class="pagination"><ion-button fill="outline" (click)="load(page() - 1)" [disabled]="page() === 0 || busy()">Previous</ion-button><span>{{ page() + 1 }} / {{ pages() || 1 }}</span><ion-button fill="outline" (click)="load(page() + 1)" [disabled]="page() + 1 >= pages() || busy()">Next</ion-button></div>
  }` })
export class NotificationsPage {
  private readonly api = inject(MobileApi); readonly notifications = signal<AppNotification[]>([]); readonly loading = signal(true); readonly error = signal(''); readonly busy = signal(false); readonly page = signal(0); readonly pages = signal(0);
  readonly link = projectNotificationLink;
  constructor() { void this.load(0); }
  async load(page: number): Promise<void> { this.page.set(page); this.loading.set(true); this.error.set(''); try { const data = await this.api.get<Page<AppNotification>>(`/notifications?page=${page}&size=20`); this.notifications.set(data.content); this.pages.set(data.totalPages); } catch (error) { this.error.set(errorMessage(error)); } finally { this.loading.set(false); } }
  async markRead(notification: AppNotification): Promise<void> { if (this.busy()) return; this.busy.set(true); this.error.set(''); try { const updated = await this.api.post<AppNotification>(`/notifications/${notification.id}/read`); this.notifications.update(items => items.map(item => item.id === updated.id ? updated : item)); } catch (error) { this.error.set(errorMessage(error)); } finally { this.busy.set(false); } }
}
