import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Account {
  id: number;
  userId: number;
  name: string;
  type: 'CASH' | 'BANK' | 'CREDIT_CARD' | 'INVESTMENT';
  currency?: string;
  balance: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountFormData {
  name: string;
  type: 'CASH' | 'BANK' | 'CREDIT_CARD' | 'INVESTMENT';
  currency?: string;
  balance?: number;
  description?: string;
}

// Get all accounts
export const useGetAccounts = () => {
  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const response = await apiClient.get('/api/accounts');
      return response.data;
    },
  });
};

// Get account by ID
export const useGetAccount = (id: number) => {
  return useQuery<Account>({
    queryKey: ['accounts', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/accounts/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create account
export const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AccountFormData) => {
      const response = await apiClient.post('/api/accounts', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};

// Update account
export const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<AccountFormData> }) => {
      const response = await apiClient.patch(`/api/accounts/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts', variables.id] });
    },
  });
};

// Delete account
export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/api/accounts/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};
