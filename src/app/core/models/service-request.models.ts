export type ServiceRequestStatus =
  'SUBMITTED' |
  'UNDER_REVIEW' |
  'SITE_VISIT_REQUIRED' |
  'QUOTATION_IN_PROGRESS' |
  'QUOTED' |
  'CANCELLED' |
  'CLOSED';

export interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  description: string;
  preferredContactMethod: string;
  siteAddress: string;
  status: ServiceRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestUpsertRequest {
  title: string;
  description: string;
  preferredContactMethod: string;
  siteAddress: string;
}
