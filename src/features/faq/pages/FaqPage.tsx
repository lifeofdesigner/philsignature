import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { cmsService } from '@/services/CMSService';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';

export const FaqPage: React.FC = () => {
  const { data: faq, isLoading } = useQuery({
    queryKey: ['faq-page-data'],
    queryFn: () => cmsService.getFaqContent(),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });

  if (isLoading || !faq) {
    return <PageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-3xl space-y-12">
      <div className="text-center space-y-3">
        <span className="text-[10px] uppercase tracking-luxury-wide text-luxury-gold font-medium">
          Help & Support
        </span>
        <h1 className="font-serif text-4xl text-luxury-cream font-normal">
          {faq.title}
        </h1>
        <p className="text-xs text-luxury-sand font-light leading-relaxed">
          {faq.subtitle}
        </p>
      </div>

      <div className="space-y-4">
        {faq.items.map((item, index) => (
          <div
            key={index}
            className="bg-luxury-card border border-luxury-border rounded-sm p-6 space-y-2"
          >
            <h3 className="font-serif text-lg text-luxury-cream font-normal">{item.question}</h3>
            <p className="text-xs text-luxury-sand leading-relaxed font-light">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
