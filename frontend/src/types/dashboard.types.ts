export interface SummaryResponse {
  success: boolean;
  summary: FinancialSummary;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  categoryTotals: CategoryTotal[];
  trends: Trend[];
}

export interface CategoryTotal {
  category: string;
  type: 'income' | 'expense';
  total: string;
}

export interface Trend {
  period: string;
  income: number;
  expense: number;
}

export interface FinancialRecord {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}
