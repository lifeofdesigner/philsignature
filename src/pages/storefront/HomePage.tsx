import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/feedback/EmptyState';

export const HomePage: React.FC = () => {
  // Empty data source state ready for Supabase integration in Phase 4
  const featuredProducts: unknown[] = [];

  return (
    <div className="space-y-24 pb-24">
      {/* Luxury Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center text-center px-4 bg-radial-luxury overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-luxury-gold/30 bg-luxury-charcoal/50 text-luxury-gold text-[10px] uppercase tracking-luxury-wide">
            <Sparkles className="h-3 w-3" />
            <span>The Private Reserve Collection</span>
          </div>
          <h1 className="font-serif text-5xl sm:text-7xl font-light tracking-wide text-white leading-tight">
            Transcendence <br />
            <span className="italic font-normal text-gold-gradient">
              in Every Note
            </span>
          </h1>
          <p className="text-sm sm:text-base text-luxury-sand font-light leading-relaxed max-w-xl mx-auto">
            Handcrafted extraits de parfum, artisanal home scents, and rare oud elixirs born from the rarest botanical essences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/shop">
              <Button variant="luxury" size="lg">
                Explore Creations
              </Button>
            </Link>
            <Link to="/collections">
              <Button variant="outline" size="lg">
                View Collections
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Container */}
      <section className="container mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 pb-4 border-b border-luxury-border/60">
          <div>
            <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
              Curated Releases
            </span>
            <h2 className="font-serif text-3xl text-white font-normal mt-1">
              The Signature Extraits
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-luxury text-luxury-gold hover:underline mt-4 sm:mt-0 flex items-center gap-1.5"
          >
            <span>View Full Salon</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <EmptyState
            icon={<Compass className="h-5 w-5" />}
            title="Curating the Private Reserve"
            description="Our perfumers are preparing the live catalog from our Supabase atelier."
            actionLabel="Browse Salon"
            onAction={() => window.location.assign('/shop')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Populated in Phase 4 */}
          </div>
        )}
      </section>
    </div>
  );
};
