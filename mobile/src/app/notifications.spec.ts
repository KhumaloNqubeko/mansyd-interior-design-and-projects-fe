import { projectNotificationLink } from './notifications.page';
import { AppNotification } from './models';
describe('Mobile notification navigation', () => {
  const notification = (url: string, type = 'PROJECT') => ({ actionUrl: url, type }) as AppNotification;
  it('opens only a customer project route', () => { expect(projectNotificationLink(notification('/customer/projects?projectId=123e4567-e89b-12d3-a456-426614174000'))).toBe('/projects/123e4567-e89b-12d3-a456-426614174000'); });
  it('does not follow external or admin links', () => { expect(projectNotificationLink(notification('https://evil.example/customer/projects'))).toBeNull(); expect(projectNotificationLink(notification('/admin/projects'))).toBeNull(); });
  it('does not expose excluded workflows', () => { expect(projectNotificationLink(notification('/customer/billing', 'INVOICE'))).toBeNull(); });
});
