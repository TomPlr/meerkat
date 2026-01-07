/**
 * User preferences value object
 */
export class UserPreferences {
  constructor(
    public readonly riskProfile?: 'conservative' | 'moderate' | 'aggressive',
    public readonly alertThresholds?: {
      healthFactor?: number
      priceChange?: number
    },
    public readonly activeSignals?: string[],
    public readonly notificationChannels?: ('telegram' | 'email' | 'in_app')[]
  ) {}

  static fromJSON(data: Record<string, any>): UserPreferences {
    return new UserPreferences(
      data.riskProfile,
      data.alertThresholds,
      data.activeSignals,
      data.notificationChannels
    )
  }

  toJSON(): Record<string, any> {
    return {
      ...(this.riskProfile && { riskProfile: this.riskProfile }),
      ...(this.alertThresholds && { alertThresholds: this.alertThresholds }),
      ...(this.activeSignals && { activeSignals: this.activeSignals }),
      ...(this.notificationChannels && { notificationChannels: this.notificationChannels }),
    }
  }
}

/**
 * User domain entity
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly walletAddress: string,
    public readonly preferences: UserPreferences | null,
    public readonly telegramChatId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Check if user has Telegram notifications enabled
   */
  hasTelegramEnabled(): boolean {
    return this.telegramChatId !== null
  }

  /**
   * Get health factor alert threshold
   */
  getHealthFactorThreshold(): number {
    return this.preferences?.alertThresholds?.healthFactor ?? 1.5
  }

  /**
   * Check if a notification channel is enabled
   */
  hasChannelEnabled(channel: 'telegram' | 'email' | 'in_app'): boolean {
    return this.preferences?.notificationChannels?.includes(channel) ?? false
  }
}
