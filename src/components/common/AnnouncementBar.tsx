import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { X, Sparkles } from 'lucide-react';
import { cmsService } from '@/services/CMSService';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export const AnnouncementBar: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isLight } = useTheme();

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
    <div className={cn(
      'w-full px-4 py-1.5 text-center text-[10px] sm:text-xs tracking-luxury-wide font-light relative z-50 flex items-center justify-center gap-2 drop-shadow-sm pointer-events-auto',
      isLight
        ? 'bg-[#F2EDE8] text-[#4A3A2A] border-b border-black/8'
        : 'bg-black/40 backdrop-blur-xs text-luxury-gold border-b border-white/5'
    )}>
      <Sparkles className={cn('h-3 w-3 shrink-0', isLight ? 'text-[#4A3A2A]' : 'text-luxury-gold')} />
      <span className="truncate">{announcement.text}</span>
      {announcement.link_text && announcement.link_url && (
        <Link
          to={announcement.link_url}
          className={cn('underline underline-offset-2 ml-1 transition-colors shrink-0 font-medium', isLight ? 'text-[#1A1209] hover:text-luxury-gold' : 'text-white hover:text-luxury-gold')}
        >
          {announcement.link_text}
        </Link>
      )}
      <button
        onClick={() => setIsDismissed(true)}
        className={cn('absolute right-4 p-1 transition-colors cursor-pointer', isLight ? 'text-[#4A3A2A]/70 hover:text-[#1A1209]' : 'text-luxury-gold/70 hover:text-luxury-gold')}
        aria-label="Dismiss announcement banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
