import { api } from '../../../services/api';
import type { ApiSuccessResponse } from '../../../types/apiResponse';
import type { Category, CategoryInput } from '../types/category';

export async function fetchCategories(): Promise<Category[]> {
  const res = await api.get<ApiSuccessResponse<Category[]>>('/api/categories');
  return res.data.data;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const res = await api.post<ApiSuccessResponse<Category>>('/api/categories', input);
  return res.data.data;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  const res = await api.patch<ApiSuccessResponse<Category>>(`/api/categories/${id}`, input);
  return res.data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/api/categories/${id}`);
}

export async function setCategoryActive(id: string, isActive: boolean): Promise<Category> {
  const res = await api.patch<ApiSuccessResponse<Category>>(`/api/categories/${id}/active`, { isActive });
  return res.data.data;
}
