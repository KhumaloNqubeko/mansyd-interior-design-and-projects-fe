import { Injectable, inject, signal } from '@angular/core';
import { NotificationApiService } from './notification-api.service';

@Injectable({ providedIn: 'root' })
export class NotificationBadgeService {
  private readonly notificationsApi = inject(NotificationApiService);
  readonly unreadCount = signal(0);

  refresh(): void {
    this.notificationsApi.unreadCount().subscribe(count => this.unreadCount.set(count.unreadCount));
  }

  markOneRead(): void {
    this.unreadCount.update(count => Math.max(0, count - 1));
  }
}
