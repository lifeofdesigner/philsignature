import React from 'react';
import { ShoppingBag, Heart, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CustomerDashboardPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Privileged Overview
        </span>
        <h1 className="font-serif text-3xl text-white font-normal mt-1">
          Atelier Account
        </h1>
        <p className="text-xs text-luxury-muted mt-2 font-light">
          Welcome to your PHILZ SIGNATURE personal sanctuary.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-luxury font-medium text-luxury-muted">
              Total Orders
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-luxury-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-white font-normal">0</div>
            <p className="text-[10px] text-luxury-muted mt-1">Lifetime acquisitions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-luxury font-medium text-luxury-muted">
              Saved Scents
            </CardTitle>
            <Heart className="h-4 w-4 text-luxury-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-serif text-white font-normal">0</div>
            <p className="text-[10px] text-luxury-muted mt-1">In your private wishlist</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs uppercase tracking-luxury font-medium text-luxury-muted">
              Default Destination
            </CardTitle>
            <MapPin className="h-4 w-4 text-luxury-gold" />
          </CardHeader>
          <CardContent>
            <div className="text-xs text-white font-normal">Not configured</div>
            <p className="text-[10px] text-luxury-muted mt-1">Saved delivery address</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

