import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '../../../contexts/OrganizationContext';
import { uploadExpense } from '../services/expenseService';

export function useUploadExpense() {
  const { organizationId, userId } = useOrganization();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadExpense(organizationId, userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', organizationId] });
    },
  });
}
