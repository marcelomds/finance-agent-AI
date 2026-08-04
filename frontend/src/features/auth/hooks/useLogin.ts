import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../../contexts/AuthContext';

export function useLogin() {
  const auth = useAuth();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      auth.login(email, password),
  });
}
