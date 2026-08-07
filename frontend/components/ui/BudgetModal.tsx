'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PiggyBank, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (budget: BudgetFormData) => void;
}

export interface BudgetFormData {
  category: string;
  limitAmount: string;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
}

const categories = [
  { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#ef4444' },
  { id: 'transportation', name: 'Transportation', icon: '🚗', color: '#f97316' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#ec4899' },
  { id: 'utilities', name: 'Utilities', icon: '⚡', color: '#f59e0b' },
  { id: 'housing', name: 'Housing', icon: '🏠', color: '#3b82f6' },
  { id: 'healthcare', name: 'Healthcare', icon: '⚕️', color: '#10b981' },
  { id: 'other', name: 'Other', icon: '📦', color: '#6b7280' },
];

export function BudgetModal({ isOpen, onClose, onSave }: BudgetModalProps) {
  const [formData, setFormData] = useState<BudgetFormData>({
    category: categories[0].id,
    limitAmount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  });

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.limitAmount && formData.category) {
      onSave?.(formData);
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      category: categories[0].id,
      limitAmount: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    });
  };

  const currentCategory = categories.find(c => c.id === formData.category);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-800"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-900 z-10">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    Create Budget
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Set spending limits for a category
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Category Dropdown */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Category
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCategoryDropdown(!showCategoryDropdown);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{currentCategory?.icon}</span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {currentCategory?.name || 'Select Category'}
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    </button>

                    {/* Category Dropdown */}
                    {showCategoryDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden max-h-64 overflow-y-auto"
                      >
                        <div className="p-2">
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({ ...formData, category: category.id });
                                setShowCategoryDropdown(false);
                              }}
                              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                              <span className="text-xl">{category.icon}</span>
                              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                {category.name}
                              </span>
                              {formData.category === category.id && (
                                <div className="ml-auto">
                                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Limit Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Budget Limit
                  </label>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-neutral-500 dark:text-neutral-400">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.limitAmount}
                      onChange={(e) => setFormData({ ...formData, limitAmount: e.target.value })}
                      className="pl-10 text-2xl font-bold"
                      inputMode="decimal"
                    />
                  </div>
                </div>

                {/* Period */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Period
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['monthly', 'yearly'] as const).map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, period });
                        }}
                        className={cn(
                          'flex items-center justify-center p-3 rounded-xl border transition-all duration-200',
                          formData.period === period
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        )}
                      >
                        <span className="text-sm font-medium">{period.charAt(0).toUpperCase() + period.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Start Date
                    </label>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      End Date
                    </label>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="mt-4"
                  leftIcon={<PiggyBank className="w-4 h-4" />}
                >
                  Create Budget
                </Button>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
