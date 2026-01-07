import { Position } from '#app/domain/position'

/**
 * Protocol Adapter Interface (Port in Hexagonal Architecture)
 * Implementations will be created for Aave, Compound, Morpho, etc.
 */
export interface ProtocolAdapter {
  /**
   * Get the protocol name
   */
  readonly protocolName: string

  /**
   * Fetch the current position for a given wallet address
   */
  getPosition(walletAddress: string): Promise<Position | null>

  /**
   * Calculate what the health factor would be after a price change
   */
  simulatePriceChange(position: Position, asset: string, percentChange: number): Promise<number>

  /**
   * Calculate what the health factor would be after a deposit
   */
  simulateDeposit(position: Position, asset: string, amount: number): Promise<number>

  /**
   * Calculate what the health factor would be after a withdrawal
   */
  simulateWithdraw(position: Position, asset: string, amount: number): Promise<number>

  /**
   * Calculate what the health factor would be after borrowing
   */
  simulateBorrow(position: Position, asset: string, amount: number): Promise<number>

  /**
   * Calculate what the health factor would be after repaying
   */
  simulateRepay(position: Position, asset: string, amount: number): Promise<number>
}
