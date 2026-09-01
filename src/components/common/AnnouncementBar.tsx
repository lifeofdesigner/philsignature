import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import { cmsService, type CmsAnnouncementContent } from '@/services/CMSService';

export const AnnouncementBar: React.FC = () => {
  const [announcement, setAnnouncement] = useState<CmsAnnouncementContent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    cmsService.getAnnouncementSection().then((data) => {
      if (isMounted) setAnnouncement(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!announcement || !announcement.enabled || isDismissed) {
    return null;
  }

  return (
    <div className="bg-luxury-gold text-black px-4 py-2 text-center text-[10px] sm:text-xs tracking-luxury-wide font-medium relative flex items-center justify-center gap-2">
      <Sparkles className="h-3 w-3 shrink-0" />
      <span className="truncate">{announcement.text}</span>
      {announcement.link_text && announcement.link_url && (
        <Link
          to={announcement.link_url}
          className="underline underline-offset-2 ml-1 font-bold hover:text-luxury-charcoal transition-colors shrink-0"
        >
          {announcement.link_text}
        </Link>
      )}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute right-3 p-1 hover:text-luxury-charcoal transition-colors"
        aria-label="Dismiss announcement banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
