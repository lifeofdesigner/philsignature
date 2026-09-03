import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X, Sparkles } from 'lucide-react';
import { cmsService } from '@/services/CMSService';

export const AnnouncementBar: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: announcement } = useQuery({
    queryKey: ['announcement-bar'],
    queryFn: () => cmsService.getAnnouncementSection(),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });

  if (!announcement || !announcement.enabled || isDismissed) {
    return null;
  }

  return (
    <div className="bg-black/95 text-luxury-gold px-4 py-1.5 text-center text-[10px] sm:text-xs tracking-luxury-wide font-medium relative z-50 flex items-center justify-center gap-2 border-b border-luxury-gold/20">
      <Sparkles className="h-3 w-3 shrink-0 text-luxury-gold" />
      <span className="truncate">{announcement.text}</span>
      {announcement.link_text && announcement.link_url && (
        <Link
          to={announcement.link_url}
          className="underline underline-offset-2 ml-1 text-white hover:text-luxury-gold transition-colors shrink-0"
        >
          {announcement.link_text}
        </Link>
      )}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute right-3 p-1 text-luxury-gold/70 hover:text-luxury-gold transition-colors cursor-pointer"
        aria-label="Dismiss announcement banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
