import { UserRole } from './auth.models';

export type AuditAction =
  | 'CREATED'
  | 'UPDATED'
  | 'STATUS_CHANGED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ARCHIVED'
  | 'ISSUED'
  | 'SUBMITTED';

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  actorRole: UserRole;
  action: AuditAction;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}
