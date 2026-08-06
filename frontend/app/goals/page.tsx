'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { GoalModal } from '@/components/ui/GoalModal';
import { Plus, Target, TrendingUp, Calendar, DollarSign, Flag } from 'lucide-react';
import { formatCurrency, calculatePercentage } from '@/lib/utils';
import { api } from '@/lib/api-client';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  startDate: string;
  priority: number;
}

interface GoalWithStatus extends Goal {
  status: 'achieved' | 'on-track' | 'at-risk';
  color: string;
}

export default function GoalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [goals, setGoals] = useState<GoalWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaveGoal = async (goalData: any) => {
    try {
      // Map modal category to API category format
      const categoryMap: Record<string, string> = {
        'savings': 'Saving',
        'travel': 'Travel',
        'electronics': 'Electronics',
        'real-estate': 'Real Estate',
        'education': 'Education',
        'car': 'Car',
        'investment': 'Investment',
        'other': 'Other',
      };

      await api.goals.create({
        name: goalData.name,
        description: goalData.description || null,
        category: categoryMap[goalData.category] || 'Other',
        targetAmount: parseFloat(goalData.targetAmount),
        currentAmount: parseFloat(goalData.currentAmount) || 0,
        targetDate: new Date(goalData.targetDate).toISOString(),
        priority: 1,
      });

      // Refresh goals list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to create goal:', error);
      }
      alert('Failed to create goal. Please try again.');
    }
  };

  // Fetch goals from database
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        setIsLoading(true);
        const response = await api.goals.getAll();
        const fetchedGoals = response.data;

        // Calculate status and color for each goal
        const goalsWithStatus: GoalWithStatus[] = fetchedGoals.map((goal: Goal) => {
          const currentAmount = Number(goal.currentAmount);
          const targetAmount = Number(goal.targetAmount);
          const percentage = (currentAmount / targetAmount) * 100;
          
          const now = new Date();
          const targetDate = new Date(goal.targetDate);
          const startDate = new Date(goal.startDate);
          const totalDuration = targetDate.getTime() - startDate.getTime();
          const elapsed = now.getTime() - startDate.getTime();
          const timeProgress = (elapsed / totalDuration) * 100;

          // Calculate status
          let status: 'achieved' | 'on-track' | 'at-risk';
          if (percentage >= 100) {
            status = 'achieved';
          } else if (percentage >= timeProgress * 0.8) {
            // If progress is at least 80% of expected time-based progress
            status = 'on-track';
          } else {
            status = 'at-risk';
          }

          // Assign color based on category
          const categoryColors: Record<string, string> = {
            'Saving': '#3b82f6',
            'Travel': '#8b5cf6',
            'Electronics': '#22c55e',
            'Real Estate': '#f59e0b',
            'Education': '#06b6d4',
            'Investment': '#ef4444',
          };
          const color = categoryColors[goal.category] || '#6b7280';

          return {
            ...goal,
            status,
            color,
            currentAmount,
            targetAmount,
          };
        });

        setGoals(goalsWithStatus);
      } catch (error) {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, [refreshKey]);

  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const achievedGoals = goals.filter(g => g.status === 'achieved').length;
  const activeGoals = goals.filter(g => g.status !== 'achieved').length;

  const getDaysRemaining = (targetDate: string) => {
    const days = Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'achieved':
        return <Badge variant="success" size="sm" dot>Achieved</Badge>;
      case 'on-track':
        return <Badge variant="info" size="sm" dot>On Track</Badge>;
      case 'at-risk':
        return <Badge variant="warning" size="sm" dot>At Risk</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono text-[#0066ff] mb-2">
              Financial Goals
            </h1>
            <p className="text-zinc-400">
              Set, track, and achieve your financial objectives
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Goal
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Total Progress
                </p>
                <p className="text-2xl font-bold font-mono text-white">
                  {calculatePercentage(totalCurrentAmount, totalTargetAmount).toFixed(0)}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#0066ff]/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-[#0066ff]" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Total Saved
                </p>
                <p className="text-2xl font-bold font-mono text-[#10b981]">
                  {formatCurrency(totalCurrentAmount)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#10b981]" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-1">
                  Active Goals
                </p>
                <p className="text-2xl font-bold font-mono text-white">
                  {activeGoals}
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
                  Completed
                </p>
                <p className="text-2xl font-bold font-mono text-[#10b981]">
                  {achievedGoals}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#10b981]/10 flex items-center justify-center">
                <Flag className="w-6 h-6 text-[#10b981]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Goals Grid */}
        {isLoading ? (
          <Card>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <p className="text-zinc-400 font-mono">Loading goals...</p>
              </div>
            </CardContent>
          </Card>
        ) : goals.length === 0 ? (
          <Card>
            <CardContent>
              <EmptyState
                icon={<Target className="w-12 h-12" />}
                title="No goals yet"
                description="Create your first financial goal to start saving"
                action={
                  <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                    Create Your First Goal
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal, index) => {
              const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
              const remaining = goal.targetAmount - goal.currentAmount;
              const daysRemaining = getDaysRemaining(goal.targetDate);

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card hover className="h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          <Target className="w-6 h-6" style={{ color: goal.color }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">
                            {goal.title}
                          </h3>
                          <p className="text-sm text-zinc-400">
                            {goal.description || goal.category}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(goal.status)}
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-zinc-400">
                          {formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}
                        </span>
                        <span className="text-sm font-semibold font-mono" style={{ color: goal.color }}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="relative h-3 bg-[#1a1a1a] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(percentage, 100)}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: goal.color }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#262626]">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="w-4 h-4 text-zinc-500" />
                          <span className="text-xs text-zinc-400">
                            Remaining
                          </span>
                        </div>
                        <p className="text-sm font-semibold font-mono text-white">
                          {formatCurrency(remaining)}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-zinc-500" />
                          <span className="text-xs text-zinc-400">
                            Deadline
                          </span>
                        </div>
                        <p className="text-sm font-semibold font-mono text-white">
                          {daysRemaining > 0
                            ? `${daysRemaining} days`
                            : goal.status === 'achieved'
                            ? 'Completed'
                            : 'Overdue'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Goal Modal */}
        <GoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveGoal}
        />
      </div>
    </DashboardLayout>
  );
}
