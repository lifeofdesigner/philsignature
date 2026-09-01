import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface UnauthorizedStateProps {
  title?: string;
  message?: string;
  redirectTo?: string;
  redirectLabel?: string;
}

export const UnauthorizedState: React.FC<UnauthorizedStateProps> = ({
  title = 'Private Quarters Access Restricted',
  message = 'You do not have the administrative privileges required to access this atelier salon.',
  redirectTo = '/',
  redirectLabel = 'Return to Boutique',
}) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
      <div className="h-16 w-16 rounded-full border border-luxury-gold/40 bg-luxury-charcoal flex items-center justify-center mb-6 text-luxury-gold shadow-lg shadow-luxury-gold/5">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold mb-2 font-medium">
        403 Forbidden
      </span>
      <h1 className="font-serif text-3xl text-white font-normal mb-3">{title}</h1>
      <p className="text-sm text-luxury-muted leading-relaxed mb-8 font-light max-w-sm">
        {message}
      </p>
      <Link to={redirectTo}>
        <Button variant="goldOutline">{redirectLabel}</Button>
      </Link>
    </div>
  );
};

