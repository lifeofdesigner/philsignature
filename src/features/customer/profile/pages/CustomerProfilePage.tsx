import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck, User, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/UserService';

export const CustomerProfilePage: React.FC = () => {
  const { profile, user, refreshProfile, updatePassword } = useAuth();

  // Personal Info Form State
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Profile Update Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Authentication required');
      if (!firstName.trim() || !lastName.trim()) {
        throw new Error('First and last name are required');
      }
      return userService.updateProfile(user.id, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim(),
      });
    },
    onSuccess: async () => {
      await refreshProfile();
      setProfileSuccess('Your profile has been updated successfully.');
      setProfileError(null);
      setTimeout(() => setProfileSuccess(null), 5000);
    },
    onError: (err: Error) => {
      setProfileError(err.message || 'Failed to update profile');
      setProfileSuccess(null);
    },
  });

  // Password Update Mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword.length < 8) {
        throw new Error('Password must contain at least 8 characters');
      }
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match');
      }
      return updatePassword(newPassword);
    },
    onSuccess: () => {
      setPasswordSuccess('Your password has been changed successfully.');
      setPasswordError(null);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 5000);
    },
    onError: (err: Error) => {
      setPasswordError(err.message || 'Failed to update password');
      setPasswordSuccess(null);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePasswordMutation.mutate();
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Active';
    return new Date(isoString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-10 animate-fadeIn max-w-3xl">
      {/* Page Header */}
      <div>
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          My Account
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-white font-normal mt-1">
          Profile & Password
        </h1>
        <p className="text-xs text-luxury-muted mt-1.5 font-light">
          Update your personal details, phone number, and password.
        </p>
      </div>

      {/* 1. Personal Details Form */}
      <section className="bg-luxury-card/40 border border-luxury-border p-6 rounded space-y-6">
        <div className="flex items-center justify-between border-b border-luxury-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <User className="h-4 w-4 text-luxury-gold" />
            <h2 className="font-serif text-base text-white">Personal Information</h2>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-luxury-muted">
            Account Details
          </span>
        </div>

        {profileSuccess && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded flex items-center gap-2 text-xs text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded flex items-center gap-2 text-xs text-red-300 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{profileError}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-luxury-black border border-luxury-border p-2.5 text-xs text-white rounded focus:border-luxury-gold focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-luxury-black border border-luxury-border p-2.5 text-xs text-white rounded focus:border-luxury-gold focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={profile?.email || user?.email || ''}
                  disabled
                  className="w-full bg-luxury-black/60 border border-luxury-border/40 p-2.5 text-xs text-luxury-muted rounded cursor-not-allowed pr-24"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-wider text-emerald-400 font-medium">
                  Verified
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1.5">
                Telephone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full bg-luxury-black border border-luxury-border p-2.5 text-xs text-white rounded focus:border-luxury-gold focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-luxury-gold text-luxury-black hover:bg-luxury-gold-light text-xs uppercase tracking-luxury-wide font-medium rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              {updateProfileMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </section>

      {/* 2. Security & Credentials Section */}
      <section className="bg-luxury-card/40 border border-luxury-border p-6 rounded space-y-6">
        <div className="flex items-center justify-between border-b border-luxury-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-luxury-gold" />
            <h2 className="font-serif text-base text-white">Security & Password</h2>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-luxury-muted">
            Password Settings
          </span>
        </div>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded flex items-center gap-2 text-xs text-emerald-300 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded flex items-center gap-2 text-xs text-red-300 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1.5">
                New Password *
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Minimum 8 characters"
                className="w-full bg-luxury-black border border-luxury-border p-2.5 text-xs text-white rounded focus:border-luxury-gold focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-luxury-muted mb-1.5">
                Confirm New Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repeat password"
                className="w-full bg-luxury-black border border-luxury-border p-2.5 text-xs text-white rounded focus:border-luxury-gold focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={updatePasswordMutation.isPending || !newPassword}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-luxury-border hover:bg-luxury-gold hover:text-luxury-black text-white text-xs uppercase tracking-luxury-wide font-medium rounded transition-colors cursor-pointer disabled:opacity-40"
            >
              {updatePasswordMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Update Password</span>
            </button>
          </div>
        </form>
      </section>

      {/* 3. Account Details Card */}
      <section className="bg-luxury-card/30 border border-luxury-border/60 p-5 rounded">
        <div className="flex items-center gap-2 text-xs text-luxury-gold mb-3">
          <ShieldCheck className="h-4 w-4" />
          <span className="font-medium uppercase tracking-wider text-[11px]">Account Information</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-luxury-muted">
          <div>
            <span className="text-[10px] uppercase tracking-wider block mb-0.5">Account ID</span>
            <span className="font-mono text-[11px] text-white truncate block">{user?.id || '—'}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider block mb-0.5">Member Since</span>
            <span className="text-white block">{formatDate(profile?.created_at || user?.created_at)}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider block mb-0.5">Account Role</span>
            <span className="text-luxury-gold uppercase tracking-wider text-[10px] font-medium block">
              {profile?.role || 'Customer'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
