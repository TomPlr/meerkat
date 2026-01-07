# CLAUDE.md - API Backend

This file provides guidance to Claude Code when working with the AdonisJS 6 API backend.

## Project Overview

DeFi Assistant API - An AdonisJS 6 backend implementing Event-Driven Architecture + Hexagonal Architecture for a DeFi position management system with AI-powered assistance.

## Development Commands

- `pnpm dev` - Start development server with HMR (`node ace serve --hmr`)
- `pnpm build` - Build for production (`node ace build`)
- `pnpm start` - Start production server
- `pnpm test` - Run Japa tests (`node ace test`)
- `pnpm lint` - Lint with ESLint
- `pnpm typecheck` - Type check with TypeScript

## Tech Stack

### Core Framework
- **AdonisJS 6** - TypeScript-first Node.js framework with MVC structure
- **TypeScript** (strict mode) - Type safety across the stack
- **Node.js** - Runtime environment

### Data & Persistence
- **PostgreSQL** - Primary database for application data
- **Lucid ORM** - AdonisJS's built-in ORM with Active Record pattern
- **Redis** - Cache + Event Bus (Redis Streams)

### Event-Driven Architecture
- **Redis Streams** - Event Bus for async communication (Phase 3+)
- **EventEmitter** - Simple event bus for MVP (Phase 0-2)
- **BullMQ** - Job queue for scheduled tasks and async processing
- **Event Store** - PostgreSQL table for Event Sourcing (Phase 5+)

### Web3 Integration
- **viem** - TypeScript Ethereum library
- **@aave/contract-helpers** - Aave SDK for position reading
- **Alchemy** - RPC provider
- **The Graph** - Blockchain indexing and historical data

### AI & APIs
- **Anthropic API** - Claude for LLM integration
- **Binance API** - Funding rates and market data
- **Coinglass API** - Trading signals
- **Dune Analytics** - On-chain analytics (future)

## Architecture Overview

### Hybrid Pattern: Event-Driven + Hexagonal

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP CONTROLLERS                      │
│              (Entry points for REST API)                 │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      EVENT BUS                           │
│         (Redis Streams + Event Store)                    │
│                                                          │
│  Events: WalletConnected, PositionUpdated,               │
│          SignalDetected, HealthFactorCritical            │
└─────────────────────────┬───────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   POSITION    │ │    SIGNAL     │ │   DECISION    │
│   SERVICE     │ │   SERVICE     │ │   SERVICE     │
│               │ │               │ │               │
│ Event         │ │ Event         │ │ Event         │
│ Handlers      │ │ Handlers      │ │ Handlers      │
└───────────────┘ └───────────────┘ └───────────────┘
        │                 │                 │
        └─────────────────┴─────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│              DOMAIN CORE (Hexagonal)                     │
│                                                          │
│  • Entities: Position, Signal, Intent, Alert             │
│  • Use Cases: AnalyzePosition, DetectSignals             │
│  • Ports: IProtocolAdapter, ISignalProvider              │
└─────────────────────────┬───────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   PROTOCOL    │ │    SIGNAL     │ │      LLM      │
│   ADAPTERS    │ │   ADAPTERS    │ │    ADAPTER    │
│               │ │               │ │               │
│ - Aave        │ │ - Binance     │ │ - Anthropic   │
│ - Compound    │ │ - Coinglass   │ │               │
│ - Morpho      │ │ - TheGraph    │ │               │
└───────────────┘ └───────────────┘ └───────────────┘
```

## Project Structure

```
apps/api/
├── app/                       # AdonisJS App Layer
│   ├── adapters/              # External service adapters (Hexagonal)
│   │   ├── protocols/         # DeFi protocol adapters (Aave, Compound, etc.)
│   │   ├── signals/           # Signal provider adapters (Binance, Coinglass)
│   │   └── llm/              # LLM adapters (Anthropic)
│   │
│   ├── events/                # Domain events
│   │   ├── position/          # Position-related events
│   │   ├── signal/            # Signal-related events
│   │   └── decision/          # Decision-related events
│   │
│   ├── event-bus/             # Event bus implementations
│   │   ├── EventEmitterBus.ts  # Simple event bus (Phase 0-2)
│   │   └── RedisStreamsBus.ts  # Redis Streams (Phase 3+)
│   │
│   ├── listeners/             # Event listeners/handlers
│   │   ├── position/          # Position event handlers
│   │   ├── signal/            # Signal event handlers
│   │   └── decision/          # Decision event handlers
│   │
│   ├── ports/                 # Hexagonal ports (interfaces)
│   │   ├── IProtocolAdapter.ts
│   │   ├── ISignalProvider.ts
│   │   ├── IEventBus.ts
│   │   └── ILLMAdapter.ts
│   │
│   ├── use-cases/             # Business logic use cases
│   │   ├── AnalyzePosition.ts
│   │   ├── DetectSignals.ts
│   │   └── GenerateRecommendation.ts
│   │
│   ├── models/                # Domain models (business logic)
│   │   ├── position.ts        # Position entity
│   │   ├── signal.ts          # Signal entity
│   │   └── intent.ts          # Intent entity
│   │
│   ├── repositories/          # Data access layer
│   │   └── position_repository.ts
│   │
│   ├── infrastructure/        # Infrastructure layer
│   │   └── database/
│   │       └── models/        # Lucid ORM models
│   │           ├── index.ts
│   │           ├── user.ts
│   │           ├── position.ts
│   │           ├── signal.ts
│   │           ├── alert.ts
│   │           ├── intent.ts
│   │           └── event_store.ts
│   │
│   ├── services/              # Application services
│   ├── middleware/            # HTTP middleware
│   ├── validators/            # Request validation
│   └── exceptions/            # Custom exceptions
│
├── database/
│   └── migrations/            # Lucid migration files
│       ├── 1_create_users_table.ts
│       ├── 2_create_signals_table.ts
│       ├── 3_create_positions_table.ts
│       ├── 4_create_alerts_table.ts
│       ├── 5_create_intents_table.ts
│       └── 6_create_event_store_table.ts
│
├── config/                    # Configuration files
│   └── database.ts            # Lucid database config
│
├── start/
│   ├── routes.ts              # Route definitions
│   ├── kernel.ts              # Middleware stack
│   └── env.ts                 # Environment variables validation
│
├── tests/                     # Test suites
│   ├── unit/                  # Unit tests (2s timeout)
│   └── functional/            # Functional tests (30s timeout)
│
└── adonisrc.ts               # AdonisJS configuration
```

**Directory Explanation:**

- **adapters/** - Implements external integrations following Hexagonal Architecture
- **events/** - Domain event definitions (WalletConnected, PositionUpdated, etc.)
- **event-bus/** - Event bus implementations (EventEmitter → Redis Streams migration)
- **listeners/** - Event handlers that react to domain events
- **ports/** - Interface definitions for adapters (IProtocolAdapter, ISignalProvider)
- **use-cases/** - Business logic orchestration (AnalyzePosition, DetectSignals)
- **models/** - Pure domain entities with business methods (no ORM dependencies)
- **repositories/** - Data access abstraction layer (maps Lucid ↔ Domain models)
- **infrastructure/database/models/** - Lucid ORM models with decorators
- **services/** - Application-level services
- **middleware/** - HTTP middleware (auth, cors, etc.)
- **validators/** - Request validation schemas
- **exceptions/** - Custom exception classes

### Architecture Evolution

**Current State** (MVP Phase 0-1):
- Basic folder structure is in place
- Lucid ORM models defined in `infrastructure/database/models/`
- Routes in `start/routes.ts` are minimal (single hello-world endpoint)
- **No HTTP controllers yet** - will be added in Phase 1 when building REST API endpoints

**Planned Evolution:**
- **Phase 0-2**: EventEmitter-based event bus (in-process)
- **Phase 3**: Redis Streams for distributed events
- **Phase 4**: BullMQ for job queues
- **Phase 5+**: Event Store for Event Sourcing

**When to Add Controllers:**
Controllers will be created when implementing REST API endpoints. The event-driven core can exist without HTTP controllers - they're just one way to trigger use cases.

Example controller pattern (when needed):
```typescript
// start/routes.ts
import router from '@adonisjs/core/services/router'
import PositionController from '#controllers/PositionController'

