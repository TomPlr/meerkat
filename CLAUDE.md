# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DeFi Assistant** - A full-stack AI-powered DeFi position management platform with:
- Real-time position monitoring across protocols (Aave, Compound, Morpho)
- Market signal detection and analysis
- AI-driven recommendations powered by Claude
- Telegram alerts and autonomous action intents

## Monorepo Structure

This is a **pnpm workspace monorepo** managed by **Turbo**:

```
defi-assistant/
├── apps/
│   ├── api/          # AdonisJS 6 backend (Event-Driven + Hexagonal)
│   └── web/          # Nuxt 4 frontend (Web3 + AI Chat)
├── docker-compose.yml # PostgreSQL + Redis services
├── turbo.json        # Turbo build pipeline config
└── pnpm-workspace.yaml
```

**Architecture Principles:**
- **Backend** (API): Event-Driven + Hexagonal Architecture for scalability
- **Frontend** (Web): Modern Vue 3 + Web3 integration
- **Communication**: REST API (future: WebSockets for real-time)
- **Shared State**: TanStack Query on frontend, Event Bus on backend

## Development Commands

### Root-level (run from monorepo root)

```bash
# Install dependencies
pnpm install

# Start both apps in parallel
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Type check all apps
pnpm typecheck

# Run all tests
pnpm test

# Clean all build artifacts and dependencies
pnpm clean

# Format all code
pnpm format
```

### App-specific commands

```bash
# API only (from apps/api/)
cd apps/api
pnpm dev              # Start AdonisJS dev server with HMR
pnpm build            # Build for production
pnpm db:migrate       # Run database migrations
pnpm db:migrate:fresh # Drop all tables and re-migrate

# Web only (from apps/web/)
cd apps/web
pnpm dev              # Start Nuxt dev server
pnpm build            # Build for production
```

## Tech Stack Summary

### Backend (apps/api/)
- **Framework**: AdonisJS 6 (TypeScript-first Node.js framework)
- **Database**: PostgreSQL with Lucid ORM
- **Event Bus**: EventEmitter (MVP) → Redis Streams (Phase 3+)
- **Web3**: viem + @aave/contract-helpers
- **AI**: Anthropic Claude API
- **Testing**: Japa (AdonisJS native test runner)

### Frontend (apps/web/)
- **Framework**: Nuxt 4 (Vue 3 + TypeScript)
- **UI**: @nuxt/ui v4 (Tailwind CSS v4)
- **Web3**: Reown AppKit + Wagmi + viem
- **State**: TanStack Query + VueUse composables
- **Build**: Vite

### Infrastructure
- **Container**: Docker Compose (PostgreSQL 16 + Redis 7)
- **Package Manager**: pnpm (workspaces)
- **Build System**: Turbo (incremental builds + caching)
- **Node**: >= 20.0.0

## Project Architecture

### High-Level Flow

```
┌──────────────────────────────────────────────────────────┐
│                   FRONTEND (Nuxt 4)                      │
│  - Reown AppKit (wallet connection)                      │
│  - TanStack Query (API caching)                          │
│  - AI Chat Interface                                     │
└──────────────────┬───────────────────────────────────────┘
                   │ REST API
                   ▼
┌──────────────────────────────────────────────────────────┐
│              BACKEND (AdonisJS 6)                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │           HTTP CONTROLLERS                         │ │
│  │         (REST API endpoints)                       │ │
│  └────────────────────┬───────────────────────────────┘ │
│                       │                                  │
│                       ▼                                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │              EVENT BUS                             │ │
│  │  (Redis Streams + Event Store)                     │ │
│  └────────┬──────────────────────┬────────────────────┘ │
│           │                      │                       │
│    ┌──────▼──────┐        ┌─────▼──────┐               │
│    │  Position   │        │   Signal   │               │
│    │  Service    │        │  Service   │               │
│    └──────┬──────┘        └─────┬──────┘               │
│           │                      │                       │
│           └──────────┬───────────┘                       │
│                      ▼                                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │         DOMAIN CORE (Hexagonal)                    │ │
│  │  • Entities: Position, Signal, Intent              │ │
│  │  • Use Cases: AnalyzePosition, DetectSignals       │ │
│  │  • Ports: IProtocolAdapter, IEventBus              │ │
│  └──────────────┬─────────────────────────────────────┘ │
│                 │                                        │
│      ┌──────────┼──────────┐                            │
│      ▼          ▼          ▼                            │
│  ┌────────┐ ┌────────┐ ┌────────┐                      │
│  │ Aave   │ │Binance │ │ Claude │                      │
│  │Adapter │ │Adapter │ │Adapter │                      │
│  └────────┘ └────────┘ └────────┘                      │
└──────────────────────────────────────────────────────────┘
           │           │           │
           ▼           ▼           ▼
    [Blockchain]  [APIs]   [Anthropic API]
```

