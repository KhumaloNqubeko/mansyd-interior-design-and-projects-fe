export type NotificationType = 'SERVICE_REQUEST' | 'APPOINTMENT' | 'INVOICE' | 'PAYMENT' | 'PROJECT' | 'GENERAL';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface UnreadNotificationCount {
  unreadCount: number;
}
