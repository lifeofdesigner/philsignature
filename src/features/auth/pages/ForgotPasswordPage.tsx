import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Account Security
        </span>
        <h1 className="font-serif text-3xl text-white font-normal">
          Password Recovery
        </h1>
        <p className="text-xs text-luxury-muted font-light">
          Enter your registered email to receive a secure recovery key.
        </p>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-8 space-y-6">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="client@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button variant="luxury" size="lg" className="w-full">
            Transmit Recovery Link
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-luxury-border/60 text-xs text-luxury-muted">
          <Link
            to={ROUTES.LOGIN}
            className="text-luxury-gold hover:underline font-medium"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