### Key Design Patterns

1. **Event-Driven Architecture (Backend)**
   - Services communicate via domain events
   - Decoupled, scalable microservice-style modules
   - Events: `WalletConnected`, `PositionUpdated`, `HealthFactorCritical`

2. **Hexagonal Architecture (Backend)**
   - Domain core isolated from infrastructure
   - Ports define interfaces, adapters implement them
   - Testable, swappable external integrations

3. **Repository Pattern (Backend)**
   - Clean data access layer
   - Maps between Lucid ORM models and domain entities
   - Located at `apps/api/app/repositories/`

4. **Shared Composables (Frontend)**
   - Global state management via VueUse
   - Pattern: `createSharedComposable(_useFoo)`
   - Located at `apps/web/app/composables/`

## Environment Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Docker Services

```bash
docker-compose up -d
```

This starts:
- **PostgreSQL**: `localhost:5432` (user: `postgres`, pass: `postgres`, db: `defi_assistant`)
- **Redis**: `localhost:6379`

### 3. Configure Environment Variables

**Backend** (`apps/api/.env`):
```env
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=generate_with_ace_generate_key

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=defi_assistant

# Phase 1+ (when implementing blockchain features)
ALCHEMY_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

**Frontend** (`apps/web/.env`):
```env
NUXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_from_cloud.reown.com
```

### 4. Run Database Migrations

```bash
cd apps/api
pnpm db:migrate
```

### 5. Start Development Servers

```bash
# From monorepo root
pnpm dev

# Or individually:
# Terminal 1: cd apps/api && pnpm dev
# Terminal 2: cd apps/web && pnpm dev
```

**Access Points:**
- API: `http://localhost:3333`
- Web: `http://localhost:3000`

## Database Schema (PostgreSQL)

Key tables (see `apps/api/database/migrations/` for full schema):

- **users** - User accounts, wallet addresses, preferences
- **positions** - DeFi positions snapshots (Aave, Compound, etc.)
- **signals** - Market signals (funding rates, liquidation risks)
- **alerts** - User notifications (Telegram, email, in-app)
- **intents** (Phase 5+) - Autonomous action intents
- **event_store** (Phase 5+) - Event sourcing log

## Code Search Tools

### When to Use grep vs mgrep

**Use grep (or ripgrep) for exact matches:**
- **Symbol tracing** - Finding specific function/class/variable names
- **Refactoring** - Renaming variables, updating imports
- **Regex patterns** - Precise pattern matching
- **Finding exact strings** - Literal text search

**Use mgrep for intent-based semantic search:**
- **Code exploration** - Understanding architecture ("where is event handling?")
- **Feature discovery** - Finding implementations ("how is authentication done?")
- **Onboarding** - Learning codebase structure and patterns
- **Conceptual queries** - Natural language questions ("what handles position updates?")

