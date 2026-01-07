import { Asset, Position, PositionMetadata } from '#app/domain/position'
import PositionModel from '#models/position'
import { DateTime } from 'luxon'

/**
 * Repository for Position persistence using Lucid ORM
 */
export class PositionRepository {
  /**
   * Find position by ID
   */
  async findById(id: string): Promise<Position | null> {
    const record = await PositionModel.find(id)

    if (!record) return null

    return this.toDomain(record)
  }

  /**
   * Find positions by user ID
   */
  async findByUserId(userId: string): Promise<Position[]> {
    const records = await PositionModel.query().where('userId', userId)

    return records.map((record) => this.toDomain(record))
  }

  /**
   * Find positions by wallet address
   */
  async findByWalletAddress(walletAddress: string): Promise<Position[]> {
    const records = await PositionModel.query().where('walletAddress', walletAddress)

    return records.map((record) => this.toDomain(record))
  }

  /**
   * Find latest position for a wallet and protocol
   */
  async findLatestByWalletAndProtocol(
    walletAddress: string,
    protocol: string
  ): Promise<Position | null> {
    const record = await PositionModel.query()
      .where('walletAddress', walletAddress)
      .where('protocol', protocol)
      .orderBy('snapshotAt', 'desc')
      .first()

    if (!record) return null

    return this.toDomain(record)
  }

  /**
   * Save or update a position
   */
  async save(position: Position): Promise<void> {
    const existing = await PositionModel.find(position.id)

    if (existing) {
      existing.merge({
        userId: position.userId,
        protocol: position.protocol,
        walletAddress: position.walletAddress,
        chainId: position.chainId,
        healthFactor: position.healthFactor,
        collateral: position.collateral,
        debt: position.debt,
        metadata: position.metadata,
        snapshotAt: DateTime.fromJSDate(position.snapshotAt),
      })
      await existing.save()
    } else {
      await PositionModel.create({
        id: position.id,
        userId: position.userId,
        protocol: position.protocol,
        walletAddress: position.walletAddress,
        chainId: position.chainId,
        healthFactor: position.healthFactor,
        collateral: position.collateral,
        debt: position.debt,
        metadata: position.metadata,
        snapshotAt: DateTime.fromJSDate(position.snapshotAt),
      })
    }
  }

  /**
   * Delete a position
   */
  async delete(id: string): Promise<void> {
    const record = await PositionModel.find(id)
    if (record) {
      await record.delete()
    }
  }

  /**
   * Delete all positions for a user
   */
  async deleteByUserId(userId: string): Promise<void> {
    await PositionModel.query().where('userId', userId).delete()
  }

  /**
   * Convert Lucid model to domain entity
   */
  private toDomain(record: PositionModel): Position {
    return new Position(
      record.id,
      record.userId,
      record.protocol,
      record.walletAddress,
      record.chainId,
      record.healthFactor ?? 0,
      record.collateral as Asset[],
      record.debt as Asset[],
      record.metadata as PositionMetadata | null,
      record.snapshotAt.toJSDate(),
      record.createdAt.toJSDate(),
      record.updatedAt.toJSDate()
    )
  }
}
