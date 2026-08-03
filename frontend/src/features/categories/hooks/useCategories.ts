import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../services/categoryService';

export function useCategories(organizationId: string) {
  return useQuery({
    queryKey: ['categories', organizationId],
    queryFn: () => fetchCategories(organizationId),
    enabled: Boolean(organizationId),
  });
}
