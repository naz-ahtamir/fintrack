'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Input } from './Input';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (goal: GoalFormData) => void;
}

export interface GoalFormData {
  name: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
  category: string;
}

const goalCategories = [
  { id: 'savings', name: 'Savings', icon: '💰', color: '#3b82f6' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#8b5cf6' },
  { id: 'electronics', name: 'Electronics', icon: '💻', color: '#22c55e' },
  { id: 'real-estate', name: 'Real Estate', icon: '🏠', color: '#f59e0b' },
  { id: 'education', name: 'Education', icon: '📚', color: '#3b82f6' },
  { id: 'car', name: 'Car', icon: '🚗', color: '#f97316' },
  { id: 'investment', name: 'Investment', icon: '📈', color: '#10b981' },
  { id: 'other', name: 'Other', icon: '🎯', color: '#6b7280' },
];

export function GoalModal({ isOpen, onClose, onSave }: GoalModalProps) {
  const [formData, setFormData] = useState<GoalFormData>({
    name: '',
    description: '',
    targetAmount: '',
    currentAmount: '0',
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    category: goalCategories[0].id,
  });

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.targetAmount) {
      onSave?.(formData);
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      targetAmount: '',
      currentAmount: '0',
      targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      category: goalCategories[0].id,
    });
  };

  const currentCategory = goalCategories.find(c => c.id === formData.category);

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
              className="bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-neutral-200 dark:border-neutral-800"
            >
              {/* Header */}
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-900 z-10">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    Create Financial Goal
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Set a target and start saving
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
                {/* Goal Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Goal Name
                  </label>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Input
                      placeholder="e.g., Emergency Fund, New Car, Vacation"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Description (Optional)
                  </label>
                  <div onClick={(e) => e.stopPropagation()}>
                    <textarea
                      placeholder="Add more details about your goal..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>

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
                          {goalCategories.map((category) => (
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

                {/* Target Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Target Amount
                  </label>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-semibold text-neutral-500 dark:text-neutral-400">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.targetAmount}
                      onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                      className="pl-10 text-2xl font-bold"
                      inputMode="decimal"
                    />
                  </div>
                </div>

                {/* Current Amount */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Current Amount
                  </label>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-neutral-500 dark:text-neutral-400">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.currentAmount}
                      onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                      className="pl-10"
                      inputMode="decimal"
                    />
                  </div>
                </div>

                {/* Target Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Target Date
                  </label>
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="mt-4"
                  leftIcon={<Target className="w-4 h-4" />}
                >
                  Create Goal
                </Button>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
