import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import UserModel from './user.js'

export type IntentCondition = {
  type: 'health_factor' | 'price' | 'signal' | 'time'
  operator: '<' | '>' | '<=' | '>=' | '='
  value: number | string
  asset?: string
}

export type IntentAction = {
  type: 'repay' | 'deposit' | 'withdraw' | 'borrow' | 'notify'
  asset?: string
  amount?: number | string
  params?: Record<string, any>
}

export type IntentStatus = 'active' | 'triggered' | 'executed' | 'cancelled' | 'failed'

export default class IntentModel extends BaseModel {
  static table = 'intents'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare name: string

  @column({
    prepare: (value: IntentCondition) => JSON.stringify(value),
    consume: (value: string | IntentCondition) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare condition: IntentCondition

  @column({
    prepare: (value: IntentAction) => JSON.stringify(value),
    consume: (value: string | IntentAction) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare action: IntentAction

  @column()
  declare status: IntentStatus

  @column.dateTime()
  declare triggeredAt: DateTime | null

  @column.dateTime()
  declare executedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => UserModel, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof UserModel>
}
