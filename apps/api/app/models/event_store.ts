import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type EventMetadata = {
  userId?: string
  timestamp?: string
  correlationId?: string
  causationId?: string
  [key: string]: any
}

export type AggregateType = 'user' | 'position' | 'signal' | 'intent'

export default class EventStoreModel extends BaseModel {
  static table = 'event_store'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare eventId: string

  @column()
  declare eventType: string

  @column()
  declare aggregateId: string

  @column()
  declare aggregateType: AggregateType

  @column({
    prepare: (value: Record<string, any>) => JSON.stringify(value),
    consume: (value: string | Record<string, any>) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare data: Record<string, any>

  @column({
    prepare: (value: EventMetadata | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => (value ? JSON.parse(value) : null),
  })
  declare metadata: EventMetadata | null

  @column()
  declare version: number

  @column.dateTime({ autoCreate: true })
  declare occurredAt: DateTime
}
