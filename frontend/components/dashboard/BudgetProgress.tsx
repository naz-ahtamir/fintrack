'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { formatCurrency, calculatePercentage, cn } from '@/lib/utils';

interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  color: string;
}

interface BudgetProgressProps {
  budgets: Budget[];
  isLoading?: boolean;
}

export function BudgetProgress({ budgets, isLoading }: BudgetProgressProps) {
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
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-4 bg-[#1a1a1a] rounded w-1/3" />
                <div className="h-2 bg-[#1a1a1a] rounded w-full" />
                <div className="h-3 bg-[#1a1a1a] rounded w-1/4" />
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
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Track your spending limits</CardDescription>
          </div>
          <button className="text-sm text-[#0066ff] hover:underline font-medium">
            Manage
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {budgets.map((budget, index) => {
            const percentage = calculatePercentage(budget.spent, budget.limit);
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80 && percentage <= 100;

            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: budget.color }}
                    />
                    <span className="font-medium text-sm text-white">
                      {budget.category}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 tabular-nums">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                  </span>
                </div>
                <div className="relative h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 0.5, delay: index * 0.03, ease: "easeOut" }}
                    className={cn(
                      'h-full rounded-full',
                      isOverBudget
                        ? 'bg-red-500'
                        : isNearLimit
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-[#0066ff] to-[#0052cc]'
                    )}
                    style={
                      !isOverBudget && !isNearLimit
                        ? { backgroundColor: budget.color }
                        : undefined
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      isOverBudget
                        ? 'text-red-500'
                        : isNearLimit
                        ? 'text-amber-500'
                        : 'text-gray-400'
                    )}
                  >
                    {percentage.toFixed(0)}% used
                  </span>
                  {isOverBudget && (
                    <span className="text-xs text-red-500 font-semibold">
                      Over by {formatCurrency(budget.spent - budget.limit)}
                    </span>
                  )}
                  {isNearLimit && !isOverBudget && (
                    <span className="text-xs text-amber-500 font-semibold">
                      {formatCurrency(budget.limit - budget.spent)} left
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
