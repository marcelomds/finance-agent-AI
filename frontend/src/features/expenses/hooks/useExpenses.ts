import { useQuery } from '@tanstack/react-query';
import { fetchExpenses } from '../services/expenseService';

export function useExpenses(userId: string) {
  return useQuery({
    queryKey: ['expenses', userId],
    queryFn: () => fetchExpenses(userId),
    enabled: Boolean(userId),
  });
}
