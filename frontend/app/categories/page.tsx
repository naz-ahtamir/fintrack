'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoryModal } from '@/components/ui/CategoryModal';
import { Plus, Tag, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, calculatePercentage } from '@/lib/utils';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store/auth.store';

interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  color: string;
  icon: string;
  userId: number;
  _count?: {
    transactions: number;
  };
  monthlyTotal?: number;
  percentage?: number;
}

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch categories and transactions from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Parallel fetch categories and transactions
        const [categoriesRes, transactionsRes] = await Promise.all([
          api.categories.getAll(),
          api.transactions.getAll(),
        ]);
        
        setCategories(categoriesRes.data);
        setTransactions(transactionsRes.data);
      } catch (error) {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, refreshKey]);

  // Calculate monthly totals and transaction counts for each category
  const categoriesWithStats = React.useMemo(() => {
    const startDate = new Date(selectedYear, selectedMonth, 1);
    const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

    return categories.map(category => {
      // Filter transactions for this category in selected month
      const categoryTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.transactionDate);
        return tx.categoryId === category.id && 
               txDate >= startDate && 
               txDate <= endDate;
      });

      // Calculate total
      const monthlyTotal = categoryTransactions.reduce((sum, tx) => {
        return sum + Number(tx.amount);
      }, 0);

      return {
        ...category,
        monthlyTotal,
        transactionCount: categoryTransactions.length,
      };
    });
  }, [categories, transactions, selectedMonth, selectedYear]);

  const incomeCategories = categoriesWithStats.filter(c => c.type === 'INCOME');
  const expenseCategories = categoriesWithStats.filter(c => c.type === 'EXPENSE');

  // Calculate totals
  const totalIncome = incomeCategories.reduce((sum, c) => sum + (c.monthlyTotal || 0), 0);
  const totalExpense = expenseCategories.reduce((sum, c) => sum + (c.monthlyTotal || 0), 0);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleSaveCategory = async (categoryData: any) => {
    try {
      await api.categories.create({
        name: categoryData.name,
        type: categoryData.type.toUpperCase(),
        color: categoryData.color,
        icon: categoryData.icon,
      });

      // Refresh categories list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create category:', error);
      }
      alert('Failed to create category. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono text-[#0066ff] mb-2">
              Categories
            </h1>
            <p className="text-zinc-400">
              Organize your transactions with custom categories
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Month/Year Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg border border-zinc-700 bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
            >
              {monthNames.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 rounded-lg border border-zinc-700 bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y}>{y}</option>;
              })}
            </select>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsModalOpen(true)}
            >
              Add Category
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Income Categories
                </p>
                <p className="text-2xl font-bold font-mono text-[#10b981]">
                  {formatCurrency(totalIncome)}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {incomeCategories.length} categories
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#10b981]" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Expense Categories
                </p>
                <p className="text-2xl font-bold font-mono text-[#ef4444]">
                  {formatCurrency(totalExpense)}
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {expenseCategories.length} categories
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#ef4444]/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-[#ef4444]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Income Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Income Categories</CardTitle>
            <CardDescription>Track your income sources</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-neutral-600 dark:text-neutral-400">Loading categories...</p>
              </div>
            ) : incomeCategories.length === 0 ? (
              <EmptyState
                icon={<Tag className="w-12 h-12" />}
                title="No income categories"
                description="Add categories to organize your income"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeCategories.map((category, index) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card hover className="group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            {category.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              {category.name}
                            </h4>
                            <p className="text-xs text-zinc-400">
                              {category.transactionCount || 0} transactions
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 hover:bg-[#1a1a1a] rounded-lg">
                            <Edit2 className="w-3.5 h-3.5 text-zinc-500" />
                          </button>
                          <button className="p-1.5 hover:bg-[#ef4444]/10 rounded-lg">
                            <Trash2 className="w-3.5 h-3.5 text-[#ef4444]" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xl font-bold font-mono text-[#10b981]">
                        {formatCurrency(category.monthlyTotal || 0)}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Manage your spending categories</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-neutral-600 dark:text-neutral-400">Loading categories...</p>
              </div>
            ) : expenseCategories.length === 0 ? (
              <EmptyState
                icon={<Tag className="w-12 h-12" />}
                title="No expense categories"
                description="Add categories to organize your expenses"
              />
            ) : (
              <div className="space-y-4">
                {expenseCategories.map((category, index) => {
                  const monthlyTotal = category.monthlyTotal || 0;
                  const percentage = totalExpense > 0 ? (monthlyTotal / totalExpense) * 100 : 0;
                  
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 border border-[#262626] rounded-xl hover:border-zinc-700 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            {category.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">
                              {category.name}
                            </h4>
                            <p className="text-xs text-zinc-400">
                              {category.transactionCount || 0} transactions this month
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold font-mono text-white">
                              {formatCurrency(monthlyTotal)}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {percentage.toFixed(1)}% of total
                            </p>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-[#1a1a1a] rounded-lg">
                              <Edit2 className="w-4 h-4 text-zinc-500" />
                            </button>
                            <button className="p-2 hover:bg-[#ef4444]/10 rounded-lg">
                              <Trash2 className="w-4 h-4 text-[#ef4444]" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Modal */}
        <CategoryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCategory}
        />
      </div>
    </DashboardLayout>
  );
}