router.get('/positions/:address', [PositionController, 'show'])
router.post('/positions/analyze', [PositionController, 'analyze'])
```

## Code Search Tools

### When to Use grep vs mgrep

**Use grep (or ripgrep) for exact matches:**
- **Symbol tracing** - Finding specific function/class/variable names
- **Refactoring** - Renaming variables, updating imports
- **Regex patterns** - Precise pattern matching
- **Finding exact strings** - Literal text search

**Use mgrep for intent-based semantic search:**
- **Code exploration** - Understanding architecture ("where is event handling?")
- **Feature discovery** - Finding implementations ("how is domain logic organized?")
- **Onboarding** - Learning codebase structure and patterns
- **Conceptual queries** - Natural language questions ("what handles position updates?")

> **Note**: mgrep uses semantic search powered by embeddings to understand code intent and context.
> Learn more: [github.com/mixedbread-ai/mgrep](https://github.com/mixedbread-ai/mgrep)

### Examples

```bash
# grep/ripgrep - Exact symbol/text matches
grep "class Position" app/models/           # Find exact class definition
grep "IProtocolAdapter" app/ports/          # Find interface usage
grep -r "PositionRepository" app/           # Check repository usage
grep "HealthFactorCritical" app/events/     # Find event definition

# mgrep - Intent-based semantic search
mgrep "event bus implementation"            # Explore event system architecture
mgrep "position health factor calculation"  # Discover business logic
mgrep "database migration patterns"         # Understand DB structure
mgrep "dependency injection setup"          # Find DI container/patterns
mgrep "protocol adapter for Aave"           # Locate Aave integration
mgrep "how are domain events handled"       # Natural language queries
mgrep "repository pattern implementation"   # Learn data access patterns

# Combined workflow example
# 1. Use mgrep to discover architecture
mgrep "event-driven position updates"       # → finds event handlers

# 2. Use grep to find all related files
grep -r "PositionUpdated" app/              # → see all event usages
```

### Best Practices

1. **Start with mgrep** for exploration and understanding
2. **Switch to grep** once you know the exact symbol/pattern
3. **Use mgrep for:**
   - "How does X work?"
   - "Where is Y implemented?"
   - "What handles Z?"
   - Architectural understanding
4. **Use grep for:**
   - Finding all usages of a class/function
   - Refactoring symbol names
   - Exact regex patterns
   - Import statements

## AdonisJS 6 Import Aliases

**IMPORTANT**: The API uses import aliases defined in `package.json`:

```typescript
// Domain layer imports
import { Position } from '#models/position'
import { Signal } from '#models/signal'

// Use case imports
import { AnalyzePosition } from '#use-cases/AnalyzePosition'

// Port (interface) imports
import type { IProtocolAdapter } from '#ports/IProtocolAdapter'
import type { IEventBus } from '#ports/IEventBus'

// Adapter imports
import { AaveAdapter } from '#adapters/protocols/aave/AaveAdapter'
import { AnthropicAdapter } from '#adapters/llm/AnthropicAdapter'

// Event imports
import { WalletConnected } from '#events/position/WalletConnected'
import { PositionUpdated } from '#events/position/PositionUpdated'

// Event bus imports
import { EventEmitterBus } from '#event-bus/EventEmitterBus'

// Repository imports
import { PositionRepository } from '#repositories/position_repository'

