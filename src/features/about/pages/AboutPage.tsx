import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles } from 'lucide-react';
import { cmsService } from '@/services/CMSService';
import { PageSkeleton } from '@/components/feedback/SkeletonLoaders';

export const AboutPage: React.FC = () => {
  const { data: story, isLoading } = useQuery({
    queryKey: ['about-page-story'],
    queryFn: () => cmsService.getStorySection(),
  });

  if (isLoading || !story) {
    return <PageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 py-16 max-w-4xl space-y-16">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-luxury-gold/30 bg-luxury-charcoal/50 text-luxury-gold text-[10px] uppercase tracking-luxury-wide">
          <Sparkles className="h-3 w-3" />
          <span>Our Story</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-luxury-cream font-light">
          {story.title}
        </h1>
        {story.quote && (
          <p className="text-sm italic text-luxury-gold/90 font-light max-w-xl mx-auto leading-relaxed">
            "{story.quote}"
          </p>
        )}
      </div>

      <div className="border-t border-luxury-border/60 pt-12 grid grid-cols-1 md:grid-cols-2 gap-12 text-xs text-luxury-sand leading-relaxed font-light">
        <div className="space-y-4">
          <h3 className="font-serif text-2xl text-luxury-cream font-normal">Our Philosophy</h3>
          <p>{story.philosophy}</p>
        </div>
        <div className="space-y-4">
          <h3 className="font-serif text-2xl text-luxury-cream font-normal">Where We Source</h3>
          <p>{story.sourcing}</p>
        </div>
      </div>

      {story.image1_url && (
        <div className="w-full aspect-[21/9] overflow-hidden rounded-xs border border-luxury-border">
          <img
            src={story.image1_url}
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};
