'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { TransactionModal } from '@/components/ui/TransactionModal';
import { Button } from '@/components/ui/Button';
import { CashFlowChart } from '@/components/dashboard/CashFlowChart';
import { ExpenseByCategoryChart } from '@/components/dashboard/ExpenseByCategoryChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { BudgetProgress } from '@/components/dashboard/BudgetProgress';
import { FinancialGoals } from '@/components/dashboard/FinancialGoals';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth.store';
import { api } from '@/lib/api-client';

// === Types ===
interface Transaction {
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

// === Helper untuk bulan ===
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardPage() {
  const { token } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [defaultType, setDefaultType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // === Filter Month/Year ===
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Wait for Zustand store to hydrate
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  // === Date range untuk STATS (bulan yang dipilih) ===
  const statsStartDate = React.useMemo(() => {
    return new Date(selectedYear, selectedMonth, 1);
  }, [selectedYear, selectedMonth]);
  
  const statsEndDate = React.useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
  }, [selectedYear, selectedMonth]);

  // === Date range untuk TRANSACTIONS (6 bulan terakhir untuk grafik) ===
  const transactionsStartDate = React.useMemo(() => {
    return new Date(selectedYear, selectedMonth - 5, 1);
  }, [selectedYear, selectedMonth]);
  
