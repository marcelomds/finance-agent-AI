import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadExpense } from '../services/expenseService';

export function useUploadExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadExpense(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
