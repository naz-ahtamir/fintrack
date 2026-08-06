import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down';
  isLoading?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-blue-600',
  trend,
  isLoading,
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-[#1a1a1a] rounded w-1/2" />
          <div className="h-8 bg-[#1a1a1a] rounded w-3/4" />
          <div className="h-3 bg-[#1a1a1a] rounded w-1/3" />
        </div>
      </Card>
    );
  }

  // Tentukan warna berdasarkan tipe stat
  const isIncome = title.toLowerCase().includes('income');
  const isExpense = title.toLowerCase().includes('expense');
  
  let valueColor = 'text-white';
  if (isIncome) valueColor = 'text-[#10b981]'; // Hijau untuk income
  if (isExpense) valueColor = 'text-[#ef4444]'; // Merah untuk expense

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card hover className="group">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3">
              {title}
            </p>
            <p className={cn("text-3xl font-bold mb-2 font-mono tracking-tight", valueColor)}>
              {typeof value === 'number' ? formatCurrency(value) : value}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'text-sm font-semibold',
                    trend === 'up'
                      ? 'text-[#10b981]'
                      : trend === 'down'
                      ? 'text-[#ef4444]'
                      : 'text-zinc-400'
                  )}
                >
                  {formatPercentage(change)}
                </span>
                {changeLabel && (
                  <span className="text-xs text-zinc-500">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              'p-2.5 rounded-lg bg-opacity-10',
              iconColor.replace('text-', 'bg-'),
              'group-hover:scale-105 transition-transform duration-150'
            )}
          >
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
