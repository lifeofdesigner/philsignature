import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { AlertCircle, Lock } from 'lucide-react';

export const CustomerLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, canAccessAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      const searchParams = new URLSearchParams(location.search);
      const redirectParam = searchParams.get('redirect');
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || redirectParam;
      if (from) {
        navigate(from, { replace: true });
      } else if (canAccessAdmin) {
        navigate(ROUTES.ADMIN.DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.ACCOUNT.DASHBOARD, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't sign you in. Please check your details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Welcome Back
        </span>
        <h1 className="font-serif text-3xl text-luxury-cream font-normal">
          Sign In
        </h1>
        <p className="text-xs text-luxury-muted font-light">
          Sign in to your account to view your orders and details.
        </p>
      </div>

      <div className="bg-luxury-card border border-luxury-border rounded-sm shadow-xs p-8 space-y-6">
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-200 text-xs font-light rounded-sm">
            <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <div className="flex items-center justify-between text-xs text-luxury-muted">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-luxury-gold" defaultChecked />
              <span>Remember me</span>
            </label>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="hover:text-luxury-gold transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" variant="luxury" size="lg" className="w-full gap-2" disabled={isSubmitting}>
            <Lock className="h-3.5 w-3.5" />
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-luxury-border/60 text-xs text-luxury-muted">
          <span>Don't have an account? </span>
          <Link
            to={ROUTES.SIGNUP}
            state={location.state}
            className="text-luxury-gold underline underline-offset-4 hover:text-luxury-gold-light font-medium"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
