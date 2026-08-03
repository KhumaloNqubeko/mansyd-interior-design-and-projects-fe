export type ExpenseCategory = 'MATERIALS' | 'LABOUR' | 'TRANSPORT' | 'EQUIPMENT' | 'SUBCONTRACTOR' | 'OVERHEAD' | 'OTHER';
export type ExpenseStatus = 'DRAFT' | 'APPROVED' | 'REIMBURSED' | 'VOID';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  amount: number;
  expenseDate: string;
  receiptReference: string;
  notes: string;
  supplierId?: string | null;
  supplierName?: string | null;
  projectId?: string | null;
  projectNumber?: string | null;
  materialId?: string | null;
  materialCode?: string | null;
  createdByEmail: string;
  createdAt: string;
}

export interface ExpenseRequest {
  title: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  receiptReference?: string;
  notes?: string;
  supplierId?: string | null;
  projectId?: string | null;
  materialId?: string | null;
}
