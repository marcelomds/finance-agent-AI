import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '../../../contexts/OrganizationContext';
import {
  createCategory,
  deleteCategory,
  setCategoryActive,
  updateCategory,
} from '../services/categoryService';
import type { CategoryInput } from '../types/category';

export function useCreateCategory() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CategoryInput) => createCategory(organizationId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', organizationId] });
    },
  });
}

export function useUpdateCategory() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CategoryInput> }) =>
      updateCategory(organizationId, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', organizationId] });
    },
  });
}

export function useDeleteCategory() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(organizationId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', organizationId] });
    },
  });
}

export function useSetCategoryActive() {
  const { organizationId } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setCategoryActive(organizationId, id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', organizationId] });
    },
  });
}
