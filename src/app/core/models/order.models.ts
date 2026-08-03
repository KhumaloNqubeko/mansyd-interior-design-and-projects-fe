export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'IN_PROGRESS' | 'ON_HOLD' | 'READY_FOR_DELIVERY' |
  'DELIVERED' | 'INSTALLED' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  orderNumber: string;
  quotationId: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  acceptedTotal: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}
