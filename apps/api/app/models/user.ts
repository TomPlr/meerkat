import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import PositionModel from './position.js'
import AlertModel from './alert.js'
import IntentModel from './intent.js'

export type UserPreferences = {
  riskProfile?: 'conservative' | 'moderate' | 'aggressive'
  alertThresholds?: {
    healthFactor?: number
    priceChange?: number
  }
  activeSignals?: string[]
  notificationChannels?: ('telegram' | 'email' | 'in_app')[]
}

export default class UserModel extends BaseModel {
  static table = 'users'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare walletAddress: string

  @column({
    prepare: (value: UserPreferences | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => (value ? JSON.parse(value) : null),
  })
  declare preferences: UserPreferences | null

  @column()
  declare telegramChatId: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => PositionModel, {
    foreignKey: 'userId',
  })
  declare positions: HasMany<typeof PositionModel>

  @hasMany(() => AlertModel, {
    foreignKey: 'userId',
  })
  declare alerts: HasMany<typeof AlertModel>

  @hasMany(() => IntentModel, {
    foreignKey: 'userId',
  })
  declare intents: HasMany<typeof IntentModel>
}
