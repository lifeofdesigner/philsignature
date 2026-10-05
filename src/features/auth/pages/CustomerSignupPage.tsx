import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { AlertCircle, Check, ShieldCheck } from 'lucide-react';

export const CustomerSignupPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        email,
        password,
        firstName,
        lastName,
        phone,
      });
      const postAuthRedirect = sessionStorage.getItem('post_auth_redirect');
      if (postAuthRedirect) {
        sessionStorage.removeItem('post_auth_redirect');
        navigate(postAuthRedirect, { replace: true });
        return;
      }

      const searchParams = new URLSearchParams(location.search);
      const redirectParam = searchParams.get('redirect');
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || redirectParam;
      navigate('/verify-email', { state: { email, from } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't create your account. Please check your information and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          New Customer
        </span>
        <h1 className="font-serif text-3xl text-luxury-cream font-normal">
          Create an Account
        </h1>
        <p className="text-xs text-luxury-muted font-light">
          Create an account to track your orders and checkout faster.
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
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
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
            label="Phone Number"
            type="tel"
            placeholder="08012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <div className="p-3 bg-luxury-charcoal/60 border border-luxury-border/60 space-y-1.5 text-[11px]">
            <span className="text-luxury-sand font-medium uppercase tracking-wider block text-[10px]">
              Password Requirements:
            </span>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-luxury-muted">
              <span className={`flex items-center gap-1 ${hasLength ? 'text-emerald-400' : ''}`}>
                <Check className="h-3 w-3" /> 8+ Characters
              </span>
              <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-400' : ''}`}>
                <Check className="h-3 w-3" /> Uppercase Letter
              </span>
              <span className={`flex items-center gap-1 ${hasLower ? 'text-emerald-400' : ''}`}>
                <Check className="h-3 w-3" /> Lowercase Letter
              </span>
              <span className={`flex items-center gap-1 ${hasNumber && hasSpecial ? 'text-emerald-400' : ''}`}>
                <Check className="h-3 w-3" /> Number & Symbol
              </span>
            </div>
          </div>

          <Button type="submit" variant="luxury" size="lg" className="w-full gap-2" disabled={isSubmitting}>
            <ShieldCheck className="h-4 w-4" />
            <span>{isSubmitting ? 'Creating account...' : 'Create Account'}</span>
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-luxury-border/60 text-xs text-luxury-muted">
          <span>Already have an account? </span>
          <Link
            to={ROUTES.LOGIN}
            state={location.state}
            className="text-luxury-gold underline underline-offset-4 hover:text-luxury-gold-light font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
