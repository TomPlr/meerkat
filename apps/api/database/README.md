# Database Schema Documentation

## Overview

This directory contains the Lucid ORM migrations and schema definitions for the DeFi Assistant API. The schema follows a phased approach, with core MVP entities ready to use and future entities prepared for later phases.

## Directory Structure

```
database/
└── migrations/           # Lucid migration files
    ├── 1_create_users_table.ts
    ├── 2_create_signals_table.ts
    ├── 3_create_positions_table.ts
    ├── 4_create_alerts_table.ts
    ├── 5_create_intents_table.ts
    └── 6_create_event_store_table.ts
```

## Lucid Models

Models are located in `app/infrastructure/database/models/`:

```
app/infrastructure/database/models/
├── index.ts              # Model exports
├── user.ts               # User model
├── position.ts           # Position model
├── signal.ts             # Signal model
├── alert.ts              # Alert model
├── intent.ts             # Intent model (Phase 5+)
└── event_store.ts        # Event store model (Phase 5+)
```

## Schema Overview

### Core Entities (Phase 0-2) - Ready to Use

#### `UserModel`
User accounts and preferences.

**Fields:**
- `id` - UUID primary key
- `walletAddress` - Ethereum address (unique, indexed)
- `preferences` - JSONB for flexible user settings
  - `riskProfile`: 'conservative' | 'moderate' | 'aggressive'
  - `alertThresholds`: Custom threshold settings
  - `activeSignals`: Array of enabled signal types
  - `notificationChannels`: Preferred notification methods
- `telegramChatId` - Telegram bot integration
- `createdAt`, `updatedAt` - Timestamps

#### `PositionModel`
DeFi position snapshots over time.

**Fields:**
- `id` - UUID primary key
- `userId` - Foreign key to users (cascade delete)
- `walletAddress` - User's wallet address (indexed)
- `protocol` - Protocol name ('aave', 'compound', etc.)
- `chainId` - Blockchain network (default: 1 for mainnet)
- `healthFactor` - Current health factor
- `collateral` - JSONB array of Asset objects
- `debt` - JSONB array of Asset objects
- `metadata` - JSONB for protocol-specific data (LTV, thresholds, etc.)
- `snapshotAt` - When this snapshot was taken
- `createdAt`, `updatedAt` - Timestamps

**Indexes:**
- `(userId, snapshotAt DESC)` - Get latest position per user
- `(walletAddress, protocol)` - Query by wallet + protocol

#### `SignalModel`
Market signals and trading indicators.

**Fields:**
- `id` - UUID primary key
- `type` - Signal type ('funding_rate', 'whale_movement', etc.)
- `asset` - Asset symbol ('AAVE', 'ETH', etc.)
- `severity` - 'low' | 'medium' | 'high' | 'critical'
- `data` - JSONB signal-specific data (value, percentile, metadata)
- `detectedAt` - When signal was detected
- `expiresAt` - Optional expiration time
- `status` - 'active' | 'expired' | 'acknowledged'
- `createdAt` - Timestamp

**Indexes:**
- `(type, detectedAt DESC)` - Recent signals by type
- `(asset, status)` - Active signals per asset
- `(status, detectedAt DESC)` - All active signals

#### `AlertModel`
User notifications and alerts.

**Fields:**
- `id` - UUID primary key
- `userId` - Foreign key to users (cascade delete)
- `signalId` - Optional foreign key to signals (set null on delete)
- `type` - Alert type ('health_factor_critical', 'signal_detected', etc.)
- `channel` - Delivery channel ('telegram', 'email', 'in_app')
- `message` - Alert message text
- `metadata` - JSONB for additional context
- `sentAt` - When alert was sent
- `acknowledgedAt` - When user acknowledged
- `status` - 'pending' | 'sent' | 'failed' | 'acknowledged'
- `createdAt` - Timestamp

**Indexes:**
- `(userId, status, createdAt DESC)` - User's pending alerts
- `(status, createdAt DESC)` - Global pending alerts

### Future Entities

#### `IntentModel` (Phase 5+)
Autonomous action intents.

**Purpose:** Enable users to create conditional actions like "If HF < 1.2, repay 1000 USDT"

