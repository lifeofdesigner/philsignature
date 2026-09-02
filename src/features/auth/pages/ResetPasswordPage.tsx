import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { AlertCircle, KeyRound, Check } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(newPassword);
      navigate(ROUTES.LOGIN, { state: { message: 'Password updated successfully. Please log in.' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update password. Recovery link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Account Security
        </span>
        <h1 className="font-serif text-3xl text-white font-normal">
          Set New Password
        </h1>
        <p className="text-xs text-luxury-muted font-light">
          Enter a new password for your account.
        </p>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-8 space-y-6">
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-light">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <div className="p-3 bg-luxury-charcoal/60 border border-luxury-border/60 space-y-1.5 text-[11px]">
            <span className="text-luxury-sand font-medium uppercase tracking-wider block text-[10px]">
              Password Standards:
            </span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-luxury-muted">
              <span className={`flex items-center gap-1 ${hasLength ? 'text-emerald-400' : ''}`}>
                <Check className="h-3 w-3" /> 8+ Chars
              </span>
              <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-400' : ''}`}>
                <Check className="h-3 w-3" /> Uppercase
              </span>
              <span className={`flex items-center gap-1 ${hasLower ? 'text-emerald-400' : ''}`}>
                <Check className="h-3 w-3" /> Lowercase
              </span>
              <span className={`flex items-center gap-1 ${hasNumber && hasSpecial ? 'text-emerald-400' : ''}`}>
                <Check className="h-3 w-3" /> Number & Symbol
              </span>
            </div>
          </div>

          <Button variant="luxury" size="lg" className="w-full gap-2" disabled={isSubmitting}>
            <KeyRound className="h-4 w-4" />
            <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
          </Button>
        </form>
      </div>
    </div>
  );
};

