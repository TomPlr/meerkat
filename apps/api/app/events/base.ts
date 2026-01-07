/**
 * Base interface for all domain events
 */
export interface DomainEvent {
  type: string
  aggregateId: string
  aggregateType: string
  occurredAt: Date
  data: Record<string, any>
  metadata?: Record<string, any>
}

/**
 * Event handler function signature
 */
export type EventHandler<T extends DomainEvent = DomainEvent> = (event: T) => void | Promise<void>

/**
 * Event Bus interface (Port in Hexagonal Architecture)
 * This allows us to swap implementations (EventEmitter -> Redis Streams)
 */
export interface EventBus {
  /**
   * Publish an event to the bus
   */
  publish(event: DomainEvent): Promise<void>

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void

  /**
   * Unsubscribe from events of a specific type
   */
  unsubscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void
}
