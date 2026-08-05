export type DocumentType = 'DESIGN' | 'QUOTATION' | 'CONTRACT' | 'INVOICE' | 'RECEIPT' | 'PHOTO' | 'WARRANTY' | 'OTHER';
export type DocumentStatus = 'ACTIVE' | 'ARCHIVED';

export interface BusinessDocument {
  id: string;
  title: string;
  type: DocumentType;
  status: DocumentStatus;
  fileName: string;
  contentType: string;
  fileSizeBytes?: number | null;
  storageUrl: string;
  notes: string;
  customerVisible: boolean;
  customerId: string;
  customerName: string;
  serviceRequestId?: string | null;
  serviceRequestTitle?: string | null;
  projectId?: string | null;
  projectNumber?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  uploadedByEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRequest {
  title: string;
  type: DocumentType;
  fileName: string;
  contentType: string;
  fileSizeBytes?: number | null;
  storageUrl: string;
  notes?: string;
  customerVisible: boolean;
  customerId: string;
  serviceRequestId?: string | null;
  projectId?: string | null;
  invoiceId?: string | null;
}
