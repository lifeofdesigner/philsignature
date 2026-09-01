import React from 'react';
import { BarChart3 } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';

export const AdminAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-luxury text-luxury-gold font-medium">
          Intelligence & Reporting
        </span>
        <h1 className="font-serif text-3xl text-white font-normal mt-1">
          Sales Analytics
        </h1>
      </div>

      <EmptyState
        icon={<BarChart3 className="h-5 w-5" />}
        title="Analytics Engine Inactive"
        description="Comprehensive charts for sales volume, bestselling extraits, customer repeat rate, and conversion funnel will populate with live orders."
      />
    </div>
  );
};
