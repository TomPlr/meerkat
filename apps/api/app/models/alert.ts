import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import UserModel from './user.js'
import SignalModel from './signal.js'

export type AlertMetadata = {
  positionId?: string
  healthFactor?: number
  signalType?: string
  [key: string]: any
}

export type AlertChannel = 'telegram' | 'email' | 'in_app'
export type AlertStatus = 'pending' | 'sent' | 'failed' | 'acknowledged'

export default class AlertModel extends BaseModel {
  static table = 'alerts'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare signalId: string | null

  @column()
  declare type: string

  @column()
  declare channel: AlertChannel

  @column()
  declare message: string

  @column({
    prepare: (value: AlertMetadata | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => (value ? JSON.parse(value) : null),
  })
  declare metadata: AlertMetadata | null

  @column.dateTime()
  declare sentAt: DateTime | null

  @column.dateTime()
  declare acknowledgedAt: DateTime | null

  @column()
  declare status: AlertStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => UserModel, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof UserModel>

  @belongsTo(() => SignalModel, {
    foreignKey: 'signalId',
  })
  declare signal: BelongsTo<typeof SignalModel>
}
