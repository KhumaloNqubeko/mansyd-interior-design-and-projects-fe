export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type AppointmentType = 'SITE_VISIT' | 'MEASUREMENT' | 'DESIGN_REVIEW' | 'INSTALLATION' | 'FOLLOW_UP' | 'OTHER';

export interface Appointment {
  id: string;
  title: string;
  type: AppointmentType;
  status: AppointmentStatus;
  scheduledStart: string;
  scheduledEnd: string;
  location: string;
  notes: string;
  customerId: string;
  customerName: string;
  serviceRequestId?: string | null;
  serviceRequestTitle?: string | null;
  projectId?: string | null;
  projectNumber?: string | null;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentRequest {
  title: string;
  type: AppointmentType;
  scheduledStart: string;
  scheduledEnd: string;
  location: string;
  notes?: string;
  customerId: string;
  serviceRequestId?: string | null;
  projectId?: string | null;
}
