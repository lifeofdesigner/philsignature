import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  return (
    <section className="py-20 bg-luxury-charcoal border-b border-luxury-border text-center">
      <div className="container mx-auto px-4 max-w-xl space-y-6">
        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
            Stay In The Loop
          </span>
          <h2 className="font-serif text-3xl text-luxury-cream font-normal">
            Join Our Newsletter
          </h2>
          <p className="text-xs text-luxury-sand font-light leading-relaxed">
            Be the first to know about new perfumes, special discounts, and exclusive offers.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-4 bg-luxury-card border border-luxury-gold/50 rounded-sm shadow-xs flex items-center justify-center gap-2 text-xs text-luxury-gold">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="font-medium">You are now subscribed. Thank you!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="min-h-[44px] bg-luxury-card border border-luxury-border text-xs text-luxury-cream placeholder:text-luxury-muted focus:border-luxury-gold rounded-sm shadow-xs"
            />
            <Button variant="luxury" size="default" className="min-h-[44px] shrink-0 gap-2 text-xs font-semibold tracking-wider">
              <Mail className="h-3.5 w-3.5" />
              <span>Subscribe</span>
            </Button>
          </form>
        )}
      </div>
    </section>
  );
};

