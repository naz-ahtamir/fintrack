'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, Wallet, CreditCard, Building, PiggyBank, TrendingUp, MoreVertical } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/store/auth.store';

interface Account {
  id: number;
  name: string;
  balance: number;
  currency: string;
  userId: number;
  accountTypeId: number;
  accountType: {
    id: number;
    name: string;
  };
}

export default function AccountsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  // Fetch accounts from database
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await api.accounts.getAll();
        setAccounts(response.data);
      } catch (error) {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAccounts();
    }
  }, [token]);

  // Map account type to icon
  const getAccountIcon = (typeName: string) => {
    const typeMap: Record<string, any> = {
      'CASH': Wallet,
      'BANK': Building,
      'CREDIT_CARD': CreditCard,
      'INVESTMENT': TrendingUp,
    };
    return typeMap[typeName] || Wallet;
  };

  // Map account type to color
  const getAccountColor = (typeName: string) => {
    const colorMap: Record<string, string> = {
      'CASH': '#22c55e',
      'BANK': '#3b82f6',
      'CREDIT_CARD': '#8b5cf6',
      'INVESTMENT': '#f59e0b',
    };
    return colorMap[typeName] || '#6b7280';
  };

  // Map account type to label
  const getAccountTypeLabel = (typeName: string) => {
    const labelMap: Record<string, string> = {
      'CASH': 'Cash',
      'BANK': 'Bank Account',
      'CREDIT_CARD': 'Credit Card',
      'INVESTMENT': 'Investment',
    };
    return labelMap[typeName] || typeName;
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalAssets = accounts.filter(a => Number(a.balance) > 0).reduce((sum, acc) => sum + Number(acc.balance), 0);
  const totalLiabilities = Math.abs(accounts.filter(a => Number(a.balance) < 0).reduce((sum, acc) => sum + Number(acc.balance), 0));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono text-[#0066ff] mb-2">
              Accounts
            </h1>
            <p className="text-zinc-400">
              Manage your financial accounts and track balances
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Account
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Net Worth
                </p>
                <p className="text-2xl font-bold font-mono text-white">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#0066ff]/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[#0066ff]" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Total Assets
                </p>
                <p className="text-2xl font-bold font-mono text-[#10b981]">
                  {formatCurrency(totalAssets)}
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
                  Total Liabilities
                </p>
                <p className="text-2xl font-bold font-mono text-[#ef4444]">
                  {formatCurrency(totalLiabilities)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#ef4444]/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#ef4444]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Accounts Grid */}
        {loading ? (
          <Card>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-zinc-400 font-mono">Loading accounts...</p>
              </div>
            </CardContent>
          </Card>
        ) : accounts.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={<Wallet className="w-12 h-12" />}
                title="No accounts yet"
                description="Add your first account to start tracking your finances"
                action={
                  <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    Add Your First Account
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accounts.map((account, index) => {
              const Icon = getAccountIcon(account.accountType.name);
              const color = getAccountColor(account.accountType.name);
              const balance = Number(account.balance);
              
              return (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card hover className="group">
                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <Icon className="w-6 h-6" style={{ color }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-white">
                                {account.name}
                              </h3>
                            </div>
                            <p className="text-sm text-zinc-400">
                              {getAccountTypeLabel(account.accountType.name)}
                            </p>
                          </div>
                        </div>
                        <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4 text-zinc-500" />
                        </button>
                      </div>

                      {/* Balance */}
                      <div className="mb-4">
                        <p className="text-sm text-zinc-400 mb-1">
                          Current Balance
                        </p>
                        <p
                          className={cn(
                            'text-3xl font-bold font-mono',
                            balance >= 0
                              ? 'text-white'
                              : 'text-[#ef4444]'
                          )}
                        >
                          {formatCurrency(balance)}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="flex items-center justify-between pt-4 border-t border-[#262626]">
                        <div>
                          <p className="text-xs text-zinc-400 mb-1">
                            Currency
                          </p>
                          <p className="text-sm font-medium text-white">
                            {account.currency}
                          </p>
                        </div>
                        <Badge variant="neutral" size="sm">
                          {getAccountTypeLabel(account.accountType.name)}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Account Distribution */}
        {!loading && accounts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Account Distribution</CardTitle>
              <CardDescription>
                Overview of your assets across different accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.filter(a => Number(a.balance) > 0).map((account) => {
                  const balance = Number(account.balance);
                  const percentage = (balance / totalAssets) * 100;
                  const color = getAccountColor(account.accountType.name);
                  
                  return (
                    <div key={account.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-medium text-white">
                            {account.name}
                          </span>
                        </div>
                        <span className="text-sm text-zinc-400">
                          {formatCurrency(balance)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="relative h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
