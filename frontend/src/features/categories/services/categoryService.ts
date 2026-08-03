import { api } from '../../../services/api';
import type { ApiSuccessResponse } from '../../../types/apiResponse';
import type { Category, CategoryInput } from '../types/category';

export async function fetchCategories(organizationId: string): Promise<Category[]> {
  const res = await api.get<ApiSuccessResponse<Category[]>>('/api/categories', {
    params: { organizationId },
  });
  return res.data.data;
}

export async function createCategory(
  organizationId: string,
  input: CategoryInput,
): Promise<Category> {
  const res = await api.post<ApiSuccessResponse<Category>>('/api/categories', {
    organizationId,
    ...input,
  });
  return res.data.data;
}

export async function updateCategory(
  organizationId: string,
  id: string,
  input: Partial<CategoryInput>,
): Promise<Category> {
  const res = await api.patch<ApiSuccessResponse<Category>>(`/api/categories/${id}`, input, {
    params: { organizationId },
  });
  return res.data.data;
}

export async function deleteCategory(organizationId: string, id: string): Promise<void> {
  await api.delete(`/api/categories/${id}`, { params: { organizationId } });
}

export async function setCategoryActive(
  organizationId: string,
  id: string,
  isActive: boolean,
): Promise<Category> {
  const res = await api.patch<ApiSuccessResponse<Category>>(
    `/api/categories/${id}/active`,
    { isActive },
    { params: { organizationId } },
  );
  return res.data.data;
}
