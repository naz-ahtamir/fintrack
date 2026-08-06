import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Goal {
  id: number;
  userId: number;
  title: string;
  description?: string;
  category?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  priority?: number;
  status: 'on-track' | 'at-risk' | 'achieved';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalFormData {
  title: string;
  description?: string;
  category?: string;
  targetAmount: number;
  targetDate?: string;
  priority?: number;
}

export interface GoalContribution {
  amount: number;
  notes?: string;
}

// Get all goals
export const useGetGoals = () => {
  return useQuery<Goal[]>({
    queryKey: ['goals'],
    queryFn: async () => {
      const response = await apiClient.get('/api/goals');
      return response.data;
    },
  });
};

// Get goal by ID
export const useGetGoal = (id: number) => {
  return useQuery<Goal>({
    queryKey: ['goals', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/goals/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create goal
export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GoalFormData) => {
      const response = await apiClient.post('/api/goals', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

// Update goal
export const useUpdateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<GoalFormData> }) => {
      const response = await apiClient.patch(`/api/goals/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', variables.id] });
    },
  });
};

// Delete goal
export const useDeleteGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete(`/api/goals/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
};

// Add contribution to goal
export const useAddGoalContribution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: GoalContribution }) => {
      const response = await apiClient.post(`/api/goals/${id}/contributions`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['goals', variables.id] });
    },
  });
};
