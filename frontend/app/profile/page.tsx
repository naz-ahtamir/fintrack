'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Camera, Save, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { cn, getInitials, getAvatarColor } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth.store';
import { api } from '@/lib/api-client';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuthStore();
  
  // State untuk statistics dari database
  const [statistics, setStatistics] = useState({
    totalTransactions: 0,
    activeAccounts: 0,
    daysActive: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const [formData, setFormData] = useState({
    name: user?.name || 'Guest',
    email: user?.email || 'guest@example.com',
    phone: '',
    location: '',
    bio: '',
    currency: 'IDR',
    language: 'Indonesian',
  });

  // Fetch real statistics dari database
  React.useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoadingStats(true);
        const response = await api.users.getStatistics();
        setStatistics(response.data);
      } catch (error) {
        // Silently fail
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStatistics();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSuccessMessage('');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSaving(false);
    setIsEditing(false);
    setSuccessMessage('Profile updated successfully!');

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold font-mono text-[#0066ff] mb-2">
            Profile
          </h1>
          <p className="text-zinc-400">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Avatar Section */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#262626]">
              <div className="relative">
                <div
                  className={cn(
                    'w-24 h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-bold',
                    getAvatarColor(formData.name)
                  )}
                >
                  {getInitials(formData.name)}
                </div>
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {formData.name}
                </h3>
                <p className="text-zinc-400 mb-3">
                  {formData.email}
                </p>
                <Button variant="outline" size="sm" leftIcon={<Camera className="w-4 h-4" />}>
                  Change Photo
                </Button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  leftIcon={<User className="w-4 h-4" />}
                  disabled={!isEditing}
                  fullWidth
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  leftIcon={<Mail className="w-4 h-4" />}
                  disabled={!isEditing}
                  fullWidth
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  leftIcon={<Phone className="w-4 h-4" />}
                  disabled={!isEditing}
                  fullWidth
                />
                <Input
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  disabled={!isEditing}
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#0066ff] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                {isEditing ? (
                  <>
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      isLoading={isSaving}
                      leftIcon={<Save className="w-4 h-4" />}
                    >
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Account Statistics</CardTitle>
            <CardDescription>Your activity summary</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-[#0066ff]/10 rounded-xl">
                  <p className="text-3xl font-bold font-mono text-[#0066ff] mb-1">
                    {statistics.totalTransactions.toLocaleString()}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Total Transactions
                  </p>
                </div>
                <div className="text-center p-4 bg-[#10b981]/10 rounded-xl">
                  <p className="text-3xl font-bold font-mono text-[#10b981] mb-1">
                    {statistics.activeAccounts}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Active Accounts
                  </p>
                </div>
                <div className="text-center p-4 bg-[#f59e0b]/10 rounded-xl">
                  <p className="text-3xl font-bold font-mono text-[#f59e0b] mb-1">
                    {statistics.daysActive}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Days Active
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Membership details and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[#262626]">
                <div>
                  <p className="font-medium text-white">
                    Member Since
                  </p>
                  <p className="text-sm text-zinc-400">
                    Your account creation date
                  </p>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Calendar className="w-4 h-4" />
                  <span>January 15, 2024</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-[#262626]">
                <div>
                  <p className="font-medium text-white">
                    Default Currency
                  </p>
                  <p className="text-sm text-zinc-400">
                    Primary currency for transactions
                  </p>
                </div>
                <span className="text-zinc-300 font-medium">
                  USD ($)
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-white">
                    Language
                  </p>
                  <p className="text-sm text-zinc-400">
                    Interface language
                  </p>
                </div>
                <span className="text-zinc-300 font-medium">
                  English (US)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-[#ef4444]">Danger Zone</CardTitle>
            <CardDescription>Irreversible account actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-[#ef4444]/30 rounded-xl">
                <div>
                  <p className="font-medium text-white">
                    Delete Account
                  </p>
                  <p className="text-sm text-zinc-400">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="danger" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
