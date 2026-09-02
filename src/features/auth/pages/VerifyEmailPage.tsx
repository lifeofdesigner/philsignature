import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  return (
    <div className="container mx-auto px-4 py-24 max-w-md text-center">
      <div className="bg-luxury-card border border-luxury-border rounded-sm shadow-xs p-8 space-y-6">
        <div className="h-14 w-14 rounded-full border border-luxury-gold/40 bg-luxury-gold/10 flex items-center justify-center mx-auto text-luxury-gold">
          <Mail className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Account Activation
          </span>
          <h1 className="font-serif text-3xl text-luxury-cream font-normal">
            Verify Your Email
          </h1>
          <p className="text-xs text-luxury-sand font-light leading-relaxed">
            We sent a confirmation email to:
          </p>
          {email && (
            <div className="text-xs text-luxury-cream font-medium py-1.5 px-3 bg-luxury-card border border-luxury-border rounded-sm inline-block">
              {email}
            </div>
          )}
        </div>

        <p className="text-xs text-luxury-muted leading-relaxed font-light">
          Please check your inbox and click the link to confirm your email and activate your account.
        </p>

        <div className="pt-2">
          <Link to={ROUTES.LOGIN}>
            <Button variant="outline" size="sm" className="gap-2">
              <span>Back to Sign In</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

