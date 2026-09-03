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
    <div className="w-full flex items-center justify-center pt-2 px-3 relative z-50 pointer-events-auto">
      <div className="max-w-xl px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-xl text-luxury-gold/95 text-[10px] sm:text-xs tracking-luxury-wide font-medium flex items-center justify-center gap-2 border border-white/15 shadow-[0_8px_20px_rgba(0,0,0,0.5)]">
        <Sparkles className="h-3 w-3 shrink-0 text-luxury-gold" />
        <span className="truncate">{announcement.text}</span>
        {announcement.link_text && announcement.link_url && (
          <Link
            to={announcement.link_url}
            className="underline underline-offset-2 ml-1 text-white hover:text-luxury-gold transition-colors shrink-0 font-semibold"
          >
            {announcement.link_text}
          </Link>
        )}
        <button
          onClick={() => setIsDismissed(true)}
          className="ml-1 p-0.5 text-luxury-gold/70 hover:text-luxury-gold transition-colors cursor-pointer"
          aria-label="Dismiss announcement banner"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