> **Note**: mgrep uses semantic search powered by embeddings to understand code intent and context.
> Learn more: [github.com/mixedbread-ai/mgrep](https://github.com/mixedbread-ai/mgrep)

### Examples

```bash
# grep/ripgrep - Exact symbol/text matches
grep "class Position" apps/api/app/models/     # Find exact class definition
grep "IProtocolAdapter" apps/api/app/ports/    # Find interface usage
grep -r "PositionRepository" apps/api/         # Check repository usage
grep "useUser" apps/web/app/composables/       # Find composable function

# mgrep - Intent-based semantic search
mgrep "event bus implementation"               # Explore event system
mgrep "position health factor calculation"     # Discover business logic
mgrep "wallet connection flow"                 # Understand Web3 integration
mgrep "database migration patterns"            # Find DB structure
mgrep "composable state management"            # Discover state patterns
mgrep "how are domain events handled"          # Natural language queries

# Combined workflow example
# 1. Use mgrep to discover architecture
mgrep "event-driven position updates"          # → finds event handlers

# 2. Use grep to find all related files
grep -r "PositionUpdated" apps/api/            # → see all event usages
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

## Import Aliases

### Backend (AdonisJS)

All backend code uses import aliases defined in `apps/api/package.json`:

```typescript
// Domain & Business Logic
import { Position } from '#models/position'
import { AnalyzePosition } from '#use-cases/AnalyzePosition'

// Ports (Interfaces)
import type { IProtocolAdapter } from '#ports/IProtocolAdapter'
import type { IEventBus } from '#ports/IEventBus'

// Adapters (Implementations)
import { AaveAdapter } from '#adapters/protocols/aave/AaveAdapter'
import { AnthropicAdapter } from '#adapters/llm/AnthropicAdapter'

// Events
import { WalletConnected } from '#events/position/WalletConnected'
import { PositionUpdated } from '#events/position/PositionUpdated'

// Infrastructure (Lucid ORM Models)
import UserModel from '#app/infrastructure/database/models/user'
import PositionModel from '#app/infrastructure/database/models/position'

// Repositories
import { PositionRepository } from '#repositories/position_repository'
```

**Full Alias Mappings:**
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
- `#config/*` → `./config/*.js`
- `#start/*` → `./start/*.js`
- `#app/*` → `./app/*.js`

### Frontend (Nuxt)

Nuxt provides auto-imports for most code. For manual imports:

```typescript
// Auto-imported (no import needed):
// - Vue composables: ref, computed, watch, etc.
// - Nuxt utilities: navigateTo, useRoute, useRouter, etc.
// - Components from app/components/

// Manual imports:
import { createSharedComposable } from '@vueuse/core'
import { useQuery } from '@tanstack/vue-query'
import type { User } from '~/types'
```

## Code Organization Guidelines

### Backend File Placement

- **Domain entities** → `apps/api/app/models/` (pure TypeScript classes)
- **Use cases** → `apps/api/app/use-cases/` (business logic orchestration)
- **Ports** → `apps/api/app/ports/` (TypeScript interfaces)
- **Adapters** → `apps/api/app/adapters/{protocols,signals,llm}/`
- **Events** → `apps/api/app/events/{position,signal,decision}/`
- **Event handlers** → `apps/api/app/listeners/{position,signal,decision}/`
- **Repositories** → `apps/api/app/repositories/`
- **Lucid models** → `apps/api/app/infrastructure/database/models/`
- **Migrations** → `apps/api/database/migrations/`

### Frontend File Placement

- **Pages** → `apps/web/app/pages/` (file-based routing)
- **Components** → `apps/web/app/components/` (auto-imported)
- **Composables** → `apps/web/app/composables/` (must use `createSharedComposable`)
- **Types** → `apps/web/app/types/index.d.ts`
- **Plugins** → `apps/web/app/plugins/` (use `.client.ts` for browser-only)
- **Layouts** → `apps/web/app/layouts/`

## Testing

### Backend (AdonisJS)

```bash
cd apps/api

# Run all tests
pnpm test

# Run specific test file
node ace test tests/unit/models/position.spec.ts
```

**Test Structure:**
- `tests/unit/` - Domain logic, entities (2s timeout)
- `tests/functional/` - Adapters, repositories, integration (30s timeout)

**Pattern:**
```typescript
import { test } from '@japa/runner'
import { Position } from '#models/position'

test.group('Position', () => {
  test('should identify at-risk position', ({ assert }) => {
    const position = new Position(/* ... */)
    assert.isTrue(position.isAtRisk())
  })
})
```

### Frontend (Nuxt)

Testing not yet configured. Future: Vitest + Vue Test Utils.

## Turbo Build Pipeline

Turbo manages parallel builds and caching:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".nuxt/**", "dist/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**How it works:**
- `pnpm dev` → Runs `dev` task in both apps simultaneously
- `pnpm build` → Builds dependencies first, then apps
- Turbo caches build outputs for faster rebuilds

## Common Workflows

### Adding a New Domain Event

1. Define event in `apps/api/app/events/{domain}/`
2. Create event handler in `apps/api/app/listeners/{domain}/`
3. Register handler in event bus bootstrap
4. Emit event from use case or service

### Adding a New API Endpoint

1. Create controller in `apps/api/app/controllers/`
2. Add route in `apps/api/start/routes.ts`
3. Create validator if needed in `apps/api/app/validators/`
4. Test with Japa in `apps/api/tests/functional/`

### Adding a New Web3 Integration

1. Create adapter in `apps/api/app/adapters/protocols/{protocol}/`
2. Implement `IProtocolAdapter` port
3. Register adapter in dependency injection container
4. Add integration tests in `apps/api/tests/functional/adapters/`

### Adding a New Frontend Page

1. Create `.vue` file in `apps/web/app/pages/`
2. File name determines route (e.g., `portfolio.vue` → `/portfolio`)
3. Add to navigation if needed (update `apps/web/app/layouts/default.vue`)

### Adding a New Composable

1. Create in `apps/web/app/composables/`
2. **MUST** use `createSharedComposable` pattern:
   ```typescript
   import { createSharedComposable } from '@vueuse/core'

   const _useFeature = () => {
     const state = ref()
     return { state }
   }

   export const useFeature = createSharedComposable(_useFeature)
   ```

## Troubleshooting

### Database Connection Errors

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart services
docker-compose restart postgres

# Check logs
docker logs defi-assistant-postgres
```

### Migration Errors

```bash
# Reset database (WARNING: destroys all data)
cd apps/api
pnpm db:migrate:fresh

# Rollback last migration
pnpm db:migrate:rollback
```

### Port Already in Use

```bash
# Find process using port 3333 (API)
lsof -i :3333

# Kill process
kill -9 <PID>

# Or change port in apps/api/.env
PORT=3334
```

### Web3 Wallet Not Connecting

1. Check `NUXT_PUBLIC_REOWN_PROJECT_ID` is set in `apps/web/.env`
2. Verify project ID at [cloud.reown.com](https://cloud.reown.com)
3. Ensure `appkit.client.ts` plugin is loaded (check browser console)

### Turbo Cache Issues

```bash
# Clear Turbo cache
rm -rf .turbo

# Clean all build artifacts
pnpm clean
```

## Code Quality Standards

### TypeScript

- Use **strict mode** (enabled in all `tsconfig.json`)
- Avoid `any` type - use `unknown` or proper types
- Use `type` imports: `import type { User } from '~/types'`

### Backend Patterns

✅ **DO:**
- Inject dependencies via constructor (Hexagonal Architecture)
- Keep domain models pure (no DB/API calls in entities)
- Use event bus for cross-service communication
- Separate Lucid models from domain entities

❌ **DON'T:**
- Put business logic in adapters
- Make HTTP calls from domain entities
- Skip event bus for domain events
- Mix Lucid models with domain logic

### Frontend Patterns

✅ **DO:**
- Use `createSharedComposable` for ALL shared state
- Use TanStack Query for server data (automatic caching)
- Use `<script setup>` syntax in Vue components
- Destructure composables: `const { user } = useUser()`

❌ **DON'T:**
- Create composables without `createSharedComposable`
- Use `watch()` unless necessary (prefer `computed`)
- Hardcode API URLs (use runtime config)
- Skip TypeScript types in components

## Project Phases

### Phase 0: Foundation ✅
- [x] Hexagonal folder structure
- [x] Lucid ORM + PostgreSQL
- [x] Event Bus (EventEmitter)
- [x] Domain entities (Position, User)
- [x] Repository pattern

### Phase 1: Position Engine (Current)
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

## Resources

### Documentation
- [AdonisJS 6 Docs](https://docs.adonisjs.com/)
- [Nuxt 4 Docs](https://nuxt.com/)
- [Turbo Docs](https://turbo.build/repo/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)

### Architecture References
- [Event-Driven Architecture](https://martinfowler.com/articles/201701-event-driven.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)

### App-Specific Guides

**IMPORTANT**: Each app has a comprehensive CLAUDE.md with detailed best practices:

- [Backend Architecture](apps/api/CLAUDE.md) - **1600+ lines** covering:
  - AdonisJS 6 HTTP controllers, Lucid ORM, and validation
  - Event-Driven Architecture patterns (events, handlers, idempotency)
  - Hexagonal Architecture (ports, adapters, use cases)
  - TypeScript type safety, dependency injection
  - Security (input validation, auth, SQL injection prevention)
  - Testing (unit tests, integration tests, mocking)
  - Performance (database optimization, caching)
  - Common anti-patterns to avoid

- [Frontend Architecture](apps/web/CLAUDE.md) - **1500+ lines** covering:
  - Vue 3 Composition API and reactivity system
  - Nuxt 4 file-based routing, plugins, SSR vs client code
  - Web3 integration (Reown AppKit, Wagmi, viem)
  - TanStack Query (queries, mutations, optimistic updates)
  - State management (composables, cookies, VueUse)
  - Performance optimization (lazy loading, memoization)
  - Common anti-patterns to avoid

---

**Next Steps**: Review app-specific CLAUDE.md files for comprehensive best practices and patterns.
