export type UnitOfMeasure = 'EACH' | 'METRE' | 'SQUARE_METRE' | 'LITRE' | 'KILOGRAM' | 'PACK' | 'SHEET';
export type StockTransactionType = 'STOCK_IN' | 'PROJECT_ALLOCATION' | 'PROJECT_RETURN' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'DAMAGED';

export interface Supplier {
  id: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  active: boolean;
}

export interface SupplierRequest {
  name: string;
  contactName?: string;
  email?: string;
  phoneNumber?: string;
  active: boolean;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  unitOfMeasure: UnitOfMeasure;
  unitCost: number;
  stockQuantity: number;
  reorderLevel: number;
  supplierId?: string | null;
  supplierName?: string | null;
  active: boolean;
  lowStock: boolean;
}

export interface MaterialRequest {
  code: string;
  name: string;
  unitOfMeasure: UnitOfMeasure;
  unitCost: number;
  reorderLevel: number;
  supplierId?: string | null;
  active: boolean;
}

export interface StockChangeRequest {
  materialId: string;
  projectId?: string | null;
  type: StockTransactionType;
  quantity: number;
  notes: string;
}

export interface StockTransaction {
  id: string;
  materialId: string;
  materialCode: string;
  projectId?: string | null;
  type: StockTransactionType;
  quantity: number;
  notes: string;
  createdAt: string;
}