// Infrastructure layer imports (Lucid ORM models)
import UserModel from '#app/infrastructure/database/models/user'
import PositionModel from '#app/infrastructure/database/models/position'

// Service imports
import AuthService from '#services/AuthService'

// Middleware imports
import AuthMiddleware from '#middleware/AuthMiddleware'

// Validator imports
import { loginValidator } from '#validators/auth'

// Config imports
import { appConfig } from '#config/app'

// Start imports
import routes from '#start/routes'

// Exception imports
import HttpExceptionHandler from '#exceptions/HttpExceptionHandler'
```

**Alias Mappings**:
- `#models/*` → `./app/models/*.js`
- `#use-cases/*` → `./app/use-cases/*.js`
- `#ports/*` → `./app/ports/*.js`
- `#adapters/*` → `./app/adapters/*.js`
- `#events/*` → `./app/events/*.js`
- `#event-bus/*` → `./app/event-bus/*.js`
- `#listeners/*` → `./app/listeners/*.js`
- `#repositories/*` → `./app/repositories/*.js`
- `#services/*` → `./app/services/*.js`
- `#middleware/*` → `./app/middleware/*.js`
- `#validators/*` → `./app/validators/*.js`
- `#exceptions/*` → `./app/exceptions/*.js`
- `#config/*` → `./config/*.js`
- `#start/*` → `./start/*.js`
- `#app/*` → `./app/*.js` (for infrastructure layer)

## Database Layer

### Lucid ORM Models vs Domain Models

This project separates concerns between:

1. **Domain Models** (`app/models/`) - Pure business logic entities
   - No ORM dependencies
   - Contains business methods like `isAtRisk()`, `getLTV()`
   - Example: `Position` class in `app/models/position.ts`

2. **Lucid Models** (`app/infrastructure/database/models/`) - ORM/persistence layer
   - Lucid ORM decorators and column definitions
   - Database relationships
   - Example: `PositionModel` in `app/infrastructure/database/models/position.ts`

3. **Repositories** (`app/repositories/`) - Data access abstraction
   - Maps between Lucid models and domain entities
   - Provides query methods
   - Example: `PositionRepository`

### Database Commands

```bash
# Run migrations
pnpm db:migrate

# Rollback last migration batch
pnpm db:migrate:rollback

# Fresh migration (drop all + re-run)
pnpm db:migrate:fresh

# Create new migration
pnpm db:make:migration <name>

# Create new model
pnpm db:make:model <name>

# Run seeds
pnpm db:seed
```

### Lucid ORM Best Practices

```typescript
// Importing Lucid models
import UserModel from '#app/infrastructure/database/models/user'
import PositionModel from '#app/infrastructure/database/models/position'

// Creating records
const user = await UserModel.create({
  walletAddress: '0x123...',
  preferences: { riskProfile: 'moderate' }
})

// Querying with relations
const userWithPositions = await UserModel.query()
  .where('id', userId)
  .preload('positions')
  .first()

// Using transactions
import db from '@adonisjs/lucid/services/db'

await db.transaction(async (trx) => {
  const user = await UserModel.create({ ... }, { client: trx })
  await PositionModel.create({ userId: user.id, ... }, { client: trx })
})
```

### Repository Pattern

**See actual implementation:** `app/repositories/position_repository.ts`

```typescript
// app/repositories/position_repository.ts
import { Asset, Position, PositionMetadata } from '#app/domain/position'
import PositionModel from '#models/position'
import { DateTime } from 'luxon'

export class PositionRepository {
  async findById(id: string): Promise<Position | null> {
    const record = await PositionModel.find(id)
    if (!record) return null
    return this.toDomain(record)
  }

  async findByWalletAddress(walletAddress: string): Promise<Position[]> {
    const records = await PositionModel.query().where('walletAddress', walletAddress)
    return records.map((record) => this.toDomain(record))
  }

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
```

## Domain Events Catalog

### Position Events

| Event | Trigger | Payload | Handlers |
|-------|---------|---------|----------|
| `WalletConnected` | User connects wallet | `{ address }` | OnWalletConnected |
| `PositionLoaded` | Position retrieved | `{ position }` | OnPositionLoaded |
| `PositionUpdated` | Prices change | `{ position, changes }` | OnPositionUpdated |
| `HealthFactorCritical` | HF < threshold | `{ position, hf }` | OnHealthFactorCritical |

### Signal Events

| Event | Trigger | Payload | Handlers |
|-------|---------|---------|----------|
| `SignalDetected` | Threshold crossed | `{ signal, severity }` | OnSignalDetected |
| `SignalExpired` | Signal no longer valid | `{ signal }` | OnSignalExpired |
| `MultipleSignalsConverge` | Multiple correlated signals | `{ signals }` | OnMultipleSignalsConverge |

### Decision Events

| Event | Trigger | Payload | Handlers |
|-------|---------|---------|----------|
| `UserMessageReceived` | User sends chat message | `{ message, context }` | OnUserMessageReceived |
| `DecisionRequired` | LLM needs context | `{ context }` | OnDecisionRequired |
| `RecommendationGenerated` | LLM completes analysis | `{ recommendation }` | OnRecommendationGenerated |
| `AlertGenerated` | Action recommended | `{ alert, priority }` | OnAlertGenerated |

### Intent Events (Phase 5)

| Event | Trigger | Payload | Handlers |
|-------|---------|---------|----------|
| `IntentRegistered` | User creates intent | `{ intent }` | OnIntentRegistered |
| `IntentTriggered` | Condition met | `{ intent }` | OnIntentTriggered |
| `ActionExecuted` | Transaction signed | `{ intent, result }` | OnActionExecuted |

## Implementation Patterns

### Entity Pattern

**See actual implementation:** `app/domain/position.ts`