#### `EventStoreModel` (Phase 5+)
Event Store for Event Sourcing.

**Purpose:** Complete audit trail, time-travel debugging, ML training data

## Database Setup

### 1. Create Database

```bash
# Using docker-compose (recommended for local dev)
docker-compose up -d

# Or manually
createdb defi_assistant
```

### 2. Configure Environment

Create `.env` file in `apps/api/`:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=defi_assistant
```

### 3. Run Migrations

```bash
cd apps/api
pnpm db:migrate
```

### 4. Rollback Migrations (if needed)

```bash
pnpm db:migrate:rollback
```

### 5. Fresh Migration (reset all)

```bash
pnpm db:migrate:fresh
```

## Usage Examples

### Using Lucid Models

```typescript
import { UserModel, PositionModel, SignalModel, AlertModel } from '#app/infrastructure/database/models'

// Create a user
const user = await UserModel.create({
  walletAddress: '0x1234...',
  preferences: {
    riskProfile: 'moderate',
    alertThresholds: { healthFactor: 1.5 },
    notificationChannels: ['telegram', 'in_app']
  }
})

// Create a position
const position = await PositionModel.create({
  userId: user.id,
  walletAddress: '0x1234...',
  protocol: 'aave',
  chainId: 1,
  healthFactor: 2.5,
  collateral: [
    { symbol: 'ETH', amount: '1.5', valueUSD: '3000' }
  ],
  debt: [
    { symbol: 'USDC', amount: '1500', valueUSD: '1500' }
  ],
  metadata: {
    ltv: '0.5',
    liquidationThreshold: '0.825'
  },
  snapshotAt: DateTime.now()
})
```

### Querying Data

```typescript
// Get latest position for a user
const latestPosition = await PositionModel.query()
  .where('userId', userId)
  .orderBy('snapshotAt', 'desc')
  .first()

// Get active signals for an asset
const activeSignals = await SignalModel.query()
  .where('asset', 'AAVE')
  .where('status', 'active')

// Get pending alerts for a user with preloaded signal
const pendingAlerts = await AlertModel.query()
  .where('userId', userId)
  .where('status', 'pending')
  .preload('signal')
  .orderBy('createdAt', 'desc')
```

### Using Relations

```typescript
// Load user with positions
const user = await UserModel.query()
  .where('id', userId)
  .preload('positions')
  .first()

// Access positions
user.positions.forEach(position => {
  console.log(position.protocol, position.healthFactor)
})
```

## Migration Commands

| Command | Description |
|---------|-------------|
| `pnpm db:migrate` | Run pending migrations |
| `pnpm db:migrate:rollback` | Rollback last batch of migrations |
| `pnpm db:migrate:fresh` | Drop all tables and re-run migrations |
| `pnpm db:make:migration` | Create a new migration file |
| `pnpm db:make:model` | Create a new Lucid model |
| `pnpm db:seed` | Run database seeders |

## Type Safety

All models export TypeScript types:

```typescript
import UserModel from '#app/infrastructure/database/models/user'
import type { UserPreferences } from '#app/infrastructure/database/models/user'

// Creating with type safety
const user = await UserModel.create({
  walletAddress: '0x...',
  preferences: { riskProfile: 'moderate' } satisfies UserPreferences
})
```

## Best Practices

1. **Use JSONB wisely**: It's flexible but harder to query. Use for truly dynamic data.
2. **Always use transactions** for multi-step operations via `Database.transaction()`
3. **Index foreign keys** for join performance
4. **Snapshot positions regularly** to track changes over time
5. **Clean up expired signals** periodically
6. **Archive old events** if using event store
7. **Use preload** for eager loading relations to avoid N+1 queries

## Troubleshooting

### Migration Issues

```bash
# Check migration status
node ace migration:status

# Reset and re-run all migrations
pnpm db:migrate:fresh
```

### Connection Issues

```bash
# Verify database is running
docker-compose ps

# Check connection
psql -h localhost -U postgres -d defi_assistant
```

## Resources

- [Lucid ORM Docs](https://docs.adonisjs.com/guides/database/introduction)
- [Lucid Models](https://docs.adonisjs.com/guides/database/lucid)
- [Lucid Migrations](https://docs.adonisjs.com/guides/database/migrations)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
