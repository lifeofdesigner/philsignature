import React, { useState } from 'react';
import { Search, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const TrackOrderPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-xl">
      <div className="text-center space-y-3 mb-10">
        <div className="h-12 w-12 rounded-full border border-luxury-gold/40 bg-luxury-charcoal flex items-center justify-center mx-auto text-luxury-gold">
          <Clock className="h-5 w-5" />
        </div>
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Consignment Tracking
        </span>
        <h1 className="font-serif text-3xl text-white font-normal">
          Track Your Delivery
        </h1>
        <p className="text-xs text-luxury-muted font-light leading-relaxed">
          Enter your unique PHILZ SIGNATURE order reference (e.g. PS-10492) and the email used during checkout.
        </p>
      </div>

      <div className="bg-luxury-card border border-luxury-border p-8 space-y-6">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <Input
            label="Order Number"
            placeholder="PS-XXXXXX"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
          <Input
            label="Account / Delivery Email"
            type="email"
            placeholder="client@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button variant="luxury" size="lg" className="w-full gap-2">
            <Search className="h-4 w-4" />
            <span>Locate Consignment</span>
          </Button>
        </form>
      </div>
    </div>
  );
};
