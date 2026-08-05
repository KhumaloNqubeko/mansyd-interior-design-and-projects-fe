export type ProjectStatus = 'CREATED' | 'SCHEDULED' | 'IN_PROGRESS' | 'AWAITING_MATERIALS' | 'ON_HOLD' |
  'QUALITY_INSPECTION' | 'READY_FOR_DELIVERY' | 'DELIVERED' | 'INSTALLED' | 'COMPLETED' | 'CANCELLED';

export interface Project {
  id: string;
  projectNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: ProjectStatus;
  progress: number;
  plannedStartDate?: string | null;
  plannedCompletionDate?: string | null;
  actualStartDate?: string | null;
  actualCompletionDate?: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUpdateRequest {
  plannedStartDate?: string | null;
  plannedCompletionDate?: string | null;
  notes: string;
}

export interface ProjectStatusUpdateRequest {
  status: ProjectStatus;
  progress?: number;
  actualCompletionDate?: string | null;
}

export interface ProjectTimelineRequest {
  title: string;
  message: string;
}

export interface ProjectTimelineEntry {
  id: string;
  projectId: string;
  createdByUserId: string;
  createdByRole: 'CARPENTER' | 'CUSTOMER';
  title: string;
  message: string;
  createdAt: string;
}
