'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/auth.store';
import { api, apiClient } from '@/lib/api-client';

export interface Transaction {
  id: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description: string;
  category?: {
    id: number;
    name: string;
    color?: string;
  };
  account?: {
    id: number;
    name: string;
  };
  transactionDate: string;
  createdAt: string;
}

export interface TransactionStats {
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

export function useTransactions(
  startDate?: Date,
  endDate?: Date,
  refreshKey: number = 0
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get token from auth store
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        
        // Check if token exists
        if (!token) {
          setError('No authentication token. Please login first.');
          setLoading(false);
          return;
        }
        
        // Fetch transactions
        const txResponse = await api.transactions.getAll();
        const txData = txResponse.data;
        setTransactions(txData);

        // Fetch stats dengan date range (sudah dihandle terpisah di dashboard)
        // Kita hanya ambil transaksi saja, stats diambil di dashboard separately
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        if (process.env.NODE_ENV === 'development') {
          console.error('Transaction fetch error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [startDate, endDate, refreshKey, token]);

  return { transactions, loading, error };
}

export interface CreateTransactionData {
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  accountId: string;
  categoryId: string;
  toAccountId?: string; // For transfers
}

// Create transaction using React Query
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      const response = await apiClient.post('/api/transactions', {
        description: data.description,
        amount: data.amount,
        transactionDate: data.date,
        type: data.type,
        accountId: parseInt(data.accountId),
        categoryId: parseInt(data.categoryId),
        toAccountId: data.toAccountId ? parseInt(data.toAccountId) : undefined,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
};
