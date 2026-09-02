import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { subscribeToStoreSync } from '@/lib/storeSync';

export const RealtimeSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const invalidateAllStorefront = () => {
      queryClient.invalidateQueries({ queryKey: ['store-appearance'] });
      queryClient.invalidateQueries({ queryKey: ['store-navigation-menu'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-modular-layout'] });
      queryClient.invalidateQueries({ queryKey: ['home-page-data'] });
      queryClient.invalidateQueries({ queryKey: ['announcement-bar'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-settings-general'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-story'] });
      queryClient.invalidateQueries({ queryKey: ['contact-page-data'] });
      queryClient.invalidateQueries({ queryKey: ['cms-policy'] });
      queryClient.invalidateQueries({ queryKey: ['faqs-data'] });
    };

    // 1. Cross-Tab & In-Tab Instant Event Bus
    const unsubscribeSync = subscribeToStoreSync(() => {
      invalidateAllStorefront();
    });

    // 2. Supabase Realtime WebSocket Subscription
    const channel = supabase
      .channel('storefront-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cms_content' }, () => {
        invalidateAllStorefront();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
        invalidateAllStorefront();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['home-page-data'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collections' }, () => {
        queryClient.invalidateQueries({ queryKey: ['collections'] });
        queryClient.invalidateQueries({ queryKey: ['home-page-data'] });
      })
      .subscribe();

    return () => {
      unsubscribeSync();
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return <>{children}</>;
};
