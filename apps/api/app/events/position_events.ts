import type { DomainEvent } from './base.js'

/**
 * Event emitted when a wallet is connected
 */
export interface WalletConnectedEvent extends DomainEvent {
  type: 'WalletConnected'
  aggregateType: 'position'
  data: {
    walletAddress: string
    userId: string
  }
}

/**
 * Event emitted when a position is loaded/updated
 */
export interface PositionUpdatedEvent extends DomainEvent {
  type: 'PositionUpdated'
  aggregateType: 'position'
  data: {
    positionId: string
    userId: string
    protocol: string
    healthFactor: number
    collateralUsd: number
    borrowedUsd: number
    liquidationPrice?: number
  }
}

/**
 * Event emitted when health factor becomes critical
 */
export interface HealthFactorCriticalEvent extends DomainEvent {
  type: 'HealthFactorCritical'
  aggregateType: 'position'
  data: {
    positionId: string
    userId: string
    healthFactor: number
    threshold: number
  }
}

/**
 * Helper function to create WalletConnected event
 */
export function createWalletConnectedEvent(
  walletAddress: string,
  userId: string
): WalletConnectedEvent {
  return {
    type: 'WalletConnected',
    aggregateId: userId,
    aggregateType: 'position',
    occurredAt: new Date(),
    data: { walletAddress, userId },
  }
}

/**
 * Helper function to create PositionUpdated event
 */
export function createPositionUpdatedEvent(
  positionId: string,
  userId: string,
  positionData: {
    protocol: string
    healthFactor: number
    collateralUsd: number
    borrowedUsd: number
    liquidationPrice?: number
  }
): PositionUpdatedEvent {
  return {
    type: 'PositionUpdated',
    aggregateId: positionId,
    aggregateType: 'position',
    occurredAt: new Date(),
    data: {
      positionId,
      userId,
      ...positionData,
    },
  }
}

/**
 * Helper function to create HealthFactorCritical event
 */
export function createHealthFactorCriticalEvent(
  positionId: string,
  userId: string,
  healthFactor: number,
  threshold: number = 1.5
): HealthFactorCriticalEvent {
  return {
    type: 'HealthFactorCritical',
    aggregateId: positionId,
    aggregateType: 'position',
    occurredAt: new Date(),
    data: {
      positionId,
      userId,
      healthFactor,
      threshold,
    },
  }
}
