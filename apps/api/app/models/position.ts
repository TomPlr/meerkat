import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import UserModel from './user.js'

export type Asset = {
  symbol: string
  amount: string
  valueUSD: string
  address?: string
}

export type PositionMetadata = {
  ltv?: string
  liquidationThreshold?: string
  availableBorrowsUSD?: string
  totalCollateralUSD?: string
  totalDebtUSD?: string
  [key: string]: any
}

export default class PositionModel extends BaseModel {
  static table = 'positions'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare walletAddress: string

  @column()
  declare protocol: string

  @column()
  declare chainId: number

  @column({
    prepare: (value: number | null) => (value !== null ? value.toString() : null),
    consume: (value: string | null) => (value !== null ? Number(value) : null),
  })
  declare healthFactor: number | null

  @column({
    prepare: (value: Asset[]) => JSON.stringify(value),
    consume: (value: string | Asset[]) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare collateral: Asset[]

  @column({
    prepare: (value: Asset[]) => JSON.stringify(value),
    consume: (value: string | Asset[]) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare debt: Asset[]

  @column({
    prepare: (value: PositionMetadata | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | null) => (value ? JSON.parse(value) : null),
  })
  declare metadata: PositionMetadata | null

  @column.dateTime()
  declare snapshotAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => UserModel, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof UserModel>
}
