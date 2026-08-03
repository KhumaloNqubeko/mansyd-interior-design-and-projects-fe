export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: InvoiceStatus;
  issueDate?: string | null;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceCreateRequest {
  orderId: string;
  dueDate: string;
  totalAmount: number;
  notes: string;
}
