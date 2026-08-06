'use client';

import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/lib/api-client';

interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  transactionDate: string;
  category: {
    id: string;
    name: string;
    type: string;
    color: string;
  };
}

export default function ReportsPage() {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch transactions from database
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const year = parseInt(selectedYear);
        const startDate = new Date(year, 0, 1).toISOString();
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999).toISOString();
        
        const response = await api.transactions.getAll({
          startDate,
          endDate,
        });
        
        // Response is direct array, not paginated
        const fetchedTransactions = Array.isArray(response.data) ? response.data : [];
        
        setTransactions(fetchedTransactions);
      } catch (error) {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [selectedYear]);

  // Calculate monthly data from transactions
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = months.map((month, index) => {
      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.transactionDate);
        return date.getMonth() === index;
      });

      const income = monthTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expense = monthTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        month,
        income,
        expense,
        savings: income - expense,
      };
    });

    return monthlyStats;
  }, [transactions]);

  // Calculate expense by category
  const categoryData = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE');
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryMap = new Map<string, { name: string; value: number; color: string }>();
    
    expenseTransactions.forEach(t => {
      const existing = categoryMap.get(t.category.id);
      if (existing) {
        existing.value += Number(t.amount);
      } else {
        categoryMap.set(t.category.id, {
          name: t.category.name,
          value: Number(t.amount),
          color: t.category.color || '#6b7280',
        });
      }
    });

    return Array.from(categoryMap.values())
      .map(cat => ({
        ...cat,
        percentage: totalExpense > 0 ? Math.round((cat.value / totalExpense) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Calculate income sources by category
  const incomeSourceData = useMemo(() => {
    const incomeTransactions = transactions.filter(t => t.type === 'INCOME');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

    const sourceMap = new Map<string, { source: string; amount: number }>();
    
    incomeTransactions.forEach(t => {
      const existing = sourceMap.get(t.category.id);
      if (existing) {
        existing.amount += Number(t.amount);
      } else {
        sourceMap.set(t.category.id, {
          source: t.category.name,
          amount: Number(t.amount),
        });
      }
    });

    return Array.from(sourceMap.values())
      .map(src => ({
        ...src,
        percentage: totalIncome > 0 ? Math.round((src.amount / totalIncome) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Calculate yearly comparison (current year only for now)
  const yearlyComparison = useMemo(() => {
    const year = parseInt(selectedYear);
    const income = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return [
      { year: (year - 3).toString(), income: 0, expense: 0 },
      { year: (year - 2).toString(), income: 0, expense: 0 },
      { year: (year - 1).toString(), income: 0, expense: 0 },
      { year: year.toString(), income, expense },
    ];
  }, [transactions, selectedYear]);

  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);
  const totalSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : '0.0';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono text-[#0066ff] mb-2">
              Financial Reports
            </h1>
            <p className="text-zinc-400">
              Detailed insights and analytics about your finances
            </p>
          </div>
          <div className="flex gap-3">
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              options={[
                { value: '2026', label: '2026' },
                { value: '2025', label: '2025' },
                { value: '2024', label: '2024' },
              ]}
            />
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
              Export PDF
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <p className="text-zinc-400 font-mono">Loading reports...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Total Income
                </p>
                <p className="text-2xl font-bold font-mono text-[#10b981]">
                  {formatCurrency(totalIncome)}
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
                  Total Expenses
                </p>
                <p className="text-2xl font-bold font-mono text-[#ef4444]">
                  {formatCurrency(totalExpense)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#ef4444]/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-[#ef4444]" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Total Savings
                </p>
                <p className="text-2xl font-bold font-mono text-[#0066ff]">
                  {formatCurrency(totalSavings)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#0066ff]/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#0066ff]" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Savings Rate
                </p>
                <p className="text-2xl font-bold font-mono text-white">
                  {savingsRate}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#f59e0b]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Income vs Expense Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expense Trend</CardTitle>
            <CardDescription>Monthly comparison of income and expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="income" fill="#22c55e" name="Income" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" name="Expenses" radius={[8, 8, 0, 0]} />
                <Bar dataKey="savings" fill="#3b82f6" name="Savings" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Spending distribution by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryData.length === 0 ? (
                  <p className="text-center text-zinc-400 py-4">
                    No expense data available for this period
                  </p>
                ) : (
                  categoryData.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium text-white">
                          {category.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold font-mono text-white">
                          {formatCurrency(category.value)}
                        </span>
                        <span className="text-xs text-zinc-400 ml-2">
                          {category.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${category.percentage}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>
                ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Income Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Income Sources</CardTitle>
              <CardDescription>Revenue streams breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {incomeSourceData.length === 0 ? (
                  <p className="text-center text-zinc-400 py-4">
                    No income data available for this period
                  </p>
                ) : (
                  incomeSourceData.map((source, index) => (
                  <div key={source.source} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">
                          {source.source}
                        </p>
                        <p className="text-sm text-zinc-400">
                          {source.percentage}% of total income
                        </p>
                      </div>
                      <p className="text-lg font-bold font-mono text-[#10b981]">
                        {formatCurrency(source.amount)}
                      </p>
                    </div>
                    {index < incomeSourceData.length - 1 && (
                      <div className="border-b border-[#262626]" />
                    )}
                  </div>
                ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Yearly Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Yearly Comparison</CardTitle>
            <CardDescription>Track your financial growth over the years</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyComparison}>
                <XAxis dataKey="year" stroke="#737373" fontSize={12} />
                <YAxis stroke="#737373" fontSize={12} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e5e5',
                    borderRadius: '12px',
                    padding: '12px',
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#22c55e"
                  strokeWidth={3}
                  name="Income"
                  dot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Expenses"
                  dot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        </>
        )}
      </div>
    </DashboardLayout>
  );
}