```typescript
// app/domain/position.ts
export class Position {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly protocol: string,
    public readonly walletAddress: string,
    public readonly chainId: number,
    public healthFactor: number | null,
    public collateral: Asset[],
    public debt: Asset[],
    public metadata: PositionMetadata | null,
    public readonly snapshotAt: Date,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Check if position is at risk based on health factor threshold
   */
  isAtRisk(threshold: number = 1.5): boolean {
    return this.healthFactor !== null && this.healthFactor < threshold
  }

  /**
   * Calculate Loan-to-Value ratio
   */
  calculateLTV(): number | null {
    const totalCollateral = this.getTotalCollateralUSD()
    if (totalCollateral === 0) return null

    const totalDebt = this.getTotalDebtUSD()
    return (totalDebt / totalCollateral) * 100
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
   * Calculate liquidation price for a specific collateral asset
   */
  calculateLiquidationPrice(assetSymbol: string): number | null {
    const asset = this.collateral.find((a) => a.symbol === assetSymbol)
    if (!asset || this.healthFactor === null) return null

    // Simplified calculation - actual implementation depends on protocol
    const totalDebt = this.getTotalDebtUSD()
    const assetAmount = Number.parseFloat(asset.amount)

    if (assetAmount === 0) return null

    return totalDebt / assetAmount
  }
}
```

### Use Case Pattern

```typescript
// app/use-cases/AnalyzePosition.ts
import type { IProtocolAdapter } from '#ports/IProtocolAdapter'
import type { IEventBus } from '#ports/IEventBus'
import { HealthFactorCritical } from '#events/position/HealthFactorCritical'

export class AnalyzePosition {
  constructor(
    private protocolAdapter: IProtocolAdapter,
    private eventBus: IEventBus
  ) {}

  async execute(address: string): Promise<Analysis> {
    const position = await this.protocolAdapter.getPosition(address)

    if (position.isAtRisk()) {
      await this.eventBus.publish(
        new HealthFactorCritical({ position })
      )
    }

    return this.buildAnalysis(position)
  }
}
```

### Event Handler Pattern

```typescript
// app/listeners/position/OnWalletConnected.ts
import type { IEventBus } from '#ports/IEventBus'
import { AnalyzePosition } from '#use-cases/AnalyzePosition'
import { WalletConnected } from '#events/position/WalletConnected'
import { PositionLoaded } from '#events/position/PositionLoaded'
import { PositionLoadFailed } from '#events/position/PositionLoadFailed'

export class OnWalletConnected implements EventHandler<WalletConnected> {
  constructor(
    private analyzePosition: AnalyzePosition,
    private eventBus: IEventBus
  ) {}

  async handle(event: WalletConnected): Promise<void> {
    try {
      const analysis = await this.analyzePosition.execute(event.address)
      await this.eventBus.publish(new PositionLoaded({ analysis }))
    } catch (error) {
      await this.eventBus.publish(
        new PositionLoadFailed({ address: event.address, error })
      )
    }
  }
}
```

### Adapter Pattern

```typescript
// app/adapters/protocols/aave/AaveAdapter.ts
import type { IProtocolAdapter } from '#ports/IProtocolAdapter'
import { Position } from '#models/position'
import type { Provider } from 'viem'
import { AaveSDK } from '@aave/contract-helpers'

export class AaveAdapter implements IProtocolAdapter {
  constructor(
    private aaveSDK: AaveSDK,
    private rpcProvider: Provider
  ) {}

  async getPosition(address: string): Promise<Position> {
    const data = await this.aaveSDK.getUserAccountData(address)
    return new Position(
      address,
      'aave',
      this.parseCollateral(data),
      this.parseDebt(data),
      this.calculateHF(data)
    )
  }

  private parseCollateral(data: any) {
    // Implementation
  }

  private parseDebt(data: any) {
    // Implementation
  }

  private calculateHF(data: any): number {
    // Implementation
  }
}
```

## Testing Strategies

### Unit Tests (Domain Layer)

```typescript
// tests/unit/models/position.spec.ts
import { test } from '@japa/runner'
import { Position } from '#models/position'

test.group('Position', () => {
  test('should identify at-risk position', ({ assert }) => {
    const position = new Position(
      'id-1',
      'user-1',
      'aave',
      '0x123',
      1,
      1.2, // Low health factor
      [{ symbol: 'ETH', amount: '1', valueUSD: '2000' }],
      [{ symbol: 'USDC', amount: '1500', valueUSD: '1500' }],
      null,
      new Date()
    )

    assert.isTrue(position.isAtRisk())
  })
})
```

### Integration Tests (Repositories)

```typescript
// tests/functional/repositories/position_repository.spec.ts
import { test } from '@japa/runner'
import { PositionRepository } from '#repositories/position_repository'

test.group('PositionRepository', (group) => {
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('should save and retrieve position', async ({ assert }) => {
    const repository = new PositionRepository()
    // ... test implementation
  })
})
```

## Environment Configuration

Create `.env` file in `apps/api/`:

```bash
# Application
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=your_app_key_here

# Database (Lucid)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=defi_assistant

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Blockchain RPC
ALCHEMY_API_KEY=your_alchemy_key
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}

# APIs
ANTHROPIC_API_KEY=your_anthropic_key
BINANCE_API_KEY=
BINANCE_API_SECRET=
COINGLASS_API_KEY=

# Telegram (optional)
TELEGRAM_BOT_TOKEN=
```

## Code Quality Standards

### Type Safety

- Use TypeScript strict mode (enabled in `tsconfig.json`)
- Avoid `any` type - use `unknown` if type is truly unknown
- Define domain types explicitly (no implicit any)

### Dependency Injection

