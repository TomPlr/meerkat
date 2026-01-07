# DeFi Assistant API

AdonisJS 6 backend implementing Event-Driven Architecture + Hexagonal Architecture for DeFi position management.

## Architecture Overview

This API follows a **hybrid architecture** combining:

- **Event-Driven Architecture (EDA)**: Services communicate via asynchronous events
- **Hexagonal Architecture**: Domain core isolated from infrastructure concerns
- **Repository Pattern**: Clean data access layer with Lucid ORM

```
┌─────────────────────────────────────────────────────────┐
│                    EVENT BUS                             │
│         (EventEmitter → Redis Streams)                   │
└─────────────────────────┬───────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
    Position          Signal           Decision
    Service           Service          Service
        │                 │                 │
        └─────────────────┴─────────────────┘
                          │
┌─────────────────────────────────────────────────────────┐
│              DOMAIN CORE (Hexagonal)                     │
│  Entities | Events | Ports | Use Cases                   │
└─────────────────────────┬───────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
    Protocol          Signal             LLM
    Adapters          Adapters          Adapter
```

## Project Structure

```
apps/api/
├── app/
│   ├── controllers/           # HTTP controllers
│   ├── middleware/            # HTTP middleware
│   ├── models/                # Domain models (business logic)
│   ├── repositories/          # Data access layer
│   ├── infrastructure/
│   │   └── database/
│   │       └── models/        # Lucid ORM models
│   ├── events/                # Domain events
│   ├── event-bus/             # Event bus implementation
│   └── ports/                 # Hexagonal ports (interfaces)
│
├── database/
│   └── migrations/            # Lucid migrations
│
├── config/                    # Configuration files
├── start/                     # Routes & kernel
└── tests/                     # Test suites
```

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Docker and Docker Compose (for PostgreSQL and Redis)

### Installation

1. **Install dependencies** (from monorepo root):
```bash
pnpm install
```

2. **Start databases**:
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

3. **Configure environment**:

The `.env` file is already set up with default values for local development:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=defi_assistant
```

4. **Run database migrations**:
```bash
cd apps/api
pnpm db:migrate
```

5. **Start the development server**:
```bash
pnpm dev
```

The API will be available at `http://localhost:3333`

## Available Scripts

### Development
- `pnpm dev` - Start development server with HMR
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run Japa tests

### Database (Lucid ORM)
- `pnpm db:migrate` - Run pending migrations
- `pnpm db:migrate:rollback` - Rollback last batch of migrations
- `pnpm db:migrate:fresh` - Drop all tables and re-run migrations
- `pnpm db:make:migration` - Create a new migration file
- `pnpm db:make:model` - Create a new Lucid model
- `pnpm db:seed` - Run database seeders

### Code Quality
- `pnpm lint` - Lint with ESLint
- `pnpm format` - Format with Prettier
- `pnpm typecheck` - Type check with TypeScript

## Database Schema

### Tables

**users**
- `id` (uuid, primary key)
- `wallet_address` (varchar, unique)
- `preferences` (jsonb)
- `telegram_chat_id` (varchar, nullable)
- `created_at`, `updated_at` (timestamps)

**positions**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key → users)
- `protocol` (varchar) - e.g., 'aave', 'compound'
- `wallet_address` (varchar)
- `health_factor` (numeric)
- `collateral` (jsonb) - Array of assets
- `debt` (jsonb) - Array of assets
- `metadata` (jsonb) - Protocol-specific data
- `snapshot_at` (timestamp)
- `created_at`, `updated_at` (timestamps)

**signals**
- `id` (uuid, primary key)
- `type` (varchar) - Signal type
- `asset` (varchar) - Asset symbol
- `severity` (varchar) - low/medium/high/critical
- `data` (jsonb) - Signal data
- `detected_at`, `expires_at` (timestamps)
- `status` (varchar) - active/expired/acknowledged
- `created_at` (timestamp)

**alerts**
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key → users)
- `signal_id` (uuid, nullable, foreign key → signals)
- `type` (varchar) - Alert type
- `channel` (varchar) - telegram/email/in_app
- `message` (text)
- `metadata` (jsonb)
- `sent_at`, `acknowledged_at` (timestamps)
- `status` (varchar) - pending/sent/failed/acknowledged
- `created_at` (timestamp)

**intents** (Phase 5+)
- Autonomous action intents for conditional execution

**event_store** (Phase 5+)
- Event Store for Event Sourcing

## Event-Driven Flow

### Example: Wallet Connection

```typescript
// 1. User connects wallet (via controller)
await eventBus.publish(
  createWalletConnectedEvent('0x123...', userId)
)

// 2. Handler loads position
class OnWalletConnected {
  async handle(event: WalletConnectedEvent) {
    const position = await protocolAdapter.getPosition(event.data.walletAddress)
    await eventBus.publish(
      createPositionUpdatedEvent(positionId, userId, position)
    )
  }
}

// 3. Handler checks health factor
class OnPositionUpdated {
  async handle(event: PositionUpdatedEvent) {
    if (event.data.healthFactor < 1.5) {
      await eventBus.publish(
        createHealthFactorCriticalEvent(
          event.data.positionId,
          event.data.userId,
          event.data.healthFactor
        )
      )
    }
  }
}
```

## Hexagonal Ports

### IProtocolAdapter

Interface for blockchain protocol integrations (Aave, Compound, Morpho).

```typescript
interface IProtocolAdapter {
  readonly protocolName: string
  getPosition(walletAddress: string): Promise<Position | null>
  simulatePriceChange(position: Position, asset: string, percentChange: number): Promise<number>
}
```

### IEventBus

Interface for event publishing and subscription.

```typescript
interface IEventBus {
  publish(event: DomainEvent): Promise<void>
  subscribe<T extends DomainEvent>(eventType: string, handler: EventHandler<T>): void
}
```

## Environment Variables

Required in `.env`:

```env
# Application
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=<generate-with-ace-generate:key>
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=defi_assistant

# Future (Phase 1+)
# ALCHEMY_API_KEY=
# ANTHROPIC_API_KEY=
# BINANCE_API_KEY=
```

## Migration Path

### Phase 0: Foundation
- [x] Hexagonal folder structure
- [x] Lucid ORM + PostgreSQL
- [x] Event Bus (EventEmitter)
- [x] Domain entities (Position, User)
- [x] Event definitions
- [x] Repository pattern

### Phase 1: Position Engine (Next)
- [ ] Implement AaveAdapter
- [ ] Create position analysis use cases
- [ ] Add event handlers
- [ ] Connect to Web3 RPC

### Phase 2: Signals
- [ ] Migrate to Redis Streams
- [ ] Implement BinanceSignalAdapter
- [ ] Setup BullMQ for scheduled jobs

### Phase 3+: Scale
- [ ] Multi-protocol support
- [ ] Event Store implementation
- [ ] Agent automation

## Testing

```bash
# Run all tests
pnpm test

# Run specific suite
pnpm test --files tests/unit/**/*.spec.ts
```

Test structure:
- `tests/unit/` - Domain logic, entities, use cases (2s timeout)
- `tests/functional/` - Adapters, repositories, integration (30s timeout)

## Resources

- [AdonisJS 6 Documentation](https://docs.adonisjs.com/)
- [Lucid ORM Documentation](https://docs.adonisjs.com/guides/database/lucid)
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

**Next Steps**: Implement Phase 1 - Position Engine with Aave integration
