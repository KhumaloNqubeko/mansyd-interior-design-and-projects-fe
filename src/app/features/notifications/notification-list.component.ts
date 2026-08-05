import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppNotification } from '../../core/models/notification.models';
import { NotificationApiService } from '../../core/services/notification-api.service';
import { NotificationBadgeService } from '../../core/services/notification-badge.service';

@Component({
  standalone: true,
  imports: [DatePipe],
  template: `
    <section class="panel-page">
      <div class="page-heading">
        <p class="eyebrow">Notifications</p>
        <h1>Inbox</h1>
        <p class="muted">{{ unreadCount() }} unread notification{{ unreadCount() === 1 ? '' : 's' }}.</p>
      </div>

      <div class="list-stack">
        @for (notification of notifications(); track notification.id) {
          <article class="work-card request-card" [class.unread-card]="!notification.read">
            <div>
              <strong>{{ notification.title }}</strong>
              <p>{{ notification.message }}</p>
              <span class="muted">{{ notification.type }} · {{ notification.createdAt | date:'medium' }}</span>
            </div>
            <div class="status-actions">
              <span class="status-pill">{{ notification.read ? 'READ' : 'UNREAD' }}</span>
              @if (!notification.read) {
                <button class="text-button dark" type="button" (click)="markRead(notification)">Mark read</button>
              }
              @if (notification.actionUrl) {
                <button class="text-button dark" type="button" (click)="open(notification)">Open</button>
              }
            </div>
          </article>
        } @empty {
          <div class="empty-state"><strong>No notifications yet</strong><span>Important workflow updates will land here.</span></div>
        }
      </div>
    </section>
  `
})
export class NotificationListComponent implements OnInit {
  private readonly api = inject(NotificationApiService);
  private readonly notificationBadge = inject(NotificationBadgeService);
  private readonly router = inject(Router);
  readonly notifications = signal<AppNotification[]>([]);
  readonly unreadCount = this.notificationBadge.unreadCount;

  ngOnInit(): void { this.load(); }

  markRead(notification: AppNotification): void {
    this.api.markRead(notification.id).subscribe(updated => this.replace(updated));
  }

  open(notification: AppNotification): void {
    const afterRead = notification.read ? null : this.api.markRead(notification.id);
    if (afterRead) {
      afterRead.subscribe(updated => {
        this.replace(updated);
        void this.router.navigateByUrl(notification.actionUrl);
      });
    } else {
      void this.router.navigateByUrl(notification.actionUrl);
    }
  }

  private load(): void {
    this.api.notifications().subscribe(page => this.notifications.set(page.content));
    this.notificationBadge.refresh();
  }

  private replace(updated: AppNotification): void {
    const previous = this.notifications().find(item => item.id === updated.id);
    this.notifications.update(items => items.map(item => item.id === updated.id ? updated : item));
    if (previous && !previous.read && updated.read) this.notificationBadge.markOneRead();
  }
}