```typescript
// Good: Inject dependencies via constructor (loosely coupled, testable)
import type { IProtocolAdapter } from '#ports/IProtocolAdapter'
import type { IEventBus } from '#ports/IEventBus'

class AnalyzePosition {
  constructor(
    private adapter: IProtocolAdapter,  // Interface, not concrete implementation
    private eventBus: IEventBus
  ) {}
}

// Usage: Inject concrete implementations
import { AaveAdapter } from '#adapters/protocols/aave/AaveAdapter'
import { EventEmitterBus } from '#event-bus/EventEmitterBus'

const aaveAdapter = new AaveAdapter(aaveSDK, rpcProvider)
const eventBus = new EventEmitterBus()
const analyzePosition = new AnalyzePosition(aaveAdapter, eventBus)
```

### Error Handling

```typescript
// Use specific errors
export class PositionNotFoundError extends Error {
  constructor(public address: string) {
    super(`Position not found for address: ${address}`)
    this.name = 'PositionNotFoundError'
  }
}
```

## Common Patterns & Anti-Patterns

### DO ✅

```typescript
// 1. Use dependency injection with interfaces
import type { IProtocolAdapter } from '#ports/IProtocolAdapter'

class AnalyzePosition {
  constructor(private adapter: IProtocolAdapter) {}
}

// 2. Keep domain models pure (no dependencies)
import { Position } from '#models/position'

class Position {
  isAtRisk(): boolean {
    return this.healthFactor < 1.5
  }

  getLTV(): number {
    return (this.totalDebtUsd / this.totalCollateralUsd) * 100
  }
}

// 3. Use event-driven communication
import { PositionUpdated } from '#events/position/PositionUpdated'
import type { IEventBus } from '#ports/IEventBus'

await eventBus.publish(new PositionUpdated({ position }))

// 4. Separate concerns (Repository pattern)
import { PositionRepository } from '#repositories/position_repository'

const repository = new PositionRepository()
await repository.save(position)  // Repository handles persistence
```

### DON'T ❌

```typescript
// 1. Direct instantiation of concrete classes
import { AaveAdapter } from '#adapters/protocols/aave/AaveAdapter'

class AnalyzePosition {
  private adapter = new AaveAdapter()  // ❌ Hard to test, tightly coupled
}

// 2. Side effects in domain entities
class Position {
  async save() {  // ❌ Entity shouldn't know about database
    await db.save(this)
  }

  async fetchLatestPrice() {  // ❌ Entity shouldn't make API calls
    return await fetch('/api/price')
  }
}

// 3. Business logic in adapters
class AaveAdapter {
  async getPosition(address: string) {
    const data = await this.aaveSDK.getUserAccountData(address)

    // ❌ Don't put business logic here
    if (data.healthFactor < 1.5) {
      await this.sendAlert(address)
    }

    return data
  }
}

// 4. Skip event bus for domain events
class PositionService {
  async updatePosition(id: string) {
    await db.update(id)
    await this.notificationService.notify()  // ❌ Direct coupling
  }
}
```

## AdonisJS 6 Best Practices

### HTTP Controllers

```typescript
// ✅ GOOD: Use dependency injection, thin controllers
import type { HttpContext } from '@adonisjs/core/http'
import { AnalyzePosition } from '#use-cases/AnalyzePosition'
import { inject } from '@adonisjs/core'

@inject()
export default class PositionController {
  constructor(private analyzePosition: AnalyzePosition) {}

  async show({ params, response }: HttpContext) {
    const analysis = await this.analyzePosition.execute(params.address)
    return response.ok(analysis)
  }
}

// ❌ BAD: Business logic in controller
export default class PositionController {
  async show({ params, response }: HttpContext) {
    const position = await this.fetchFromAave(params.address) // ❌ Adapter call
    if (position.healthFactor < 1.5) { // ❌ Business logic
      await this.sendAlert(position) // ❌ Side effects
    }
    return response.ok(position)
  }
}
```

### Lucid ORM Best Practices

```typescript
// ✅ GOOD: Use transactions for multiple operations
import db from '@adonisjs/lucid/services/db'

const trx = await db.transaction()
try {
  const user = await UserModel.create({ ... }, { client: trx })
  await PositionModel.create({ userId: user.id }, { client: trx })
  await trx.commit()
} catch (error) {
  await trx.rollback()
  throw error
}

// ✅ GOOD: Eager load relationships to avoid N+1 queries
const users = await UserModel.query()
  .preload('positions', (query) => {
    query.where('healthFactor', '<', 1.5)
  })
  .preload('alerts')

// ❌ BAD: N+1 query problem
const users = await UserModel.all()
for (const user of users) {
  const positions = await user.related('positions').query() // ❌ Query in loop
}

// ✅ GOOD: Use scopes for reusable query logic
class PositionModel extends BaseModel {
  static atRisk = scope((query) => {
    query.where('health_factor', '<', 1.5)
  })
}
await PositionModel.query().apply((scopes) => scopes.atRisk())

// ✅ GOOD: Use hooks for model lifecycle events
export default class UserModel extends BaseModel {
  @beforeCreate()
  static async hashPassword(user: UserModel) {
    if (user.$dirty.password) {
      user.password = await hash.make(user.password)
    }
  }
}
```

### Validation Best Practices

```typescript
// ✅ GOOD: Use VineJS validators
import vine from '@vinejs/vine'

export const createPositionValidator = vine.compile(
  vine.object({
    walletAddress: vine.string().regex(/^0x[a-fA-F0-9]{40}$/),
    protocol: vine.enum(['aave', 'compound', 'morpho']),
    chainId: vine.number().positive()
  })
)

// Usage in controller
async store({ request }: HttpContext) {
  const data = await request.validateUsing(createPositionValidator)
  // data is now type-safe
}

// ❌ BAD: Manual validation
async store({ request }: HttpContext) {
  const { walletAddress } = request.all()
  if (!walletAddress || !walletAddress.startsWith('0x')) { // ❌ Manual checks
    throw new Error('Invalid address')
  }
}
```

