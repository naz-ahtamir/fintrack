'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency, calculatePercentage, cn } from '@/lib/utils';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: 'on-track' | 'at-risk' | 'achieved';
}

interface FinancialGoalsProps {
  goals: Goal[];
  isLoading?: boolean;
}

export function FinancialGoals({ goals, isLoading }: FinancialGoalsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse space-y-2">
            <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl animate-pulse">
                <div className="space-y-3">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
                  <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: Goal['status']) => {
    switch (status) {
      case 'achieved':
        return <Badge variant="success" size="sm" dot>Achieved</Badge>;
      case 'on-track':
        return <Badge variant="info" size="sm" dot>On Track</Badge>;
      case 'at-risk':
        return <Badge variant="warning" size="sm" dot>At Risk</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Financial Goals</CardTitle>
            <CardDescription>Track your savings objectives</CardDescription>
          </div>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View all
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal, index) => {
            const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
            const daysRemaining = Math.ceil(
              (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mb-1">
                        {goal.name}
                      </h4>
                      {getStatusBadge(goal.status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="relative h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                    </span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>
                      {daysRemaining > 0
                        ? `${daysRemaining} days remaining`
                        : goal.status === 'achieved'
                        ? 'Goal achieved!'
                        : 'Deadline passed'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
