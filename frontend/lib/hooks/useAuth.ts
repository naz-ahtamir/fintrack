import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { api } from '../api-client';
import { useAuthStore } from '../store/auth.store';

export const useAuth = () => {
  const { setAuth, clearAuth } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: (data: { email: string; password: string; name: string }) =>
      api.auth.register(data),
    onSuccess: (response) => {
      const { user, token } = response.data;
      setAuth(user, token);
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.auth.login(data),
    onSuccess: (response) => {
      const { user, token } = response.data;
      setAuth(user, token);
    },
  });

  const logout = () => {
    clearAuth();
  };

  return {
    register: registerMutation.mutate,
    registerLoading: registerMutation.isPending,
    registerError: registerMutation.error as AxiosError | null,
    
    login: loginMutation.mutate,
    loginLoading: loginMutation.isPending,
    loginError: loginMutation.error as AxiosError | null,
    
    logout,
  };
};