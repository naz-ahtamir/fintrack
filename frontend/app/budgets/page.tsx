'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { BudgetModal, BudgetFormData } from '@/components/ui/BudgetModal';
import { useGetBudgets, useGetBudgetSummary, useCreateBudget, useDeleteBudget } from '@/lib/hooks/useBudgets';
import { Plus, PiggyBank, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { formatCurrency, calculatePercentage, cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function BudgetsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [period, setPeriod] = useState('monthly');
  
  // State untuk filter month/year
  const [selectedMonth, setSelectedMonth] = useState(8); // August (seed data)
  const [selectedYear, setSelectedYear] = useState(2026); // 2026 (seed data)

  // Fetch budgets data dengan filter
  const { data: budgets = [], isLoading } = useGetBudgets(selectedMonth, selectedYear);
  const { data: summaryData } = useGetBudgetSummary(selectedMonth, selectedYear);
  
  // Mutations
  const createBudgetMutation = useCreateBudget();
  const deleteBudgetMutation = useDeleteBudget();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleSaveBudget = async (budgetData: BudgetFormData) => {
    try {
      await createBudgetMutation.mutateAsync({
        categoryId: parseInt(budgetData.category),
        amount: parseFloat(budgetData.limitAmount),
        month: selectedMonth,
        year: selectedYear,
        alertThreshold: 80,
      });
      toast.success('Budget created successfully!');
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create budget');
    }
  };

  const handleDeleteBudget = async (id: number) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;
    
    try {
      await deleteBudgetMutation.mutateAsync(id);
      toast.success('Budget deleted successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete budget');
    }
  };

  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = calculatePercentage(spent, limit);
    if (percentage > 100) return 'over';
    if (percentage > 80) return 'warning';
    return 'good';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Use summary data if available, otherwise calculate from budgets
  const summary = summaryData || {
    totalBudget: budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0),
    totalSpent: budgets.reduce((sum, b) => sum + (b.spent || 0), 0),
    onTrack: budgets.filter(b => (b.percentage || 0) <= 100 && (b.percentage || 0) >= 50).length,
    overBudget: budgets.filter(b => (b.percentage || 0) > 100).length,
  };

  const totalBudget = summary?.totalBudget || 0;
  const totalSpent = summary?.totalSpent || 0;
  const onTrackCount = summary?.onTrack || 0;
  const overBudgetCount = summary?.overBudget || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono text-[#0066ff] mb-2">
              Budgets
            </h1>
            <p className="text-zinc-400">
              Set and track spending limits for different categories
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Month/Year Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg border border-zinc-700 bg-[#1a1a1a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
            >
              {monthNames.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg border border-zinc-700 bg-[#1a1a1a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const y = 2026 - i; // Start from 2026 to match seed data
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Create Budget
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Total Budget
                </p>
                <p className="text-2xl font-bold font-mono text-white">
                  {formatCurrency(totalBudget)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#0066ff]/10 flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-[#0066ff]" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Total Spent
                </p>
                <p className="text-2xl font-bold font-mono text-white">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#f59e0b]" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  On Track
                </p>
                <p className="text-2xl font-bold font-mono text-[#10b981]">
                  {onTrackCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#10b981]" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Over Budget
                </p>
                <p className="text-2xl font-bold font-mono text-[#ef4444]">
                  {overBudgetCount}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#ef4444]/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[#ef4444]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Overall Budget Progress</CardTitle>
                <CardDescription>
                  {formatCurrency(totalSpent)} spent of {formatCurrency(totalBudget)} total budget
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-mono text-white">
                  {calculatePercentage(totalSpent, totalBudget).toFixed(0)}%
                </p>
                <p className="text-sm text-zinc-400">
                  {formatCurrency(totalBudget - totalSpent)} remaining
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(calculatePercentage(totalSpent, totalBudget), 100)}%` }}
                transition={{ duration: 0.5 }}
                className={cn(
                  'h-full rounded-full',
                  calculatePercentage(totalSpent, totalBudget) > 100
                    ? 'bg-red-500'
                    : calculatePercentage(totalSpent, totalBudget) > 80
                    ? 'bg-yellow-500'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget List */}
        {budgets.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={<PiggyBank className="w-12 h-12" />}
                title="No budgets created"
                description="Create your first budget to start tracking your spending limits"
                action={
                  <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    Create Your First Budget
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map((budget, index) => {
              const percentage = budget.percentage || 0;
              const status = getBudgetStatus(budget.spent || 0, parseFloat(budget.amount));
              const remaining = parseFloat(budget.amount) - (budget.spent || 0);

              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card hover>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${budget.category.color}20` }}
                        >
                          {budget.category.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">
                            {budget.category.name}
                          </h3>
                          <p className="text-xs text-zinc-400">
                            Monthly Budget
                          </p>
                        </div>
                      </div>
                      {status === 'over' ? (
                        <Badge variant="error" size="sm" dot>Over Budget</Badge>
                      ) : status === 'warning' ? (
                        <Badge variant="warning" size="sm" dot>Near Limit</Badge>
                      ) : (
                        <Badge variant="success" size="sm" dot>On Track</Badge>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-400">
                          {formatCurrency(budget.spent || 0)} / {formatCurrency(parseFloat(budget.amount))}
                        </span>
                        <span
                          className={cn(
                            'text-sm font-semibold font-mono',
                            status === 'over'
                              ? 'text-[#ef4444]'
                              : status === 'warning'
                              ? 'text-[#f59e0b]'
                              : 'text-zinc-400'
                          )}
                        >
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="relative h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentage, 100)}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className={cn(
                            'h-full rounded-full',
                            status === 'over'
                              ? 'bg-red-500'
                              : status === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-gradient-to-r from-blue-500 to-blue-600'
                          )}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#262626]">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">
                          {remaining >= 0 ? 'Remaining' : 'Over by'}
                        </span>
                        <span
                          className={cn(
                            'text-sm font-semibold font-mono',
                            remaining >= 0
                              ? 'text-[#10b981]'
                              : 'text-[#ef4444]'
                          )}
                        >
                          {formatCurrency(Math.abs(remaining))}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Budget Modal */}
        <BudgetModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveBudget}
        />
      </div>
    </DashboardLayout>
  );
}
