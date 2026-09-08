/**
 * DOXO Real-Time Event Bus & Chat Delivery Engine
 * Provides cross-tab synchronization and message delivery lifecycle (sending -> sent -> delivered -> read).
 */

export type EventType =
  | 'booking.updated'
  | 'chat.message_sent'
  | 'chat.delivery_status'
  | 'notification.created'
  | 'provider.status_changed';

export interface RealtimeEvent<T = any> {
  type: EventType;
  payload: T;
  timestamp: string;
}

export type EventListener<T = any> = (event: RealtimeEvent<T>) => void;

export class EventBus {
  private static listeners = new Map<EventType, Set<EventListener>>();
  private static channel: BroadcastChannel | null = null;

  static init(): void {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window && !this.channel) {
      try {
        this.channel = new BroadcastChannel('doxo_realtime_bus');
        this.channel.onmessage = (ev) => {
          if (ev.data && ev.data.type) {
            this.dispatchLocal(ev.data);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported in this environment, using in-memory bus.');
      }
    }
  }

  static subscribe<T = any>(type: EventType, listener: EventListener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  static emit<T = any>(type: EventType, payload: T): void {
    const event: RealtimeEvent<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };

    // Dispatch locally
    this.dispatchLocal(event);

    // Broadcast to other tabs/windows
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (e) {
        console.error('Error broadcasting realtime event:', e);
      }
    }
  }

  private static dispatchLocal(event: RealtimeEvent): void {
    const subs = this.listeners.get(event.type);
    if (subs) {
      subs.forEach(listener => {
        try {
          listener(event);
        } catch (err) {
          console.error(`Error in event listener for ${event.type}:`, err);
        }
      });
    }
  }
}

// Initialize on module load
EventBus.init();