### Exception Handling

```typescript
// ✅ GOOD: Create custom exceptions
import { Exception } from '@adonisjs/core/exceptions'

export class PositionNotFoundError extends Exception {
  static status = 404
  static code = 'E_POSITION_NOT_FOUND'

  constructor(address: string) {
    super(`Position not found for address: ${address}`, {
      status: 404,
      code: 'E_POSITION_NOT_FOUND'
    })
  }
}

// Handle in global exception handler
export default class HttpExceptionHandler extends ExceptionHandler {
  async handle(error: unknown, ctx: HttpContext) {
    if (error instanceof PositionNotFoundError) {
      return ctx.response.status(404).json({
        error: error.message,
        code: error.code
      })
    }
    return super.handle(error, ctx)
  }
}
```

### Middleware Best Practices

```typescript
// ✅ GOOD: Use middleware for cross-cutting concerns
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const token = ctx.request.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return ctx.response.unauthorized({ error: 'Missing token' })
    }

    const user = await this.verifyToken(token)
    ctx.auth = { user } // Attach to context

    await next()
  }
}

// Register in start/kernel.ts
router.use([middleware.auth()]).group(() => {
  router.get('/positions', [PositionController, 'index'])
})
```

### Environment Variables

```typescript
// ✅ GOOD: Validate env variables in start/env.ts
import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  APP_KEY: Env.schema.string(),
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string(),
  DB_DATABASE: Env.schema.string(),
  ALCHEMY_API_KEY: Env.schema.string.optional(),
  ANTHROPIC_API_KEY: Env.schema.string.optional()
})

// Usage
import env from '#start/env'
const apiKey = env.get('ALCHEMY_API_KEY')
```

## TypeScript Best Practices for AdonisJS

### Type-Safe Models

```typescript
// ✅ GOOD: Define model types
import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class PositionModel extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare protocol: 'aave' | 'compound' | 'morpho' // Type union

  @column()
  declare healthFactor: number

  @column()
  declare collateral: Array<{ symbol: string; amount: string; valueUSD: string }>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
```

### Type-Safe Routes

```typescript
// ✅ GOOD: Type route parameters
import { HttpContext } from '@adonisjs/core/http'

type ShowParams = {
  params: { address: string }
}

async show({ params }: HttpContext & ShowParams) {
  // params.address is typed as string
}
```

## Event-Driven Architecture Best Practices

### Event Design

**See actual implementation:** `app/events/position_events.ts`, `app/events/base.ts`

```typescript
// ✅ GOOD: Events are immutable data objects (from app/events/base.ts)
export interface DomainEvent {
  type: string
  aggregateId: string
  aggregateType: string
  occurredAt: Date
  data: Record<string, any>
  metadata?: Record<string, any>
}

// Real example from app/events/position_events.ts
export interface WalletConnectedEvent extends DomainEvent {
  type: 'WalletConnected'
  aggregateType: 'position'
  data: {
    walletAddress: string
    userId: string
  }
}

// Helper function pattern used in the codebase
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

// Other events in app/events/position_events.ts:
// - PositionUpdatedEvent
// - HealthFactorCriticalEvent
// - PositionSnapshotCreatedEvent

// ❌ BAD: Mutable events with methods
export class PositionUpdatedEvent {
  eventType = 'position.updated' // ❌ Mutable

  setHealthFactor(hf: number) { // ❌ Methods that modify state
    this.healthFactor = hf
  }
}
```

### Event Handlers

```typescript
// ✅ GOOD: Handlers are single-purpose, idempotent
export class OnPositionUpdated implements EventHandler<PositionUpdatedEvent> {
  constructor(
    private alertService: AlertService,
    private eventBus: IEventBus
  ) {}

  async handle(event: PositionUpdatedEvent): Promise<void> {
    // Idempotent: safe to run multiple times
    const { currentHealthFactor, positionId, userId } = event

    if (currentHealthFactor < 1.5) {
      await this.eventBus.publish(
        new HealthFactorCriticalEvent(positionId, userId, currentHealthFactor)
      )
    }
  }
}

// ❌ BAD: Handler does too much, not idempotent
export class OnPositionUpdated {
  async handle(event: PositionUpdatedEvent) {
    await this.updateDatabase() // ❌ Direct DB access
    await this.callExternalAPI() // ❌ External calls
    this.counter++ // ❌ Not idempotent
  }
}
```

### Event Bus Usage

**See actual implementation:** `app/event-bus/simple_event_bus.ts`

```typescript
// Current implementation (app/event-bus/simple_event_bus.ts)
import { EventEmitter } from 'node:events'

export class SimpleEventBus extends EventEmitter implements EventBus {
  async publish(event: DomainEvent): Promise<void> {
    this.emit(event.type, event)
  }

  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    this.on(eventType, handler)
  }

  unsubscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void {
    this.off(eventType, handler)
  }
}

// Singleton pattern used in the codebase
let eventBusInstance: SimpleEventBus | null = null
export function getEventBus(): SimpleEventBus {
  if (!eventBusInstance) {
    eventBusInstance = new SimpleEventBus()
  }
  return eventBusInstance
}

// ✅ GOOD: Publish events after state changes
async updatePosition(positionId: string, newData: Partial<Position>) {
  const position = await this.repository.findById(positionId)
  const oldHealthFactor = position.healthFactor

  position.update(newData)
  await this.repository.save(position) // Persist first

  // Then publish event using helper function
  await this.eventBus.publish(
    createPositionUpdatedEvent(
      position.id,
      position.userId,
      oldHealthFactor,
      position.healthFactor
    )
  )
}

// ❌ BAD: Publish before persisting
await this.eventBus.publish(event) // ❌ Event published
await this.repository.save(position) // ❌ If this fails, event already sent
```

