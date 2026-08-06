'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import {
  Bell,
  Lock,
  Globe,
  Moon,
  Sun,
  Shield,
  Download,
  Smartphone,
  Mail,
  Check,
} from 'lucide-react';
import { useTheme } from '@/lib/providers/ThemeProvider';
import { api } from '@/lib/api-client';
import { ChangePasswordModal } from '@/components/ui/ChangePasswordModal';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Notification Settings
  const [notifications, setNotifications] = useState({
    email: true, // UI only - not persisted to DB yet
    push: true, // UI only - not persisted to DB yet
    transactions: true,
    budgetAlerts: true, // Maps to budgetNotification
    goalUpdates: true,
    monthlyReports: true, // UI only - not persisted to DB yet
  });

  // Security Settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Load settings from database on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const response = await api.users.getSettings();
        const settings = response.data;
        
        // Map database settings to state
        setNotifications({
          email: true, // UI only - future feature
          push: true, // UI only - future feature
          transactions: settings.transactionNotification ?? true,
          budgetAlerts: settings.budgetNotification !== 'NEVER', // Convert frequency to boolean
          goalUpdates: settings.goalNotification ?? true,
          monthlyReports: true, // UI only - future feature
        });
      } catch (error) {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSaveNotifications = async () => {
    try {
      setIsSaving(true);
      await api.users.updateSettings({
        transactionNotification: notifications.transactions,
        goalNotification: notifications.goalUpdates,
        budgetNotification: notifications.budgetAlerts ? 'WEEKLY' : 'NEVER',
      });
      setSuccessMessage('Notification preferences updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setSuccessMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold font-mono text-[#0066ff] mb-2">
            Settings
          </h1>
          <p className="text-zinc-400">
            Manage your application preferences and security settings
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {isLoading ? (
          <Card>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how FinTrack looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-neutral-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-neutral-400" />
                  )}
                  <div>
                    <p className="font-medium text-white">
                      Theme
                    </p>
                    <p className="text-sm text-zinc-400">
                      Choose between light and dark mode
                    </p>
                  </div>
                </div>
                <Button
                  variant={theme === 'dark' ? 'primary' : 'outline'}
                  onClick={toggleTheme}
                  leftIcon={theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                >
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </Button>
              </div>

              <div className="border-t border-[#262626] pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-zinc-500" />
                    <div>
                      <p className="font-medium text-white">
                        Language
                      </p>
                      <p className="text-sm text-zinc-400">
                        Select your preferred language
                      </p>
                    </div>
                  </div>
                  <Select
                    value="en"
                    onChange={() => {}}
                    options={[
                      { value: 'en', label: 'English' },
                      { value: 'es', label: 'Español' },
                      { value: 'fr', label: 'Français' },
                      { value: 'de', label: 'Deutsch' },
                    ]}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveNotifications}
                isLoading={isSaving}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Notification Channels */}
              <div>
                <h4 className="font-medium text-white mb-4">
                  Notification Channels
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-medium text-white">
                          Email Notifications
                        </p>
                        <p className="text-sm text-zinc-400">
                          Receive notifications via email
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) =>
                          setNotifications({ ...notifications, email: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-neutral-400" />
                      <div>
                        <p className="font-medium text-white">
                          Push Notifications
                        </p>
                        <p className="text-sm text-zinc-400">
                          Receive push notifications on your device
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) =>
                          setNotifications({ ...notifications, push: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Notification Types */}
              <div className="border-t border-[#262626] pt-6">
                <h4 className="font-medium text-white mb-4">
                  What to Notify
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        Transaction Alerts
                      </p>
                      <p className="text-sm text-zinc-400">
                        Get notified about new transactions
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.transactions}
                        onChange={(e) =>
                          setNotifications({ ...notifications, transactions: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        Budget Alerts
                      </p>
                      <p className="text-sm text-zinc-400">
                        Alerts when approaching budget limits
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.budgetAlerts}
                        onChange={(e) =>
                          setNotifications({ ...notifications, budgetAlerts: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        Goal Updates
                      </p>
                      <p className="text-sm text-zinc-400">
                        Progress updates on financial goals
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.goalUpdates}
                        onChange={(e) =>
                          setNotifications({ ...notifications, goalUpdates: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">
                        Monthly Reports
                      </p>
                      <p className="text-sm text-zinc-400">
                        Monthly financial summary reports
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.monthlyReports}
                        onChange={(e) =>
                          setNotifications({ ...notifications, monthlyReports: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-neutral-400" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        Two-Factor Authentication
                      </p>
                      {twoFactorEnabled && (
                        <Badge variant="success" size="sm">Enabled</Badge>
                      )}
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <Button
                  variant={twoFactorEnabled ? 'outline' : 'primary'}
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                >
                  {twoFactorEnabled ? 'Disable' : 'Enable'}
                </Button>
              </div>

              <div className="border-t border-[#262626] pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-zinc-500" />
                    <div>
                      <p className="font-medium text-white">
                        Change Password
                      </p>
                      <p className="text-sm text-zinc-400">
                        Update your account password
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setIsPasswordModalOpen(true)}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>Manage your data and privacy preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-[#262626] rounded-xl">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="font-medium text-white">
                      Export Your Data
                    </p>
                    <p className="text-sm text-zinc-400">
                      Download all your financial data
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Export</Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-[#262626] rounded-xl">
                <div>
                  <p className="font-medium text-white">
                    Data Retention
                  </p>
                  <p className="text-sm text-zinc-400">
                    How long we keep your data
                  </p>
                </div>
                <span className="text-sm font-medium text-zinc-300">
                  Indefinitely
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        </>
        )}
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </DashboardLayout>
  );
}
