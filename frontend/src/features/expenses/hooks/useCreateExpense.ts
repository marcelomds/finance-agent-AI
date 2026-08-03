import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createExpense } from '../services/expenseService';

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExpense,
    onSuccess: (expense) => {
      queryClient.invalidateQueries({ queryKey: ['expenses', expense.organizationId] });
    },
  });
}
