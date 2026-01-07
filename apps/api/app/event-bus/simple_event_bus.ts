import { EventEmitter } from 'node:events'
import type { DomainEvent, EventHandler, EventBus } from '#events/base'

/**
 * Simple EventEmitter-based Event Bus for Phase 0-2
 * Later will be migrated to Redis Streams
 */
export class SimpleEventBus extends EventEmitter implements EventBus {
  constructor() {
    super()
    // Increase max listeners to avoid warnings in development
    this.setMaxListeners(50)
  }

  /**
   * Publish an event to the bus
   */
  async publish(event: DomainEvent): Promise<void> {
    this.emit(event.type, event)
  }

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    this.on(eventType, handler)
  }

  /**
   * Unsubscribe from events of a specific type
   */
  unsubscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    this.off(eventType, handler)
  }
}

// Singleton instance for the application
let eventBusInstance: SimpleEventBus | null = null

/**
 * Get the singleton Event Bus instance
 */
export function getEventBus(): SimpleEventBus {
  if (!eventBusInstance) {
    eventBusInstance = new SimpleEventBus()
  }
  return eventBusInstance
}
