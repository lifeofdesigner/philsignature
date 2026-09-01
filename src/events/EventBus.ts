import type { DomainEventMap, DomainEventName, EventHandler } from './types';

export class DomainEventBus {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handlers = new Map<DomainEventName, Set<EventHandler<any>>>();

  subscribe<K extends DomainEventName>(event: K, handler: EventHandler<DomainEventMap[K]>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // Unsubscribe callback
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  async publish<K extends DomainEventName>(event: K, payload: DomainEventMap[K]): Promise<void> {
    const eventHandlers = this.handlers.get(event);
    if (!eventHandlers || eventHandlers.size === 0) return;

    const executions = Array.from(eventHandlers).map((handler) => {
      try {
        return Promise.resolve(handler(payload));
      } catch (err) {
        console.error(`[DomainEventBus] Error executing handler for ${event}:`, err);
        return Promise.resolve();
      }
    });

    await Promise.allSettled(executions);
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const eventBus = new DomainEventBus();

