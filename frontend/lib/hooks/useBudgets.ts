import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Types
export interface Budget {
  id: number;
  userId: number;
  categoryId: number;
  amount: string;
  month: number;
  year: number;
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    icon?: string;
    color?: string;
  };
  spent?: number;
  remaining?: number;
  percentage?: number;
}

export interface BudgetFormData {
  categoryId: number;
  amount: number;
  month: number;
  year: number;
  alertThreshold?: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentage: number;
  budgetCount: number;
  onTrack: number;
  overBudget: number;
  underBudget: number;
  budgets: Budget[];
}

// Get all budgets
export const useGetBudgets = (month?: number, year?: number) => {
  return useQuery<Budget[]>({
    queryKey: ['budgets', month, year],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      
      const url = `/api/budgets${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    },
  });
};

// Get budget summary
export const useGetBudgetSummary = (month?: number, year?: number) => {
  return useQuery<BudgetSummary>({
    queryKey: ['budgets', 'summary', month, year],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());
      
      const url = `/api/budgets/summary${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiClient.get(url);
      return response.data;
    },
  });
};

// Get budget by ID
export const useGetBudget = (id: number) => {
  return useQuery<Budget>({
    queryKey: ['budgets', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/budgets/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create budget
export const useCreateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const response = await apiClient.post('/api/budgets', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};

// Update budget
export const useUpdateBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BudgetFormData> }) => {
      const response = await apiClient.patch(`/api/budgets/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.id] });
    },
  });
};

// Delete budget
export const useDeleteBudget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/api/budgets/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};
