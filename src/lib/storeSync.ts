/**
 * Cross-tab, in-tab, and real-time event dispatcher for store updates.
 * Guarantees that when any image or text is updated in admin,
 * every storefront tab and component reflects the change instantly without manual refresh.
 */

type SyncEventType =
  | 'CMS_UPDATED'
  | 'SETTINGS_UPDATED'
  | 'APPEARANCE_UPDATED'
  | 'HERO_UPDATED'
  | 'MENU_UPDATED'
  | 'POLICIES_UPDATED';

interface SyncMessage {
  type: SyncEventType;
  timestamp: number;
  payload?: unknown;
}

const CHANNEL_NAME = 'philz-signature-store-sync';
let broadcastChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not supported in this environment', e);
  }
}

/**
 * Broadcasts an update across the current window and all other browser tabs.
 */
export function broadcastStoreUpdate(type: SyncEventType = 'CMS_UPDATED', payload?: unknown): void {
  if (typeof window === 'undefined') return;

  const message: SyncMessage = {
    type,
    timestamp: Date.now(),
    payload,
  };

  // 1. Broadcast to other tabs via BroadcastChannel
  try {
    broadcastChannel?.postMessage(message);
  } catch (err) {
    console.debug('Failed to broadcast store update across tabs:', err);
  }

  // 2. Broadcast in the current window via CustomEvent
  window.dispatchEvent(new CustomEvent('ps:store-sync', { detail: message }));

  // 3. Fallback for older browsers via localStorage storage event
  try {
    localStorage.setItem('ps_last_sync_event', JSON.stringify(message));
  } catch (err) {
    console.debug('Failed to set localStorage sync event:', err);
  }
}

/**
 * Subscribes to store update events from any tab or window.
 */
export function subscribeToStoreSync(onUpdate: (message: SyncMessage) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const detail = (e as CustomEvent<SyncMessage>).detail;
    if (detail) onUpdate(detail);
  };

  const handleBroadcastMessage = (event: MessageEvent<SyncMessage>) => {
    if (event.data?.type) onUpdate(event.data);
  };

  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === 'ps_last_sync_event' && event.newValue) {
      try {
        const parsed = JSON.parse(event.newValue) as SyncMessage;
        onUpdate(parsed);
      } catch (err) {
        console.debug('Failed to parse storage sync event:', err);
      }
    }
  };

  window.addEventListener('ps:store-sync', handleCustomEvent);
  broadcastChannel?.addEventListener('message', handleBroadcastMessage);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener('ps:store-sync', handleCustomEvent);
    broadcastChannel?.removeEventListener('message', handleBroadcastMessage);
    window.removeEventListener('storage', handleStorageEvent);
  };
}