## Hexagonal Architecture Best Practices

### Port Definition

**See actual implementation:** `app/ports/protocol_adapter.ts`

```typescript
// ✅ GOOD: Ports are pure interfaces, no implementation (from app/ports/protocol_adapter.ts)
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

// ❌ BAD: Port with implementation details
export interface IProtocolAdapter {
  rpcUrl: string // ❌ Implementation detail
  connect(): Promise<void> // ❌ Infrastructure concern
  getPosition(address: string): Promise<Position>
}
```

### Adapter Implementation

```typescript
// ✅ GOOD: Adapter handles infrastructure, returns domain objects
export class AaveAdapter implements IProtocolAdapter {
  readonly protocolName = 'aave'

  constructor(
    private aaveSDK: AaveSDK,
    private rpcProvider: Provider
  ) {}

  async getPosition(address: string): Promise<Position | null> {
    try {
      const aaveData = await this.aaveSDK.getUserAccountData(address)

      // Map to domain entity
      return new Position(
        crypto.randomUUID(),
        address,
        'aave',
        this.mapCollateral(aaveData),
        this.mapDebt(aaveData),
        this.calculateHealthFactor(aaveData),
        new Date()
      )
    } catch (error) {
      if (error.code === 'NO_POSITION') return null
      throw new PositionFetchError(address, error)
    }
  }

  private mapCollateral(data: any): Asset[] { /* ... */ }
  private mapDebt(data: any): Asset[] { /* ... */ }
  private calculateHealthFactor(data: any): number { /* ... */ }
}

// ❌ BAD: Adapter leaks infrastructure details
export class AaveAdapter {
  async getPosition(address: string) {
    return this.aaveSDK.getUserAccountData(address) // ❌ Returns SDK object
  }
}
```

### Use Case Pattern

```typescript
// ✅ GOOD: Use cases orchestrate, delegate to adapters/repos
export class AnalyzePosition {
  constructor(
    private protocolAdapter: IProtocolAdapter,
    private repository: PositionRepository,
    private eventBus: IEventBus
  ) {}

  async execute(address: string): Promise<PositionAnalysis> {
    // 1. Fetch from adapter
    const position = await this.protocolAdapter.getPosition(address)
    if (!position) throw new PositionNotFoundError(address)

    // 2. Business logic
    const isAtRisk = position.isAtRisk()
    const ltv = position.getLTV()

    // 3. Persist
    await this.repository.save(position)

    // 4. Publish event
    if (isAtRisk) {
      await this.eventBus.publish(
        new HealthFactorCriticalEvent(position.id, position.userId, position.healthFactor)
      )
    }

    // 5. Return analysis
    return { position, isAtRisk, ltv, recommendations: this.generateRecommendations(position) }
  }

  private generateRecommendations(position: Position): string[] { /* ... */ }
}

// ❌ BAD: Use case has business logic mixed with infrastructure
export class AnalyzePosition {
  async execute(address: string) {
    const web3 = new Web3(process.env.RPC_URL) // ❌ Direct infrastructure
    const contract = new web3.eth.Contract(ABI, ADDRESS) // ❌
    const data = await contract.methods.getUserData(address).call() // ❌

    if (data.healthFactor < 1.5) { // Business logic mixed with infra
      await db.insert('alerts', { ... }) // ❌ Direct DB access
    }
  }
}
```

## Performance Best Practices

### Database Optimization

```typescript
// ✅ GOOD: Batch operations
const positions = await PositionModel.createMany([
  { walletAddress: '0x1...', protocol: 'aave' },
  { walletAddress: '0x2...', protocol: 'compound' }
])

// ✅ GOOD: Use indexes (in migrations)
table.index(['wallet_address', 'protocol'], 'wallet_protocol_idx')
table.index('health_factor', 'health_factor_idx')

// ✅ GOOD: Limit and paginate
const positions = await PositionModel.query()
  .where('health_factor', '<', 1.5)
  .orderBy('health_factor', 'asc')
  .paginate(page, 20)

// ❌ BAD: Load all records
const allPositions = await PositionModel.all() // ❌ Could be huge
```

### Caching Strategies

```typescript
// ✅ GOOD: Cache expensive operations
import { Cache } from '@adonisjs/cache'

export class PositionService {
  constructor(private cache: Cache) {}

  async getPosition(address: string): Promise<Position> {
    const cacheKey = `position:${address}`

    const cached = await this.cache.get<Position>(cacheKey)
    if (cached) return cached

    const position = await this.protocolAdapter.getPosition(address)
    await this.cache.set(cacheKey, position, '5 minutes')

    return position
  }
}
```

## Security Best Practices

### Input Validation

```typescript
// ✅ GOOD: Validate all inputs
export const walletAddressValidator = vine.compile(
  vine.object({
    address: vine.string().regex(/^0x[a-fA-F0-9]{40}$/),
    chainId: vine.number().in([1, 137, 8453]) // Whitelist chains
  })
)

// ✅ GOOD: Sanitize user input
import sanitizeHtml from 'sanitize-html'

const clean = sanitizeHtml(userInput, {
  allowedTags: [],
  allowedAttributes: {}
})
```

### Authentication & Authorization

```typescript
// ✅ GOOD: Use middleware for auth
export default class AuthMiddleware {
  async handle({ auth, response }: HttpContext, next: NextFn) {
    try {
      await auth.authenticate()
    } catch {
      return response.unauthorized({ error: 'Unauthorized' })
    }
    await next()
  }
}

// ✅ GOOD: Check ownership
async show({ auth, params, response }: HttpContext) {
  const position = await PositionModel.findOrFail(params.id)

  if (position.userId !== auth.user!.id) {
    return response.forbidden({ error: 'Access denied' })
  }

  return position
}
```

### Prevent SQL Injection

