export type QuotationStatus = 'DRAFT' | 'PENDING_CUSTOMER' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';
export type QuotationItemType = 'MATERIAL' | 'LABOUR' | 'DELIVERY' | 'OTHER';

export interface QuotationItem {
  id: string;
  type: QuotationItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxRate: number;
  lineTotal: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  serviceRequestId: string;
  customerId: string;
  customerName: string;
  status: QuotationStatus;
  expiryDate: string;
  notes: string;
  rejectionNotes: string;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  items: QuotationItem[];
  orderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuotationCreateRequest {
  serviceRequestId: string;
  expiryDate: string;
  notes: string;
}

export interface QuotationUpdateRequest {
  expiryDate: string;
  notes: string;
}

export interface QuotationRejectRequest {
  rejectionNotes: string;
}

export interface QuotationItemRequest {
  type: QuotationItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  taxRate: number;
}
