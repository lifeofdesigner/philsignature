import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Clock } from 'lucide-react';
import { cmsService } from '@/services/CMSService';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';

export const PolicyPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();

  const resolvedSlug =
    slug ||
    (location.pathname.includes('privacy')
      ? 'privacy_policy'
      : location.pathname.includes('terms')
      ? 'terms'
      : location.pathname.includes('shipping')
      ? 'shipping_policy'
      : location.pathname.includes('return')
      ? 'returns_policy'
      : 'privacy_policy');

  const { data: policy, isLoading } = useQuery({
    queryKey: ['cms-policy', resolvedSlug],
    queryFn: () => cmsService.getPolicyPage(resolvedSlug),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });

  if (isLoading || !policy) {
    return <PageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-4xl space-y-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-luxury-gold/30 bg-luxury-charcoal/50 text-luxury-gold text-[10px] uppercase tracking-luxury-wide">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Client Commitment</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl text-luxury-cream font-normal">
          {policy.title}
        </h1>
        {policy.subtitle && (
          <p className="text-xs sm:text-sm text-luxury-sand font-light max-w-lg mx-auto leading-relaxed">
            {policy.subtitle}
          </p>
        )}
        <div className="flex items-center justify-center gap-2 text-[11px] text-luxury-muted">
          <Clock className="h-3 w-3" />
          <span>Effective Date: {policy.last_updated}</span>
        </div>
      </div>

      <div className="bg-luxury-card border border-luxury-border rounded-sm p-8 sm:p-12 space-y-6 text-xs sm:text-sm text-luxury-sand font-light leading-relaxed whitespace-pre-line">
        {policy.content}
      </div>
    </div>
  );
};
