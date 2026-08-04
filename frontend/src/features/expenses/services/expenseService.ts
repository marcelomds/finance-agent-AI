import { api } from '../../../services/api';
import type { ApiSuccessResponse } from '../../../types/apiResponse';
import type { Expense } from '../types/expense';

export async function fetchExpenses(): Promise<Expense[]> {
  const res = await api.get<ApiSuccessResponse<Expense[]>>('/api/expenses');
  return res.data.data;
}

export async function uploadExpense(file: File): Promise<Expense> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post<ApiSuccessResponse<Expense>>('/api/expenses/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function fetchExpenseFileUrl(expenseId: string): Promise<string> {
  const res = await api.get<ApiSuccessResponse<{ url: string }>>(`/api/expenses/${expenseId}/file-url`);
  return res.data.data.url;
}