  const transactionsEndDate = React.useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
  }, [selectedYear, selectedMonth]);

  // === Fetch Transactions & Stats secara parallel ===
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchTransactionsAndStats = async () => {
      // Wait for hydration before checking token
      if (!isHydrated) return;

      try {
        setLoading(true);
        
        if (!token) {
          if (process.env.NODE_ENV === 'development') {
            console.error('❌ No token found - redirecting to login');
          }
          window.location.href = '/login';
          return;
        }

        const [txResponse, statsResponse] = await Promise.all([
          api.transactions.getAll(),
          api.transactions.getStats({
            startDate: statsStartDate.toISOString(),
            endDate: statsEndDate.toISOString()
          })
        ]);

        setTransactions(txResponse.data);
        setStats(statsResponse.data);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching data:', error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTransactionsAndStats();
  }, [selectedMonth, selectedYear, refreshKey, token, isHydrated, statsStartDate, statsEndDate]);

  // === Handle Tambah Transaksi ===
  const handleAddTransaction = (type: 'income' | 'expense' | 'transfer') => {
    setDefaultType(type);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async () => {
    setRefreshKey(prev => prev + 1);
    setIsModalOpen(false);
  };

  // === Budget & Goals ===
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  React.useEffect(() => {
    const fetchBudgetsAndGoals = async () => {
      // Wait for hydration before checking token
      if (!isHydrated || !token) return;
      
      try {
        const budgetRes = await api.budgets.getAll();
        const data = budgetRes.data;
        
        // Map budget data to match BudgetProgress component interface
        const mappedBudgets = data.slice(0, 4).map((budget: any) => ({
          id: budget.id.toString(),
          category: budget.category?.name || 'Unknown',
          limit: Number(budget.amount),
          spent: Number(budget.spending || 0),
          color: budget.category?.color || '#6b7280',
        }));
        
        setBudgets(mappedBudgets);
        
        const goalRes = await api.goals.getAll();
        setGoals(goalRes.data.slice(0, 3));
      } catch (error) {
        // Silently fail or handle error
      }
    };
    fetchBudgetsAndGoals();
  }, [token, isHydrated]);

  // === Cash Flow Data (6 bulan terakhir dari bulan yang dipilih) ===
  const cashFlowData = React.useMemo(() => {
    const data = Array.from({ length: 6 }).map((_, i) => {
      const date = new Date(selectedYear, selectedMonth - (5 - i), 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      
      const monthTxs = transactions.filter((tx) => {
        const txDate = new Date(tx.transactionDate);
        return txDate >= monthStart && txDate <= monthEnd;
      });
      
      const income = monthTxs
        .filter((tx) => tx.type === 'INCOME')
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
      
      const expense = monthTxs
        .filter((tx) => tx.type === 'EXPENSE')
        .reduce((sum, tx) => sum + Number(tx.amount), 0);
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income,
        expense,
      };
    });
    
    return data;
  }, [transactions, selectedMonth, selectedYear]);

  // === Expense by Category (Top 5 + Lainnya) - HANYA untuk bulan yang dipilih ===
  const expenseByCategory = React.useMemo(() => {
    // Filter transaksi hanya untuk bulan dan tahun yang dipilih
    const monthTransactions = transactions.filter((tx) => {
      if (tx.type !== 'EXPENSE') return false;
      
      const txDate = new Date(tx.transactionDate);
      return txDate >= statsStartDate && txDate <= statsEndDate;
    });

    // Group by category
    const grouped = monthTransactions.reduce((acc, tx) => {
      const name = tx.category?.name?.trim() || 'Other';
      const existing = acc.find((item) => item.name === name);
      const amount = Number(tx.amount) || 0;
      
      if (existing) {
        existing.value += amount;
      } else {
        acc.push({
          name,
          value: amount,
          color: tx.category?.color || '#6b7280',
        });
      }
      return acc;
    }, [] as { name: string; value: number; color: string }[]);

    const sorted = [...grouped].sort((a, b) => b.value - a.value);
    const top5 = sorted.slice(0, 5);
    const otherTotal = sorted.slice(5).reduce((sum, item) => sum + item.value, 0);

    const finalData = [...top5];
    if (otherTotal > 0) {
      finalData.push({
        name: 'Lainnya',
        value: otherTotal,
        color: '#9CA3AF',
      });
    }

    return finalData;
  }, [transactions, selectedMonth, selectedYear, statsStartDate, statsEndDate]);

  // === Recent Transactions (hanya income/expense) ===
  const recentTransactions = transactions
    .filter((tx: { type: string }) => tx.type === 'INCOME' || tx.type === 'EXPENSE')
    .slice(0, 5)
    .map((tx: { id: number; description: string; type: string; amount: number; category?: { name: string }; transactionDate: string; account?: { name: string } }) => ({
      id: String(tx.id),
      description: tx.description,
      amount: tx.type === 'INCOME' ? tx.amount : -tx.amount,
      type: tx.type.toLowerCase() as 'income' | 'expense',
      category: tx.category?.name || 'Other',
      date: tx.transactionDate,
      account: tx.account?.name || 'Account',
    }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0066ff]">
              Dashboard
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Welcome back! Financial status for {monthNames[selectedMonth]} {selectedYear}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="h-10 px-3 rounded-lg border border-zinc-700 bg-[#1a1a1a] text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0066ff] focus:border-[#0066ff]"
            >
              {monthNames.map((m, i) => (
                <option key={i} value={i} className="bg-[#1a1a1a]">{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="h-10 px-3 rounded-lg border border-zinc-700 bg-[#1a1a1a] text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#0066ff] focus:border-[#0066ff]"
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const y = new Date().getFullYear() - i;
                return <option key={y} value={y} className="bg-[#1a1a1a]">{y}</option>;
              })}
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Balance" value={formatCurrency(stats.balance)} icon={Wallet} iconColor="text-blue-600" />
          <StatCard title="Monthly Income" value={formatCurrency(stats.income)} icon={TrendingUp} iconColor="text-green-600" />
          <StatCard title="Monthly Expenses" value={formatCurrency(stats.expenses)} icon={TrendingDown} iconColor="text-red-600" />
          <StatCard title="Transactions" value={`${stats.transactionCount}`} icon={PiggyBank} iconColor="text-purple-600" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CashFlowChart data={cashFlowData} />
          <ExpenseByCategoryChart data={expenseByCategory.length > 0 ? expenseByCategory : [{ name: 'Tidak ada data', value: 0, color: '#6b7280' }]} />
        </div>

        {/* Recent Transactions & Budget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading ? <div className="text-center py-8">Loading...</div> : <RecentTransactions transactions={recentTransactions} />}
          </div>
          <div>
            <BudgetProgress budgets={budgets} />
          </div>
        </div>

        {/* Goals */}
        <FinancialGoals goals={goals} />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" leftIcon={<ArrowDownLeft className="w-4 h-4" />} onClick={() => handleAddTransaction('income')}>
            Add Income
          </Button>
          <Button variant="danger" leftIcon={<ArrowUpRight className="w-4 h-4" />} onClick={() => handleAddTransaction('expense')}>
            Add Expense
          </Button>
          <Button variant="outline" onClick={() => handleAddTransaction('transfer')}>
            Add Transfer
          </Button>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType={defaultType}
        onSave={handleSaveTransaction}
      />
    </DashboardLayout>
  );
}