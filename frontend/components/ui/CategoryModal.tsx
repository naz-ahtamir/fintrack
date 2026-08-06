'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Input } from './Input';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (category: CategoryFormData) => void;
}

export interface CategoryFormData {
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
}

const iconOptions = [
  '💰', '💵', '💳', '🏦', '💼', '💻', '📱', '🎮', '🎬', '🎵',
  '🍔', '🍕', '☕', '🍺', '🛒', '🛍️', '👕', '👟', '🏠', '🚗',
  '✈️', '🚆', '🚕', '⛽', '🏥', '💊', '📚', '✏️', '⚡', '💡',
  '📺', '🎯', '🎪', '🎨', '🏋️', '⚽', '🎾', '🏀', '📊', '📈',
];

const colorOptions = [
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f97316', // Orange
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#6b7280', // Gray
];

export function CategoryModal({ isOpen, onClose, onSave }: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    type: 'expense',
    icon: iconOptions[0],
    color: colorOptions[0],
  });

  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      onSave?.(formData);
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      icon: iconOptions[0],
      color: colorOptions[0],
    });
  };

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
                    Add Category
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Create a new category for your transactions
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
                {/* Category Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Category Name
                  </label>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Input
                      placeholder="e.g., Groceries, Rent, Salary"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                {/* Category Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Category Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['income', 'expense'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, type });
                        }}
                        className={cn(
                          'flex items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200',
                          formData.type === type
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                        )}
                      >
                        {type === 'income' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Picker */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Icon
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowIconPicker(!showIconPicker);
                        setShowColorPicker(false);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{formData.icon}</span>
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          Selected Icon
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    </button>

                    {/* Icon Picker Dropdown */}
                    {showIconPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden max-h-64 overflow-y-auto"
                      >
                        <div className="p-3 grid grid-cols-8 gap-2">
                          {iconOptions.map((icon) => (
                            <button
                              key={icon}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({ ...formData, icon });
                                setShowIconPicker(false);
                              }}
                              className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center text-2xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors',
                                formData.icon === icon && 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500'
                              )}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Color Picker */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Color
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowColorPicker(!showColorPicker);
                        setShowIconPicker(false);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg"
                          style={{ backgroundColor: formData.color }}
                        />
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          Selected Color
                        </span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    </button>

                    {/* Color Picker Dropdown */}
                    {showColorPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                      >
                        <div className="p-3 grid grid-cols-5 gap-2">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormData({ ...formData, color });
                                setShowColorPicker(false);
                              }}
                              className={cn(
                                'w-12 h-12 rounded-lg transition-transform hover:scale-110',
                                formData.color === color && 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                              )}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Preview */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl">
                  <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-3">
                    Preview
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${formData.color}20` }}
                    >
                      {formData.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {formData.name || 'Category Name'}
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {formData.type === 'income' ? 'Income' : 'Expense'}
                      </p>
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
                  leftIcon={<Tag className="w-4 h-4" />}
                >
                  Create Category
                </Button>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
