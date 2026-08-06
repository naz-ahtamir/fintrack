'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TransactionModal } from '@/components/ui/TransactionModal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, Search, Filter, Download, ArrowUpRight, ArrowDownLeft, MoreVertical } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { api } from '@/lib/api-client';


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

export default function TransactionsPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [defaultType, setDefaultType] = React.useState<'income' | 'expense' | 'transfer'>('expense');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState('all');
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = React.useState(
  firstDayOfMonth.toISOString().split('T')[0] // format YYYY-MM-DD
  );
  const [endDate, setEndDate] = React.useState(
    lastDayOfMonth.toISOString().split('T')[0]
  );
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

// Fetch transactions when component mounts or when month/year/refreshKey changes
React.useEffect(() => {
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // 👇 KIRIM PARAMETER TANGGAL!
      const response = await api.transactions.getAll({
        startDate: startDate, // <-- KIRIM TANGGAL MULAI
        endDate: endDate,     // <-- KIRIM TANGGAL AKHIR
      });
      setTransactions(response.data);
    } catch (error) {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  fetchTransactions();
}, [startDate, endDate, refreshKey]); // <-- DEPENDENSI BARU!

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || tx.type.toLowerCase() === filterType;
    return matchesSearch && matchesFilter;
  });

const stats = {
  totalIncome: transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0), // <-- Number()
  totalExpense: transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0), // <-- Number()
  netCashFlow: transactions
    .filter(t => t.type !== 'TRANSFER')
    .reduce((sum, t) => sum + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount)), 0), // <-- Number()
};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono text-[#0066ff] mb-2">
              Transactions
            </h1>
            <p className="text-zinc-400">
              Track and manage all your financial transactions for all months
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Transaction
          </Button>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-400">Dari:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-700 bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
          />
          <span className="text-sm font-medium text-zinc-400">Sampai:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-zinc-700 bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-[#0066ff]"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Total Income
                </p>
                <p className="text-2xl font-bold font-mono text-[#10b981]">
                  {formatCurrency(stats.totalIncome)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                <ArrowDownLeft className="w-6 h-6 text-[#10b981]" />
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
                  {formatCurrency(stats.totalExpense)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#ef4444]/10 flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-[#ef4444]" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Net Cash Flow
                </p>
                <p className={cn(
                  "text-2xl font-bold font-mono",
                  stats.netCashFlow >= 0
                    ? "text-[#10b981]"
                    : "text-[#ef4444]"
                )}>
                  {formatCurrency(stats.netCashFlow)}
                </p>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                stats.netCashFlow >= 0
                  ? "bg-[#10b981]/10"
                  : "bg-[#ef4444]/10"
              )}>
                {stats.netCashFlow >= 0 ? (
                  <ArrowDownLeft className="w-6 h-6 text-[#10b981]" />
                ) : (
                  <ArrowUpRight className="w-6 h-6 text-[#ef4444]" />
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card padding="none">
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'income', label: 'Income' },
                  { value: 'expense', label: 'Expense' },
                ]}
              />
              <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
                More Filters
              </Button>
              <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                Export
              </Button>
            </div>
          </div>

          {/* Transactions Table */}
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <p className="text-zinc-400 font-mono">Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <EmptyState
                icon={<Search className="w-12 h-12" />}
                title="No transactions found"
                description="Try adjusting your search or filters"
                action={
                  <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    Add Your First Transaction
                  </Button>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center',
                                transaction.type === 'INCOME'
                                  ? 'bg-[#10b981]/10'
                                  : 'bg-[#ef4444]/10'
                              )}
                            >
                              {transaction.type === 'INCOME' ? (
                                <ArrowDownLeft className="w-5 h-5 text-[#10b981]" />
                              ) : (
                                <ArrowUpRight className="w-5 h-5 text-[#ef4444]" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {transaction.description}
                              </p>
                              <p className="text-sm text-zinc-400">
                                {transaction.type}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="neutral"
                            style={{ backgroundColor: `${transaction.category?.color || '#6b7280'}20`, color: transaction.category?.color || '#6b7280' }}
                          >
                            {transaction.category?.name || 'Other'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-zinc-300">
                            {transaction.account?.name || 'Account'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-zinc-400">
                            {formatDate(transaction.transactionDate)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="success" size="sm">
                            completed
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              'font-semibold font-mono',
                              transaction.type === 'INCOME'
                                ? 'text-[#10b981]'
                                : 'text-white'
                            )}
                          >
                            {transaction.type === 'INCOME' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4 text-zinc-500" />
                          </button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultType={defaultType}
        onSave={(transaction) => {
          setRefreshKey(prev => prev + 1);
          setIsModalOpen(false);
        }}
      />
    </DashboardLayout>
  );
}
