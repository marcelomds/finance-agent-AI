import { api } from '../../../services/api';
import type { ApiSuccessResponse } from '../../../types/apiResponse';
import type { CreateExpenseInput, Expense } from '../types/expense';

export async function fetchExpenses(organizationId: string): Promise<Expense[]> {
  const res = await api.get<ApiSuccessResponse<Expense[]>>('/api/expenses', {
    params: { organizationId },
  });
  return res.data.data;
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const res = await api.post<ApiSuccessResponse<Expense>>('/api/expenses', input);
  return res.data.data;
}
