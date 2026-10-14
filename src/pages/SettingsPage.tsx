import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import {
  User,
  Lock,
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  Save,
  Check,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, contentTheme, toggleContentTheme } = useAuthStore();
  const { success } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [proposalAlerts, setProposalAlerts] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, phone, city });
    success('Profile Updated', 'Your contact information has been saved.');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    success('Password Changed', 'Your security credentials have been updated.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-left animate-in fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your contact credentials, notification preferences, and workspace appearance.
        </p>
      </div>

      {/* Workspace Content Theme Toggle */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Dashboard Content Theme
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Toggle content area background between Light slate-50 and Dark slate-900.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleContentTheme}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-semibold text-xs text-slate-700 min-h-[44px]"
        >
          {contentTheme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Dark Mode Active</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span>Light Mode Active</span>
            </>
          )}
        </button>
      </div>

      {/* Account Info Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card space-y-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600" />
          Personal & Contact Details
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed directly."
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Input
            label="City / Location"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card space-y-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600" />
          Change Password
        </h3>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <PasswordInput
            label="Current Password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordInput
              label="New Password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="secondary"
              size="md"
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* Notifications Toggles */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-card space-y-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-3 flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-600" />
          Notification Preferences
        </h3>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div>
              <p className="text-sm font-bold text-slate-900">Email Digest & Alerts</p>
              <p className="text-xs text-slate-500">
                Receive instant emails when proposals or deliverables are submitted.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer">
            <div>
              <p className="text-sm font-bold text-slate-900">Push Notifications & SMS</p>
              <p className="text-xs text-slate-500">
                Receive mobile device alerts for direct chat messages and escrow milestones.
              </p>
            </div>
            <input
              type="checkbox"
              checked={proposalAlerts}
              onChange={(e) => setProposalAlerts(e.target.checked)}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
