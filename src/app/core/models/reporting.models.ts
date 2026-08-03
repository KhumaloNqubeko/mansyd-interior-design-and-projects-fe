export interface FinancialReport {
  acceptedOrderValue: number;
  invoicedTotal: number;
  paidTotal: number;
  receivablesTotal: number;
  approvedExpenseTotal: number;
  netCashPosition: number;
}

export interface InventoryReport {
  materialCount: number;
  lowStockCount: number;
  stockValue: number;
}

export interface LowStockMaterialReport {
  id: string;
  code: string;
  name: string;
  stockQuantity: number;
  reorderLevel: number;
}

export interface ReportingOverview {
  financial: FinancialReport;
  ordersByStatus: Record<string, number>;
  projectsByStatus: Record<string, number>;
  invoicesByStatus: Record<string, number>;
  paymentsByStatus: Record<string, number>;
  expensesByCategory: Record<string, number>;
  inventory: InventoryReport;
  lowStockMaterials: LowStockMaterialReport[];
}
