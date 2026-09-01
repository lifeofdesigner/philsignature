import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/AuthProvider';
import { ROUTES } from '@/constants/routes';

export const CustomerLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
  };

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Privileged Access
        </span>
        <h1 className="font-serif text-3xl text-white font-normal">
          Client Login
        </h1>
        <p className="text-xs text-luxury-muted font-light">
          Sign into your PHILZ SIGNATURE private salon account.
        </p>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="client@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex items-center justify-between text-xs text-luxury-muted">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="hover:text-luxury-gold transition-colors"
            >
              Forgotten password?
            </Link>
          </div>
          <Button variant="luxury" size="lg" className="w-full">
            Enter Private Salon
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-luxury-border/60 text-xs text-luxury-muted">
          <span>Not yet a member? </span>
          <Link
            to={ROUTES.SIGNUP}
            className="text-luxury-gold underline underline-offset-4 hover:text-luxury-gold-light font-medium"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

