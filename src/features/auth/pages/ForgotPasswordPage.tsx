import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setIsSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset instructions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Account Help
        </span>
        <h1 className="font-serif text-3xl text-white font-normal">
          Forgot Password
        </h1>
        <p className="text-xs text-luxury-muted font-light">
          Enter your email address to receive a password reset link.
        </p>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-8 space-y-6">
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-950/40 border border-red-800/60 text-red-200 text-xs font-light">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isSent ? (
          <div className="text-center space-y-4 py-4">
            <div className="h-12 w-12 rounded-full border border-emerald-500/40 bg-emerald-950/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-lg text-white font-normal">
              Reset Link Sent
            </h3>
            <p className="text-xs text-luxury-sand leading-relaxed">
              If an account exists for <strong className="text-white">{email}</strong>, you will receive password reset instructions in your email shortly.
            </p>
            <div className="pt-2">
              <Link to={ROUTES.LOGIN}>
                <Button variant="outline" size="sm">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
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
            <Button variant="luxury" size="lg" className="w-full gap-2" disabled={isSubmitting}>
              <Mail className="h-4 w-4" />
              <span>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</span>
            </Button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-luxury-border/60 text-xs text-luxury-muted">
          <Link
            to={ROUTES.LOGIN}
            className="text-luxury-gold hover:underline font-medium"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
