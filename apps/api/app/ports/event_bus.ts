/**
 * Re-export IEventBus as a port
 * This makes it clear this is a port in our hexagonal architecture
 */
export type { EventBus as IEventBus, EventHandler, DomainEvent } from '#events/base'
