'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, Building, CreditCard, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api-client';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (account: any) => void;
}

interface AccountFormData {
  name: string;
  type: 'CASH' | 'BANK' | 'CREDIT_CARD' | 'INVESTMENT';
  balance: string;
  currency: string;
  description: string;
}

const accountTypes = [
  { value: 'CASH', label: 'Cash', icon: Wallet, color: '#22c55e' },
  { value: 'BANK', label: 'Bank Account', icon: Building, color: '#3b82f6' },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard, color: '#8b5cf6' },
  { value: 'INVESTMENT', label: 'Investment', icon: TrendingUp, color: '#f59e0b' },
];

export function AccountModal({ isOpen, onClose, onSave }: AccountModalProps) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    type: 'BANK',
    balance: '0',
    currency: 'IDR',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ensure component is mounted (for portal)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Account name is required');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.accounts.create({
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance) || 0,
        currency: formData.currency,
        description: formData.description || undefined,
      });

      onSave?.(response.data);
      resetForm();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account');
      console.error('Account creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'BANK',
      balance: '0',
      currency: 'IDR',
      description: '',
    });
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedAccountType = accountTypes.find(t => t.value === formData.type);

  // Don't render on server or if not mounted
  if (!mounted || typeof window === 'undefined') {
    return null;
  }

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with VERY HIGH z-index */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm overflow-y-auto"
            style={{ zIndex: 99999 }}
          >
            {/* Centering Container */}
            <div className="min-h-full flex items-center justify-center p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0a0a0a] rounded-3xl shadow-2xl w-full max-w-lg border border-[#262626] my-4 relative"
              >
                {/* Header */}
                <div className="p-6 border-b border-[#262626] flex items-center justify-between bg-[#0a0a0a] rounded-t-3xl">
                  <div>
                    <h3 className="text-xl font-bold font-mono text-[#0066ff]">
                      Add Account
                    </h3>
                    <p className="text-sm text-zinc-400">
                      Create a new financial account
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 rounded-xl hover:bg-[#1a1a1a] transition-colors"
                  >
                    <X className="w-5 h-5 text-zinc-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-sm text-red-500">{error}</p>
                    </div>
                  )}

                  {/* Account Type */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-zinc-400">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {accountTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: type.value as any })}
                            className={cn(
                              'flex items-center gap-3 p-4 rounded-xl border transition-all duration-200',
                              formData.type === type.value
                                ? 'border-[#0066ff] bg-[#0066ff]/10'
                                : 'border-zinc-700 hover:bg-[#1a1a1a]'
                            )}
                          >
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ 
                                backgroundColor: formData.type === type.value 
                                  ? `${type.color}20` 
                                  : '#1a1a1a' 
                              }}
                            >
                              <Icon 
                                className="w-5 h-5" 
                                style={{ 
                                  color: formData.type === type.value 
                                    ? type.color 
                                    : '#71717a' 
                                }} 
                              />
                            </div>
                            <span className={cn(
                              'text-sm font-medium',
                              formData.type === type.value ? 'text-white' : 'text-zinc-400'
                            )}>
                              {type.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Account Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-400">
                      Account Name *
                    </label>
                    <Input
                      placeholder="e.g., My Savings Account"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  {/* Initial Balance */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-400">
                      Initial Balance
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold font-mono text-zinc-500">
                        {formData.currency === 'IDR' ? 'Rp' : '$'}
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.balance}
                        onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                        className="pl-12 text-lg font-mono"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Currency */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-400">
                      Currency
                    </label>
                    <Select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      options={[
                        { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
                        { value: 'USD', label: 'USD - US Dollar' },
                        { value: 'EUR', label: 'EUR - Euro' },
                        { value: 'GBP', label: 'GBP - British Pound' },
                      ]}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-400">
                      Description (Optional)
                    </label>
                    <textarea
                      placeholder="Add notes about this account..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0066ff] min-h-[80px] resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth
                      onClick={handleClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      disabled={isSubmitting}
                      leftIcon={selectedAccountType && <selectedAccountType.icon className="w-4 h-4" />}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Render modal in document body portal
  return createPortal(modalContent, document.body);
}
