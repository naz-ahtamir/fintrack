'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, Plus, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { cn, getInitials, getAvatarColor } from '@/lib/utils';
import { Button } from '../ui/Button';
import { TransactionModal } from '../ui/TransactionModal';
import { useAuthStore } from '@/lib/store/auth.store';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
  };
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const { clearAuth } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const handleSignOut = () => {
    clearAuth();
    localStorage.removeItem('auth-store');
    localStorage.removeItem('token');
    setShowUserMenu(false);
    router.push('/login');
  };

  const handleNavigateToProfile = () => {
    setShowUserMenu(false);
    router.push('/profile');
  };

  const handleNavigateToSettings = () => {
    setShowUserMenu(false);
    router.push('/settings');
  };

  const notifications = [
    {
      id: 1,
      title: 'Budget Alert',
      message: 'You have spent 80% of your dining budget',
      time: '5 minutes ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Goal Achievement',
      message: 'Congratulations! You reached your savings goal',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'New Transaction',
      message: 'Payment of $50.00 received',
      time: '2 hours ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 h-14 bg-black/50 backdrop-blur-xl border-b border-[#262626]">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full h-9 pl-9 pr-4 text-sm rounded-lg border border-[#262626] bg-[#0a0a0a] text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#0066ff] focus:border-[#0066ff] transition-all"
            />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Quick Add Button */}
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsTransactionModalOpen(true)}
          >
            New
          </Button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#0066ff] rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0a0a0a] rounded-xl shadow-2xl border border-[#262626] overflow-hidden">
                <div className="p-4 border-b border-[#262626]">
                  <h3 className="font-semibold text-white text-sm">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'p-4 border-b border-[#262626] hover:bg-[#1a1a1a] cursor-pointer transition-colors',
                        notification.unread && 'bg-[#0066ff]/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <span className="w-2 h-2 bg-[#0066ff] rounded-full mt-1 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-[#262626]">
                  <button className="text-sm text-[#0066ff] hover:text-[#0052cc] transition-colors">
                    View all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
            >
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold',
                  user ? getAvatarColor(user.name) : 'bg-gray-600'
                )}
              >
                {user ? getInitials(user.name) : 'U'}
              </div>
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0a] rounded-xl shadow-2xl border border-[#262626] overflow-hidden">
                <div className="p-3 border-b border-[#262626]">
                  <p className="font-semibold text-white text-sm">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={handleNavigateToProfile}
                    className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg hover:bg-[#1a1a1a] text-sm text-gray-300 hover:text-white transition-all"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button 
                    onClick={handleNavigateToSettings}
                    className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg hover:bg-[#1a1a1a] text-sm text-gray-300 hover:text-white transition-all"
                  >
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </button>
                  <div className="my-1 h-px bg-[#262626]" />
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm text-red-500 hover:text-red-400 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        defaultType="expense"
      />
    </header>
  );
}
