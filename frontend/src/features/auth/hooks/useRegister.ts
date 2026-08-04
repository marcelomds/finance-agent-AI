import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';

export function useRegister() {
  const auth = useAuth();

  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name: string }) =>
      auth.register(email, password, name),
  });
}
