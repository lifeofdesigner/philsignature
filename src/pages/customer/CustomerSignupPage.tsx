import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const CustomerSignupPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <div className="text-center space-y-2 mb-8">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Privileged Membership
        </span>
        <h1 className="font-serif text-3xl text-white font-normal">
          Join the Circle
        </h1>
        <p className="text-xs text-luxury-muted font-light">
          Create an account to track private acquisitions and orders.
        </p>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-8 space-y-6">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Alexander"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <Input
              label="Last Name"
              placeholder="Sterling"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
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
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button variant="luxury" size="lg" className="w-full">
            Register Account
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-luxury-border/60 text-xs text-luxury-muted">
          <span>Already registered? </span>
          <Link
            to="/login"
            className="text-luxury-gold underline underline-offset-4 hover:text-luxury-gold-light font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
