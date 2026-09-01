import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
      <span className="text-[11px] uppercase tracking-luxury-wide text-luxury-gold mb-3 font-medium">
        404 — Scent Lost
      </span>
      <h1 className="font-serif text-4xl sm:text-5xl text-white font-normal mb-4">
        Vanished Into Thin Air
      </h1>
      <p className="text-xs sm:text-sm text-luxury-muted leading-relaxed mb-8 font-light max-w-sm">
        The formulation or salon page you sought has either expired or been retired from our private collections.
      </p>
      <Link to={ROUTES.HOME}>
        <Button variant="luxury">Return to Flagship Boutique</Button>
      </Link>
    </div>
  );
};

