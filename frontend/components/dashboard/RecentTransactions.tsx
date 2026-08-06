'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, MoreVertical } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  account: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-5 bg-[#1a1a1a] rounded w-1/3" />
            <div className="h-4 bg-[#1a1a1a] rounded w-1/2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#1a1a1a] rounded w-3/4" />
                  <div className="h-3 bg-[#1a1a1a] rounded w-1/2" />
                </div>
                <div className="h-6 bg-[#1a1a1a] rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activity</CardDescription>
          </div>
          <button className="text-sm text-[#0066ff] hover:underline font-medium">
            View all
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer group"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  transaction.type === 'income'
                    ? 'bg-emerald-500/10'
                    : 'bg-red-500/10'
                )}
              >
                {transaction.type === 'income' ? (
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-red-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-white truncate">
                  {transaction.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="neutral" size="sm">
                    {transaction.category}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDate(transaction.date, 'relative')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    'font-semibold text-sm tabular-nums',
                    transaction.type === 'income'
                      ? 'text-emerald-500'
                      : 'text-white'
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {formatCurrency(Math.abs(transaction.amount))}
                </p>
                <button className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[#262626] transition-all">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
