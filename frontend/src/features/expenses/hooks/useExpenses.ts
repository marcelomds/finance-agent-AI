import { useQuery } from '@tanstack/react-query';
import { fetchExpenses } from '../services/expenseService';

const PENDING_STATUSES = ['processing', 'extracted'];

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses,
    refetchInterval: (query) => {
      const hasPending = query.state.data?.some((e) => PENDING_STATUSES.includes(e.status));
      return hasPending ? 3000 : false;
    },
  });
}
