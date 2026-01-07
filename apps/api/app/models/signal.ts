import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import AlertModel from './alert.js'

export type SignalData = {
  value?: number | string
  percentile?: number
  threshold?: number
  metadata?: Record<string, any>
}

export type SignalSeverity = 'low' | 'medium' | 'high' | 'critical'
export type SignalStatus = 'active' | 'expired' | 'acknowledged'

export default class SignalModel extends BaseModel {
  static table = 'signals'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare type: string

  @column()
  declare asset: string

  @column()
  declare severity: SignalSeverity

  @column({
    prepare: (value: SignalData) => JSON.stringify(value),
    consume: (value: string | SignalData) =>
      typeof value === 'string' ? JSON.parse(value) : value,
  })
  declare data: SignalData

  @column.dateTime({ autoCreate: true })
  declare detectedAt: DateTime

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column()
  declare status: SignalStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => AlertModel, {
    foreignKey: 'signalId',
  })
  declare alerts: HasMany<typeof AlertModel>
}
