/**
 * Asset value object representing a crypto asset in a position
 */
export class Asset {
  constructor(
    public readonly symbol: string,
    public readonly amount: string,
    public readonly valueUSD: string,
    public readonly address?: string
  ) {}

  static fromJSON(data: {
    symbol: string
    amount: string
    valueUSD: string
    address?: string
  }): Asset {
    return new Asset(data.symbol, data.amount, data.valueUSD, data.address)
  }

  toJSON() {
    return {
      symbol: this.symbol,
      amount: this.amount,
      valueUSD: this.valueUSD,
      ...(this.address && { address: this.address }),
    }
  }
}

/**
 * Position metadata value object
 */
export class PositionMetadata {
  constructor(
    public readonly ltv?: string,
    public readonly liquidationThreshold?: string,
    public readonly availableBorrowsUSD?: string,
    public readonly totalCollateralUSD?: string,
    public readonly totalDebtUSD?: string,
    public readonly additionalData?: Record<string, any>
  ) {}

  static fromJSON(data: Record<string, any>): PositionMetadata {
    return new PositionMetadata(
      data.ltv,
      data.liquidationThreshold,
      data.availableBorrowsUSD,
      data.totalCollateralUSD,
      data.totalDebtUSD,
      data
    )
  }

  toJSON(): Record<string, any> {
    return {
      ...(this.ltv && { ltv: this.ltv }),
      ...(this.liquidationThreshold && { liquidationThreshold: this.liquidationThreshold }),
      ...(this.availableBorrowsUSD && { availableBorrowsUSD: this.availableBorrowsUSD }),
      ...(this.totalCollateralUSD && { totalCollateralUSD: this.totalCollateralUSD }),
      ...(this.totalDebtUSD && { totalDebtUSD: this.totalDebtUSD }),
      ...this.additionalData,
    }
  }
}

/**
 * Position domain entity representing a user's DeFi position
 */
export class Position {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly protocol: string,
    public readonly walletAddress: string,
    public readonly chainId: number,
    public readonly healthFactor: number | null,
    public readonly collateral: Asset[],
    public readonly debt: Asset[],
    public readonly metadata: PositionMetadata | null,
    public readonly snapshotAt: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if position is at risk (health factor below threshold)
   */
  isAtRisk(threshold: number = 1.5): boolean {
    return this.healthFactor !== null && this.healthFactor < threshold
  }

  /**
   * Check if position is near liquidation
   */
  isNearLiquidation(threshold: number = 1.1): boolean {
    return this.healthFactor !== null && this.healthFactor < threshold
  }

  /**
   * Get total collateral value in USD
   */
  getTotalCollateralUSD(): number {
    return this.collateral.reduce((sum, asset) => sum + Number.parseFloat(asset.valueUSD), 0)
  }

  /**
   * Get total debt value in USD
   */
  getTotalDebtUSD(): number {
    return this.debt.reduce((sum, asset) => sum + Number.parseFloat(asset.valueUSD), 0)
  }

  /**
   * Calculate current LTV (Loan-to-Value) ratio
   */
  calculateLTV(): number | null {
    const totalCollateral = this.getTotalCollateralUSD()
    if (totalCollateral === 0) return null

    const totalDebt = this.getTotalDebtUSD()
    return (totalDebt / totalCollateral) * 100
  }
}
