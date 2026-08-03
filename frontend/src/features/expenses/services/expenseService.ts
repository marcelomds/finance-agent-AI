import { api } from '../../../services/api';
import type { ApiSuccessResponse } from '../../../types/apiResponse';
import type { Expense } from '../types/expense';

export async function fetchExpenses(organizationId: string): Promise<Expense[]> {
  const res = await api.get<ApiSuccessResponse<Expense[]>>('/api/expenses', {
    params: { organizationId },
  });
  return res.data.data;
}

export async function uploadExpense(
  organizationId: string,
  userId: string,
  file: File,
): Promise<Expense> {
  const formData = new FormData();
  formData.append('organizationId', organizationId);
  formData.append('userId', userId);
  formData.append('file', file);

  const res = await api.post<ApiSuccessResponse<Expense>>('/api/expenses/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function fetchExpenseFileUrl(
  organizationId: string,
  expenseId: string,
): Promise<string> {
  const res = await api.get<ApiSuccessResponse<{ url: string }>>(
    `/api/expenses/${expenseId}/file-url`,
    { params: { organizationId } },
  );
  return res.data.data.url;
}
