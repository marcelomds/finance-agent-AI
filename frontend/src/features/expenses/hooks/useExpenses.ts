import { useQuery } from '@tanstack/react-query';
import { fetchExpenses } from '../services/expenseService';

export function useExpenses(organizationId: string) {
  return useQuery({
    queryKey: ['expenses', organizationId],
    queryFn: () => fetchExpenses(organizationId),
    enabled: Boolean(organizationId),
  });
}
