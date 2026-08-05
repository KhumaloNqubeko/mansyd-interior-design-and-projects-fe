import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification, UnreadNotificationCount } from '../models/notification.models';
import { PageResponse } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/notifications`;

  notifications(): Observable<PageResponse<AppNotification>> {
    return this.http.get<PageResponse<AppNotification>>(this.url);
  }

  unreadCount(): Observable<UnreadNotificationCount> {
    return this.http.get<UnreadNotificationCount>(`${this.url}/unread-count`);
  }

  markRead(id: string): Observable<AppNotification> {
    return this.http.post<AppNotification>(`${this.url}/${id}/read`, {});
  }
}
