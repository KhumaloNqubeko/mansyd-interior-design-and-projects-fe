export interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number; }
export interface CustomerSession { id: string; email: string; role: 'CUSTOMER' | 'CARPENTER'; displayName: string; }
export type { Project, ProjectTimelineEntry } from '../../../src/app/core/models/project.models';
export type { AppNotification } from '../../../src/app/core/models/notification.models';
export type { CustomerProfile } from '../../../src/app/core/models/customer.models';
export interface ProjectActivity { id: string; projectId: string; authorId: string; authorRole: 'CUSTOMER' | 'CARPENTER'; kind: 'COMMENT' | 'PHOTO' | 'REVIEW_REQUESTED' | 'COMPLETION_CONFIRMED' | 'ISSUE_REPORTED'; message: string; fileName: string | null; contentType: string | null; createdAt: string; }