```typescript
// ✅ GOOD: Use query builder (automatic escaping)
await db.from('positions')
  .where('wallet_address', address)
  .first()

// ❌ BAD: Raw SQL with string interpolation
await db.rawQuery(`SELECT * FROM positions WHERE wallet_address = '${address}'`)

// ✅ GOOD: Use parameterized queries if raw SQL needed
await db.rawQuery('SELECT * FROM positions WHERE wallet_address = ?', [address])
```

## Testing Best Practices

### Unit Tests

```typescript
// ✅ GOOD: Test domain logic in isolation
import { test } from '@japa/runner'
import { Position } from '#models/position'

test.group('Position', () => {
  test('isAtRisk returns true when health factor below threshold', ({ assert }) => {
    const position = new Position(
      'id',
      'user-id',
      'aave',
      '0x123',
      1,
      1.2, // Below 1.5 threshold
      [{ symbol: 'ETH', amount: '1', valueUSD: '2000' }],
      [{ symbol: 'USDC', amount: '1500', valueUSD: '1500' }],
      null,
      new Date()
    )

    assert.isTrue(position.isAtRisk())
    assert.isTrue(position.isAtRisk(1.5)) // Custom threshold
    assert.isFalse(position.isAtRisk(1.0)) // Below custom threshold
  })

  test('getLTV calculates loan-to-value correctly', ({ assert }) => {
    const position = new Position(/* ... */)
    assert.equal(position.getLTV(), 75.0) // 1500 / 2000 * 100
  })
})
```

### Integration Tests

```typescript
// ✅ GOOD: Use database transactions for test isolation
import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'

test.group('PositionRepository', (group) => {
  // Setup: Begin transaction before each test
  group.each.setup(async () => {
    await db.beginGlobalTransaction()
  })

  // Teardown: Rollback after each test
  group.each.teardown(async () => {
    await db.rollbackGlobalTransaction()
  })

  test('save creates new position', async ({ assert }) => {
    const repository = new PositionRepository()
    const position = new Position(/* ... */)

    await repository.save(position)

    const found = await repository.findById(position.id)
    assert.isNotNull(found)
    assert.equal(found!.healthFactor, position.healthFactor)
  })
})
```

### Mocking

```typescript
// ✅ GOOD: Mock external dependencies
import { test } from '@japa/runner'
import sinon from 'sinon'

test.group('AnalyzePosition', () => {
  test('publishes event when position at risk', async ({ assert }) => {
    // Create mock adapter
    const mockAdapter: IProtocolAdapter = {
      protocolName: 'aave',
      async getPosition(address: string) {
        return new Position(/* at-risk position */)
      },
      async simulatePriceChange() { return 1.1 }
    }

    // Create spy for event bus
    const eventBusSpy = {
      publish: sinon.spy(),
      subscribe: sinon.spy()
    }

    const useCase = new AnalyzePosition(
      mockAdapter,
      new MockRepository(),
      eventBusSpy
    )

    await useCase.execute('0x123')

    assert.isTrue(eventBusSpy.publish.calledOnce)
    const event = eventBusSpy.publish.firstCall.args[0]
    assert.equal(event.eventType, 'position.healthFactor.critical')
  })
})
```

## Common Anti-Patterns to Avoid

### 1. God Objects

```typescript
// ❌ BAD: Class does everything
class PositionService {
  async getPosition() { /* fetch */ }
  async analyzePosition() { /* analyze */ }
  async sendAlert() { /* alert */ }
  async updateDatabase() { /* persist */ }
  async callLLM() { /* AI */ }
}

// ✅ GOOD: Separate responsibilities
class PositionService { /* fetching */ }
class PositionAnalyzer { /* analysis */ }
class AlertService { /* alerting */ }
class PositionRepository { /* persistence */ }
```

### 2. Anemic Domain Models

```typescript
// ❌ BAD: Entity is just data, no behavior
class Position {
  healthFactor: number
  collateral: Asset[]
  debt: Asset[]
}

// Service has all the logic
class PositionService {
  isAtRisk(position: Position): boolean {
    return position.healthFactor < 1.5
  }
}

// ✅ GOOD: Entity has behavior
class Position {
  isAtRisk(): boolean {
    return this.healthFactor < 1.5
  }

  getLTV(): number {
    return (this.totalDebtUsd / this.totalCollateralUsd) * 100
  }
}
```

### 3. Leaky Abstractions

```typescript
// ❌ BAD: Port exposes implementation details
interface IProtocolAdapter {
  rpcUrl: string
  web3Instance: Web3
  connectToBlockchain(): Promise<void>
}

// ✅ GOOD: Port defines behavior, not implementation
interface IProtocolAdapter {
  getPosition(address: string): Promise<Position | null>
  simulatePriceChange(position: Position, asset: string, change: number): Promise<number>
}
```

### 4. Shotgun Surgery

```typescript
// ❌ BAD: Changing one thing requires changes everywhere
// Adding new protocol requires changes in:
// - Controller
// - Service
// - Repository
// - Database
// - Tests

// ✅ GOOD: Open/Closed Principle
// New protocol = new adapter implementation
export class MorphoAdapter implements IProtocolAdapter {
  // Just implement the interface
}
```

## Resources

### AdonisJS Documentation
- [AdonisJS 6 Docs](https://docs.adonisjs.com/guides/introduction)
- [Lucid ORM](https://docs.adonisjs.com/guides/database/lucid)
- [AdonisJS Testing](https://docs.adonisjs.com/guides/testing)
- [VineJS Validation](https://vinejs.dev/)
- [AdonisJS Auth](https://docs.adonisjs.com/guides/auth/introduction)

### Architecture Patterns
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

### TypeScript Best Practices
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

*This document is based on the DeFi Assistant technical specifications. Keep it updated as the architecture evolves.*
