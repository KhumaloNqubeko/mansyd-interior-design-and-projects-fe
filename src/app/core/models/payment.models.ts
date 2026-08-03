export type PaymentStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  proofReference: string;
  status: PaymentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentCreateRequest {
  invoiceId: string;
  amount: number;
  paymentDate: string;
  proofReference: string;
  notes: string;
}
