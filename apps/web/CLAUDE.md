# CLAUDE.md - Web App

This file provides guidance to Claude Code when working with the Nuxt 4 web application.

## Project Overview

DeFi Assistant web app - A Nuxt 4 frontend with Web3 wallet integration and AI-powered assistant.

## Development Commands

- `pnpm dev` - Start Nuxt dev server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm generate` - Generate static site

## Tech Stack

### Core Framework
- **Nuxt 4** (compatibilityVersion: 4) with TypeScript and Vue 3
- **Vite** - Build tool with HMR

### UI & Styling
- **@nuxt/ui** (v4.3.0) - Component library built on Tailwind CSS v4
- **@vueuse/nuxt** - Vue composable utilities
- **Iconify** - Icon system (lucide, simple-icons collections)

### Web3 Integration
- **@reown/appkit** (v1.8.15) - Web3 wallet connection modal
- **@reown/appkit-adapter-wagmi** - Wagmi adapter for AppKit
- **@wagmi/vue** (v0.4.6) - Vue composables for Ethereum
- **viem** (v2.43.3) - TypeScript Ethereum library

### Data Fetching & State
- **@tanstack/vue-query** (v5.92.5) - Async state management and caching
- **zod** - Schema validation
- **date-fns** - Date utilities

## Project Structure

```
app/
├── pages/              # File-based routing
│   ├── index.vue       # Dashboard home (/)
│   ├── chat/
│   │   ├── index.vue   # Chat list (/chat)
│   │   └── [id].vue    # Individual chat (/chat/:id)
│   └── settings/       # Settings with nested routes
├── components/         # Vue components (organized by feature)
│   ├── chat/          # Chat-related components
│   ├── UserMenu.vue
│   ├── WalletsMenu.vue
│   └── NotificationsSlideover.vue
├── composables/       # Shared composables
│   ├── useUser.ts     # User authentication state
│   ├── useChats.ts    # Chat grouping logic
│   ├── useDashboard.ts # Dashboard state & shortcuts
│   ├── useModels.ts   # AI model selection
│   └── useNotifications.ts # Notification system
├── layouts/
│   └── default.vue    # Main dashboard layout
├── plugins/
│   ├── appkit.client.ts  # Reown AppKit Web3 setup
│   └── vue-query.ts      # TanStack Query configuration
├── config/
│   └── appkit.ts      # AppKit network configuration
├── types/
│   └── index.d.ts     # TypeScript type definitions
├── assets/
│   └── css/
│       └── main.css   # Tailwind CSS v4 theme configuration
├── app.config.ts      # Runtime app configuration (UI colors)
├── app.vue            # Root component
└── error.vue          # Error page
```

## Environment Configuration

Create a `.env` file in `apps/web/`:

```bash
NUXT_PUBLIC_REOWN_PROJECT_ID=your_project_id_from_cloud.reown.com
```

## Code Search Tools

### When to Use grep vs mgrep

**Use grep (or ripgrep) for exact matches:**
- **Symbol tracing** - Finding specific function/class/variable names
- **Refactoring** - Renaming variables, updating imports
- **Regex patterns** - Precise pattern matching
- **Finding exact strings** - Literal text search

**Use mgrep for intent-based semantic search:**
- **Code exploration** - Understanding how features work ("where is error handling?")
- **Feature discovery** - Finding implementations ("how is authentication done?")
- **Onboarding** - Learning codebase structure and patterns
- **Conceptual queries** - Natural language questions ("what handles user sessions?")

> **Note**: mgrep uses semantic search powered by embeddings to understand code intent and context.
> Learn more: [github.com/mixedbread-ai/mgrep](https://github.com/mixedbread-ai/mgrep)

### Examples

```bash
# grep/ripgrep - Exact symbol/text matches
grep "useUser" app/composables/              # Find exact function name
grep "interface User" app/types/             # Find type definition
grep -r "createSharedComposable"             # Check usage across files
grep "walletAddress" --include="*.vue"       # Find in Vue files only

# mgrep - Intent-based semantic search
mgrep "authentication logic"                 # Explore auth implementation
mgrep "error boundary handling"              # Discover error patterns
mgrep "wallet connection flow"               # Understand Web3 integration
mgrep "data fetching with caching"           # Find TanStack Query usage
mgrep "composable state management"          # Discover state patterns
mgrep "how are notifications displayed"      # Natural language queries

# Combined workflow example
# 1. Use mgrep to discover feature location
mgrep "user menu dropdown implementation"    # → finds components/UserMenu.vue

# 2. Use grep to find all usages
grep -r "UserMenu" app/                      # → see where it's imported
```

### Best Practices

1. **Start with mgrep** for exploration and understanding
2. **Switch to grep** once you know the exact symbol/pattern
3. **Use mgrep for:**
   - "How does X work?"
   - "Where is Y implemented?"
   - "What handles Z?"
4. **Use grep for:**
   - Finding all usages of a function
   - Refactoring symbol names
   - Exact regex patterns

## Nuxt 4 Best Practices

### Auto-imports
- All Vue composables (`ref`, `computed`, `watch`, etc.) are auto-imported
- Components are auto-imported from `app/components/`
- Nuxt utilities (`navigateTo`, `useRoute`, `useRouter`, etc.) are auto-imported
- **IMPORTANT**: Always import `createSharedComposable` from `@vueuse/core` explicitly

### File-based Routing
- Pages in `app/pages/` automatically become routes
- Use `[id].vue` for dynamic routes (e.g., `/chat/[id]`)
- Nested routes use folder structure

### Composables Pattern

**Standard pattern for ALL shared composables:**

**See actual implementation:** `app/composables/useUser.ts`, `app/composables/useNotifications.ts`

```typescript
// Real example from app/composables/useUser.ts
import { createSharedComposable } from '@vueuse/core'

export const useUser = createSharedComposable(() => {
  const user = ref({
    name: 'Guest User',
    email: 'guest@example.com',
    username: 'guest',
    avatar: undefined as string | undefined,
    bio: undefined as string | undefined,
  })

  const isAuthenticated = computed(() => user.value.email !== 'guest@example.com')

  const avatarProps = computed(() => ({
    src: user.value.avatar,
    alt: user.value.name,
    fallback: user.value.name
      .split(' ')
      .map((n) => n[0])
      .join(''),
  }))

  function updateUser(updates: Partial<typeof user.value>) {
    user.value = { ...user.value, ...updates }
  }

  function logout() {
    user.value = {
      name: 'Guest User',
      email: 'guest@example.com',
      username: 'guest',
      avatar: undefined,
      bio: undefined,
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    avatarProps,
    updateUser,
    logout,
  }
})
```

**Why `createSharedComposable`?**
- Ensures single instance across all components
- Prevents state duplication
- Works seamlessly with Nuxt's auto-import

**Current Composables:**
- ✅ `useUser()` - User state and authentication (app/composables/useUser.ts)
- ✅ `useNotifications()` - Notification system (app/composables/useNotifications.ts)
- ✅ `useDashboard()` - Dashboard state & keyboard shortcuts (app/composables/useDashboard.ts)
- ✅ `useModels()` - AI model selection (app/composables/useModels.ts)
- `useChats()` - Chat grouping (doesn't need shared state)

### Nuxt Plugins

**Client-only plugins:**
- Use `.client.ts` suffix for browser-only code
- Example: `appkit.client.ts` (Web3 requires window/browser APIs)

**Plugin execution order:**
- Use `enforce: 'pre'` to run before other plugins
- Default execution: alphabetical order

**Providing global instances:**
```typescript
export default defineNuxtPlugin({
  name: 'my-plugin',
  enforce: 'pre',
  setup(nuxtApp) {
    const instance = createSomething()

    return {
      provide: {
        instance  // Available as $instance in components
      }
    }
  }
})
```

## Nuxt UI Component Library (v4)

### Theming System

**Runtime Configuration** (`app/app.config.ts`):
```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',    // Main brand color
      neutral: 'zinc'      // Text, borders, backgrounds
    }
  }
})
```

**CSS Theme Configuration** (`app/assets/css/main.css`):
```css
@import 'tailwindcss';
@import '@nuxt/ui';

@theme {
  /* Custom theme variables (fonts, breakpoints, etc.) */
  --font-sans: 'Public Sans', sans-serif;
}

@theme static {
  /* Override default Tailwind colors */
  --color-green-50: #effdf5;
  --color-green-100: #d9fbe8;
  /* ... all shades 50-950 */
}
```

**IMPORTANT CSS Rules:**
- Use `@theme` for custom variables (fonts, breakpoints)
- Use `@theme static` ONLY for overriding default Tailwind colors
- Always define all color shades (50-950) when overriding colors
- Remove `theme(static)` from the import - it's incorrect syntax

### Semantic Colors

Components use semantic color names:
- `primary` - Main CTAs, brand elements (default: green)
- `secondary` - Secondary actions (default: blue)
- `success` - Success states (default: green)
- `info` - Info alerts (default: blue)
- `warning` - Warnings (default: yellow)
- `error` - Errors, destructive actions (default: red)
- `neutral` - Text, borders, backgrounds (default: slate)

Usage:
```vue
<UButton color="primary">Save</UButton>
<UButton color="error">Delete</UButton>
```

### Icon System

Format: `i-{collection}-{name}`
- `i-lucide-user` - Lucide icons (primary collection)
- `i-simple-icons-github` - Brand icons

Icons are auto-loaded on demand. No manual installation needed for basic collections.

### Common Component Patterns

```vue
<template>
  <!-- Button -->
  <UButton
    icon="i-lucide-plus"
    label="Add Item"
    color="primary"
    variant="soft"
  />

  <!-- Avatar with fallback -->
  <UAvatar
    :src="user.avatar"
    :alt="user.name"
    icon="i-lucide-user"
    size="md"
  />

  <!-- Dropdown Menu -->
  <UDropdownMenu
    :items="menuItems"
    :content="{ align: 'center', collisionPadding: 12 }"
  >
    <UButton label="Menu" />
  </UDropdownMenu>

  <!-- Card -->
  <UCard>
    <template #header>Title</template>
    Content
    <template #footer>Actions</template>
  </UCard>

  <!-- Dashboard Layout -->
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" />
    </template>
    <template #body>
      <!-- Content -->
    </template>
  </UDashboardPanel>
</template>
```

## Reown AppKit (Web3 Wallet Integration)

### Setup Architecture

**Configuration Flow:**
1. Define networks in `app/config/appkit.ts`
2. Create WagmiAdapter with networks + projectId
3. Initialize AppKit with adapter
4. Register WagmiPlugin with Vue app

**Key Files:**
- `app/config/appkit.ts` - Network configuration
- `app/plugins/appkit.client.ts` - AppKit initialization

### Network Configuration

```typescript
// app/config/appkit.ts
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
  mainnet,
  base,
  polygon,
  optimism,
  arbitrum,
  type AppKitNetwork,
} from '@reown/appkit/networks'

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [
  mainnet,
  base,
  polygon,
  optimism,
  arbitrum,
]

export function createWagmiAdapter(projectId: string) {
  return new WagmiAdapter({ networks, projectId })
}
```

### Plugin Setup

```typescript
// app/plugins/appkit.client.ts
export default defineNuxtPlugin({
  name: 'appkit',
  enforce: 'pre',
  setup(nuxtApp) {
    const config = useRuntimeConfig()
    const projectId = config.public.reownProjectId as string

    const wagmiAdapter = createWagmiAdapter(projectId)

    const appKit = createAppKit({
      adapters: [wagmiAdapter],
      networks,
      projectId,
      metadata: {
        name: 'DeFi Assistant',
        description: 'Your DeFi lending/borrowing assistant',
        url: 'https://defi-assistant.app',
        icons: ['https://defi-assistant.app/icon.png'],
      },
      features: {
        analytics: true,
      },
    })

    nuxtApp.vueApp.use(WagmiPlugin, { config: wagmiAdapter.wagmiConfig })

    return { provide: { appKit } }
  },
})
```

### Using in Components

```vue
<script setup>
import { useAppKit, useAppKitAccount } from '@reown/appkit/vue'

const { open } = useAppKit()
const account = useAppKitAccount()

const isConnected = computed(() => account.value.isConnected)
const address = computed(() => account.value.address)
</script>

<template>
  <UButton @click="open()">
    {{ isConnected ? address : 'Connect Wallet' }}
  </UButton>
</template>
```

### Wagmi Composables

```typescript
import { useAccount, useBalance, useDisconnect } from '@wagmi/vue'

const { address, isConnected } = useAccount()
const { data: balance } = useBalance({ address })
const { disconnect } = useDisconnect()
```

## TanStack Query (Vue Query)

### What is TanStack Query?

A powerful data-fetching and state management library that provides:
- **Automatic caching** - Stores API responses to avoid redundant requests
- **Background updates** - Refetches stale data automatically
- **Request deduplication** - Multiple components requesting same data = 1 API call
- **Loading & error states** - Built-in state management
- **SSR compatible** - Works with Nuxt's server-side rendering

### Why It's in This Project

**TanStack Query is required by Wagmi** for blockchain data management:

```
Reown AppKit → Wagmi → TanStack Query
```

Wagmi uses it to cache expensive RPC calls (balances, transactions, contract reads).

### Configuration

```typescript
// app/plugins/vue-query.ts
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,        // Data fresh for 5 minutes
        gcTime: 10 * 60 * 1000,          // Cache for 10 minutes
        refetchOnWindowFocus: false,     // Don't refetch on tab switch
        retry: 1,                        // Retry failed requests once
      },
    },
  })

  nuxtApp.vueApp.use(VueQueryPlugin, { queryClient })
})
```

### Usage Examples

```typescript
import { useQuery, useMutation } from '@tanstack/vue-query'

// Fetch data with automatic caching
const { data, isLoading, error } = useQuery({
  queryKey: ['portfolio', walletAddress],
  queryFn: () => fetch(`/api/portfolio/${walletAddress}`).then(r => r.json())
})

// Mutate data with optimistic updates
const mutation = useMutation({
  mutationFn: (data) => fetch('/api/update', { method: 'POST', body: JSON.stringify(data) })
})
```

### When to Use

Use TanStack Query for:
- Fetching DeFi protocol data (APYs, TVL)
- Loading token balances across chains
- Transaction history
- Real-time price feeds
- Portfolio analytics

**Don't use for:**
- Simple local state (use `ref()` or composables)
- Form state (use VeeValidate or similar)

## State Management Patterns

### 1. Shared Composables (Preferred for App State)

**See actual implementation:** `app/composables/useNotifications.ts`

```typescript
// Real example from app/composables/useNotifications.ts
import { createSharedComposable } from '@vueuse/core'

const _useNotifications = () => {
  const notifications = ref<Notification[]>([])

  function add(notification: Omit<Notification, 'id' | 'date'>) {
    notifications.value.unshift({
      ...notification,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    })
  }

  function remove(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clear() {
    notifications.value = []
  }

  return {
    notifications: readonly(notifications),
    add,
    remove,
    clear,
  }
}

export const useNotifications = createSharedComposable(_useNotifications)
```

### 2. TanStack Query (Preferred for Server State)

```typescript
import { useQuery } from '@tanstack/vue-query'

const { data: balance } = useQuery({
  queryKey: ['balance', address],
  queryFn: () => fetchBalance(address)
})
```

### 3. VueUse Utilities

```typescript
// Color mode
const colorMode = useColorMode()
colorMode.preference = 'dark'

// Local storage
const settings = useLocalStorage('app-settings', { theme: 'dark' })

// Clipboard
const { copy, copied } = useClipboard()
copy('text to copy')
```

### 4. Cookies (for Persistence)

```typescript
const model = useCookie<string>('model', {
  default: () => 'openai/gpt-4o'
})
```

## Code Quality Standards

### Type Safety

- ✅ Use TypeScript for all `.ts` and `.vue` files
- ✅ Define interfaces in `app/types/index.d.ts`
- ✅ Avoid `any` type - use `unknown` if type is truly unknown
- ✅ Use type imports: `import type { User } from '~/types'`

### Component Best Practices

- ✅ Use `<script setup>` syntax
- ✅ Define props with TypeScript: `defineProps<{ user: User }>()`
- ✅ Destructure composables: `const { user, logout } = useUser()`
- ✅ Use `computed()` for derived state
- ✅ Avoid `watch()` unless absolutely necessary

### Composable Best Practices

- ✅ ALL shared composables MUST use `createSharedComposable`
- ✅ Import `createSharedComposable` from `@vueuse/core`
- ✅ Use internal function pattern: `const _useX = () => {}; export const useX = createSharedComposable(_useX)`
- ✅ Return only what components need (don't expose internal state)
- ✅ Use descriptive names: `useUser`, not `useU`

### Performance

- ✅ Use `computed()` for expensive calculations
- ✅ Lazy load heavy components with `defineAsyncComponent()`
- ✅ Use TanStack Query for server data (automatic caching)
- ✅ Leverage Nuxt's automatic code splitting (pages, layouts)

### Accessibility

- ✅ Use semantic HTML when possible
- ✅ Add `aria-label` to icon-only buttons
- ✅ Ensure keyboard navigation works
- ✅ Test with keyboard only (Tab, Enter, Escape)

## Common Patterns

### Loading States

```vue
<script setup>
const { data, isLoading, error } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData
})
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>{{ data }}</div>
</template>
```

### Modal/Dialog Pattern

```vue
<script setup>
const isOpen = ref(false)

function handleSubmit() {
  // Handle submission
  isOpen.value = false
}
</script>

<template>
  <UButton @click="isOpen = true">Open</UButton>

  <UModal v-model:open="isOpen" title="Dialog">
    <!-- Content -->
  </UModal>
</template>
```

### Form Validation

```vue
<script setup>
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const form = ref({ email: '', password: '' })

function handleSubmit() {
  const result = schema.safeParse(form.value)
  if (!result.success) {
    // Show errors
    return
  }
  // Submit valid data
}
</script>
```

## Keyboard Shortcuts

Dashboard shortcuts (defined in `useDashboard.ts`):
- `g-h` - Go to home
- `g-c` - Go to chat
- `g-s` - Go to settings
- `n` - Toggle notifications slideover

## Vue 3 & Nuxt 4 Best Practices

### Composition API Best Practices

```vue
<!-- ✅ GOOD: Use <script setup> with proper TypeScript -->
<script setup lang="ts">
import type { User } from '~/types'

// Props with TypeScript
interface Props {
  user: User
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: true
})

// Emits with TypeScript
interface Emits {
  (e: 'update', value: string): void
  (e: 'delete', id: string): void
}

const emit = defineEmits<Emits>()

// Composables (destructure what you need)
const { user: currentUser, logout } = useUser()

// Computed values (cached, reactive)
const fullName = computed(() => `${props.user.firstName} ${props.user.lastName}`)

// Methods
function handleUpdate(value: string) {
  emit('update', value)
}
</script>

<!-- ❌ BAD: Options API, no TypeScript -->
<script>
export default {
  props: ['user', 'isActive'], // ❌ No types
  data() { // ❌ Options API
    return {
      localState: null
    }
  },
  methods: {
    handleClick() {
      this.$emit('update') // ❌ No type safety
    }
  }
}
</script>
```

### Reactivity Best Practices

```typescript
// ✅ GOOD: Use ref for primitives, reactive for objects
const count = ref(0)
const user = reactive({ name: 'Alice', age: 30 })

// ✅ GOOD: Use computed for derived state
const doubleCount = computed(() => count.value * 2)

// ❌ BAD: Destructuring reactive objects loses reactivity
const { name, age } = user // ❌ Not reactive anymore

// ✅ GOOD: Use toRefs or keep object reference
const { name, age } = toRefs(user) // ✅ Reactive
// Or access properties: user.name, user.age ✅

// ✅ GOOD: Use readonly to prevent mutations
const state = readonly(reactive({ count: 0 }))

// ❌ BAD: Watch without proper dependencies
watch(() => {
  console.log(user.name) // ❌ Implicit dependency
})

// ✅ GOOD: Explicit watch source
watch(() => user.name, (newName) => {
  console.log('Name changed:', newName)
})

// ✅ GOOD: Watch multiple sources
watch([() => user.name, () => user.age], ([name, age]) => {
  console.log(`${name} is ${age} years old`)
})
```

### Component Design

```vue
<!-- ✅ GOOD: Single Responsibility, clear props/emits -->
<script setup lang="ts">
interface Props {
  balance: bigint
  symbol: string
  decimals: number
}

const props = defineProps<Props>()

// Format balance (computed, cached)
const formattedBalance = computed(() => {
  return formatUnits(props.balance, props.decimals)
})
</script>

<template>
  <div class="balance-card">
    <span class="amount">{{ formattedBalance }}</span>
    <span class="symbol">{{ symbol }}</span>
  </div>
</template>

<!-- ❌ BAD: Component does too much -->
<script setup>
const { data: balance } = useBalance() // ❌ Fetching
const { disconnect } = useDisconnect() // ❌ Auth logic
const router = useRouter() // ❌ Navigation

function complexBusinessLogic() { /* ❌ Business logic */ }
</script>
```

### Async Component Loading

```typescript
// ✅ GOOD: Lazy load heavy components
const HeavyChart = defineAsyncComponent(() =>
  import('~/components/HeavyChart.vue')
)

// ✅ GOOD: With loading state
const HeavyChart = defineAsyncComponent({
  loader: () => import('~/components/HeavyChart.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200,
  timeout: 3000
})

// ❌ BAD: Import everything upfront
import HeavyChart from '~/components/HeavyChart.vue' // ❌ Always loaded
import AnotherHeavy from '~/components/AnotherHeavy.vue' // ❌
```

## Nuxt 4 Specific Best Practices

### File-Based Routing

```
pages/
├── index.vue                    → /
├── portfolio.vue                → /portfolio
├── portfolio/
│   ├── [id].vue                → /portfolio/:id
│   └── analytics.vue            → /portfolio/analytics
├── settings/
│   ├── index.vue               → /settings
│   ├── profile.vue             → /settings/profile
│   └── security.vue            → /settings/security
└── [...slug].vue               → Catch-all route
```

```vue
<!-- ✅ GOOD: Use dynamic routes with typed params -->
<script setup lang="ts">
// pages/portfolio/[id].vue
const route = useRoute('portfolio-id') // Type-safe route

// Access params (automatically typed)
const portfolioId = route.params.id
</script>

<!-- ✅ GOOD: Navigate programmatically -->
<script setup>
const router = useRouter()

function goToPortfolio(id: string) {
  router.push(`/portfolio/${id}`)
  // Or with route object:
  // router.push({ name: 'portfolio-id', params: { id } })
}
</script>
```

### Nuxt Plugins Best Practices

```typescript
// ✅ GOOD: Type-safe plugin with client-only code
// plugins/appkit.client.ts
export default defineNuxtPlugin({
  name: 'appkit',
  enforce: 'pre', // Run before other plugins
  setup(nuxtApp) {
    // Only runs on client
    const config = useRuntimeConfig()
    const wagmiAdapter = createWagmiAdapter(config.public.reownProjectId)

    const appKit = createAppKit({
      adapters: [wagmiAdapter],
      networks,
      projectId: config.public.reownProjectId,
      metadata: { /* ... */ }
    })

    // Provide to components
    return {
      provide: {
        appKit
      }
    }
  }
})

// Usage in components:
const { $appKit } = useNuxtApp()

// ❌ BAD: No .client suffix for browser-only code
// plugins/appkit.ts → Will fail on SSR
```

### Server vs Client Code

```typescript
// ✅ GOOD: Use .client.ts for browser-only
// composables/useLocalStorage.client.ts
export const useLocalStorage = () => {
  const store = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value))
  }
  return { store }
}

// ✅ GOOD: Check for browser environment
const isBrowser = process.client
if (isBrowser) {
  localStorage.setItem('key', 'value')
}

// ❌ BAD: Use browser APIs without checks
localStorage.setItem('key', 'value') // ❌ Fails on SSR
window.ethereum // ❌ Fails on SSR
```

### Runtime Config

```typescript
// ✅ GOOD: Define runtime config in nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Private (server-only)
    apiSecret: '',

    // Public (exposed to client)
    public: {
      reownProjectId: '',
      apiBaseUrl: ''
    }
  }
})

// Usage:
const config = useRuntimeConfig()
const projectId = config.public.reownProjectId

// ❌ BAD: Hardcode sensitive values
const API_KEY = 'sk_live_...' // ❌ Exposed in bundle
```

### Auto-imports Configuration

```typescript
// ✅ GOOD: Leverage auto-imports for common patterns
// No imports needed for:
// - Vue: ref, computed, watch, onMounted, etc.
// - Nuxt: useRoute, useRouter, navigateTo, etc.
// - Components from app/components/

// ✅ GOOD: Explicit import for specific utilities
import { createSharedComposable } from '@vueuse/core'
import type { User } from '~/types'

// ❌ BAD: Import auto-imported items
import { ref, computed } from 'vue' // ❌ Redundant
import { useRoute } from 'nuxt/app' // ❌ Auto-imported
```

## Web3 & Blockchain Best Practices

### Wallet Connection

```typescript
// ✅ GOOD: Use Reown AppKit composables
import { useAppKit, useAppKitAccount, useAppKitState } from '@reown/appkit/vue'

const { open } = useAppKit()
const account = useAppKitAccount()
const state = useAppKitState()

const isConnected = computed(() => account.value.isConnected)
const address = computed(() => account.value.address)
const chainId = computed(() => account.value.chainId)

// Open modal
function connect() {
  open() // AppKit handles connection flow
}

// ❌ BAD: Manual wallet connection
window.ethereum.request({ method: 'eth_requestAccounts' }) // ❌ No UI, errors
```

### Wagmi Hooks Best Practices

```typescript
// ✅ GOOD: Use Wagmi Vue composables
import { useAccount, useBalance, useReadContract } from '@wagmi/vue'

// Get account info
const { address, isConnected, chainId } = useAccount()

// Get balance (auto-refetches)
const { data: balance, isLoading } = useBalance({
  address: address.value
})

// Read contract
const { data: tokenBalance } = useReadContract({
  address: '0x...',
  abi: ERC20_ABI,
  functionName: 'balanceOf',
  args: [address.value]
})

// ✅ GOOD: Watch for changes
watch(address, (newAddress) => {
  if (newAddress) {
    console.log('Wallet connected:', newAddress)
  }
})

// ❌ BAD: Poll for updates manually
setInterval(async () => { // ❌ Inefficient
  const balance = await fetchBalance(address)
}, 1000)
```

### Contract Interactions

```typescript
// ✅ GOOD: Use viem for type-safe contract calls
import { useWriteContract, useWaitForTransactionReceipt } from '@wagmi/vue'
import { parseEther } from 'viem'

const { writeContract, data: hash } = useWriteContract()

async function depositCollateral(amount: string) {
  try {
    await writeContract({
      address: AAVE_POOL_ADDRESS,
      abi: AAVE_POOL_ABI,
      functionName: 'deposit',
      args: [
        TOKEN_ADDRESS,
        parseEther(amount),
        address.value,
        0
      ]
    })
  } catch (error) {
    console.error('Transaction failed:', error)
  }
}

// Wait for confirmation
const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
  hash
})

// ❌ BAD: Raw web3.js with no types
const contract = new web3.eth.Contract(ABI, ADDRESS)
await contract.methods.deposit(amount).send({ from: address }) // ❌ No types
```

### Chain Switching

```typescript
// ✅ GOOD: Use AppKit for chain switching
import { useAppKitState } from '@reown/appkit/vue'
import { useSwitchChain } from '@wagmi/vue'

const { selectedNetworkId } = useAppKitState()
const { switchChain } = useSwitchChain()

async function switchToArbitrum() {
  try {
    await switchChain({ chainId: 42161 })
  } catch (error) {
    console.error('Failed to switch chain:', error)
  }
}

// Check current chain
watch(selectedNetworkId, (chainId) => {
  console.log('Switched to chain:', chainId)
})

// ❌ BAD: Manual chain switching
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0xa4b1' }]
}) // ❌ No error handling, hex conversion
```

### Error Handling

```typescript
// ✅ GOOD: Handle Web3 errors properly
import { type BaseError, UserRejectedRequestError } from 'wagmi'

try {
  await writeContract({ /* ... */ })
} catch (error) {
  if (error instanceof UserRejectedRequestError) {
    console.log('User rejected transaction')
    return
  }

  if (error instanceof BaseError) {
    const revertError = error.walk((e) => e instanceof ContractFunctionRevertedError)
    if (revertError) {
      console.error('Contract reverted:', revertError.reason)
    }
  }

  console.error('Transaction failed:', error)
}

// ❌ BAD: Generic error handling
try {
  await writeContract({ /* ... */ })
} catch (error) {
  alert('Error!') // ❌ No context
}
```

## TanStack Query Best Practices

### Query Configuration

```typescript
// ✅ GOOD: Configure query with proper options
import { useQuery } from '@tanstack/vue-query'

const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['portfolio', address], // Unique key
  queryFn: () => fetchPortfolio(address.value),
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  enabled: computed(() => !!address.value), // Only fetch when address exists
  retry: 1,
  refetchOnWindowFocus: false
})

// ✅ GOOD: Dependent queries
const { data: user } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser
})

const { data: positions } = useQuery({
  queryKey: ['positions', user.value?.id],
  queryFn: () => fetchPositions(user.value!.id),
  enabled: computed(() => !!user.value?.id) // Wait for user
})

// ❌ BAD: No query key or stale time
const { data } = useQuery({
  queryFn: fetchData // ❌ No cache key, no config
})
```

### Mutations

```typescript
// ✅ GOOD: Mutations with optimistic updates
import { useMutation, useQueryClient } from '@tanstack/vue-query'

const queryClient = useQueryClient()

const { mutate: updatePosition } = useMutation({
  mutationFn: (data: PositionUpdate) => api.updatePosition(data),
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['position', newData.id] })

    // Snapshot previous value
    const previous = queryClient.getQueryData(['position', newData.id])

    // Optimistically update
    queryClient.setQueryData(['position', newData.id], newData)

    return { previous }
  },
  onError: (error, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['position', variables.id], context?.previous)
  },
  onSettled: (data, error, variables) => {
    // Refetch after success or error
    queryClient.invalidateQueries({ queryKey: ['position', variables.id] })
  }
})

// ❌ BAD: No optimistic updates, no error handling
const { mutate } = useMutation({
  mutationFn: updatePosition
})
```

### Infinite Queries

```typescript
// ✅ GOOD: Paginated data with infinite scroll
import { useInfiniteQuery } from '@tanstack/vue-query'

const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteQuery({
  queryKey: ['transactions', address],
  queryFn: ({ pageParam = 0 }) =>
    fetchTransactions(address.value, pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  initialPageParam: 0
})

// Load more button
<UButton
  @click="fetchNextPage"
  :loading="isFetchingNextPage"
  :disabled="!hasNextPage"
>
  Load More
</UButton>
```

## State Management Best Practices

### Composables Pattern

**See actual implementations:** `app/composables/useNotifications.ts`, `app/composables/useUser.ts`, `app/composables/useDashboard.ts`

```typescript
// ✅ GOOD: Shared composable with createSharedComposable (from app/composables/useNotifications.ts)
import { createSharedComposable } from '@vueuse/core'

const _useNotifications = () => {
  const notifications = ref<Notification[]>([])

  function add(notification: Omit<Notification, 'id' | 'date'>) {
    notifications.value.unshift({
      ...notification,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    })
  }

  function remove(id: string) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clear() {
    notifications.value = []
  }

  return {
    notifications: readonly(notifications), // Expose as readonly
    add,
    remove,
    clear
  }
}

export const useNotifications = createSharedComposable(_useNotifications)

// ✅ GOOD: Dashboard composable with keyboard shortcuts (from app/composables/useDashboard.ts)
export const useDashboard = createSharedComposable(() => {
  const isNotificationsSideoverOpen = ref(false)

  function toggleNotificationsSlideover() {
    isNotificationsSideoverOpen.value = !isNotificationsSideoverOpen.value
  }

  // Real keyboard shortcuts from the codebase
  const shortcuts = [
    {
      keys: ['g', 'h'],
      action: () => navigateTo('/'),
      label: 'Go to home',
    },
    {
      keys: ['g', 'c'],
      action: () => navigateTo('/chat'),
      label: 'Go to chat',
    },
    {
      keys: ['g', 's'],
      action: () => navigateTo('/settings'),
      label: 'Go to settings',
    },
    {
      keys: ['n'],
      action: toggleNotificationsSlideover,
      label: 'Toggle notifications',
    },
  ]

  return {
    isNotificationsSideoverOpen,
    toggleNotificationsSlideover,
    shortcuts,
  }
})

// ❌ BAD: No createSharedComposable
export const useNotifications = () => {
  const notifications = ref<Notification[]>([]) // ❌ New instance per call
  // ...
}
```

### Cookie Storage

```typescript
// ✅ GOOD: Use useCookie for persistence
const theme = useCookie<'light' | 'dark'>('theme', {
  default: () => 'dark',
  maxAge: 60 * 60 * 24 * 365, // 1 year
  sameSite: 'lax'
})

// Auto-synced across tabs
theme.value = 'light'

// ❌ BAD: Manual localStorage
localStorage.setItem('theme', 'light') // ❌ Not SSR-safe
```

### VueUse Utilities

```typescript
// ✅ GOOD: Use VueUse for common patterns
import { useClipboard, useLocalStorage, useColorMode } from '@vueuse/core'

// Clipboard
const { copy, copied, isSupported } = useClipboard()
copy('0x123...')

// Color mode
const mode = useColorMode({
  attribute: 'class',
  modes: { light: 'light', dark: 'dark' }
})

// Local storage with reactivity
const settings = useLocalStorage('settings', {
  notifications: true,
  soundEnabled: false
})
```

## Performance Optimization

### Component Memoization

```vue
<!-- ✅ GOOD: Use v-memo for expensive lists -->
<template>
  <div
    v-for="item in items"
    :key="item.id"
    v-memo="[item.id, item.status]"
  >
    <!-- Only re-renders if id or status changes -->
    <ExpensiveComponent :item="item" />
  </div>
</template>

<!-- ✅ GOOD: Use v-once for static content -->
<div v-once>
  <h1>{{ staticTitle }}</h1>
  <p>This content never changes</p>
</div>
```

### Lazy Hydration

```vue
<!-- ✅ GOOD: Lazy hydrate heavy components -->
<script setup>
import { LazyChart } from '#components'
</script>

<template>
  <ClientOnly>
    <LazyChart :data="chartData" />
    <template #fallback>
      <div>Loading chart...</div>
    </template>
  </ClientOnly>
</template>
```

### Debouncing & Throttling

```typescript
// ✅ GOOD: Use VueUse for debouncing
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

const searchTerm = ref('')

// Debounce search
const debouncedSearch = useDebounceFn((value: string) => {
  performSearch(value)
}, 300)

watch(searchTerm, debouncedSearch)

// Throttle scroll handler
const handleScroll = useThrottleFn(() => {
  console.log('Scrolling...')
}, 100)
```

## Troubleshooting

### Common Issues

**Issue**: AppKit not loading
- ✅ Check `NUXT_PUBLIC_REOWN_PROJECT_ID` is set
- ✅ Verify project ID is valid at cloud.reown.com
- ✅ Ensure plugin is `.client.ts` (not `.ts`)

**Issue**: Composable state not shared
- ✅ Wrap with `createSharedComposable`
- ✅ Import from `@vueuse/core`

**Issue**: Icons not showing
- ✅ Check icon name format: `i-collection-name`
- ✅ Verify collection is installed (lucide, simple-icons)
- ✅ Try different icon from same collection

**Issue**: TypeScript errors
- ✅ Run `pnpm typecheck` to see all errors
- ✅ Check imports use `type` keyword when needed
- ✅ Ensure types are exported from `~/types`

**Issue**: Hydration mismatch
- ✅ Ensure server and client render same HTML initially
- ✅ Use `<ClientOnly>` for browser-only components
- ✅ Don't use `Date.now()` or `Math.random()` in template during SSR
- ✅ Check for browser APIs used during SSR

**Issue**: Query not refetching
- ✅ Check `staleTime` configuration
- ✅ Verify `enabled` condition is true
- ✅ Use `refetch()` or `invalidateQueries()` manually
- ✅ Check if query key changes when it should

## Common Anti-Patterns

### 1. Reactive Destruction

```typescript
// ❌ BAD: Destructuring reactive object
const user = reactive({ name: 'Alice', age: 30 })
const { name } = user // ❌ Not reactive

// ✅ GOOD: Use toRefs or keep reference
const { name } = toRefs(user) // ✅ Reactive
// Or: user.name ✅
```

### 2. Watch Overuse

```typescript
// ❌ BAD: Watch for derived state
const count = ref(0)
const doubled = ref(0)

watch(count, (newCount) => {
  doubled.value = newCount * 2 // ❌ Use computed instead
})

// ✅ GOOD: Use computed
const doubled = computed(() => count.value * 2)
```

### 3. Props Mutation

```vue
<script setup>
const props = defineProps<{ count: number }>()

// ❌ BAD: Mutate props
props.count++ // ❌ Never mutate props

// ✅ GOOD: Emit event or use local copy
const emit = defineEmits<{ (e: 'update', value: number): void }>()
emit('update', props.count + 1)
</script>
```

### 4. Inline Functions in Templates

```vue
<!-- ❌ BAD: Inline function creates new instance on every render -->
<template>
  <UButton @click="() => handleClick(item.id)">
    Click
  </UButton>
</template>

<!-- ✅ GOOD: Use method or computed -->
<script setup>
function handleItemClick(id: string) {
  handleClick(id)
}
</script>

<template>
  <UButton @click="() => handleItemClick(item.id)">
    Click
  </UButton>
</template>
```

## Resources

### Official Documentation
- [Vue 3 Docs](https://vuejs.org/)
- [Nuxt 4 Docs](https://nuxt.com/)
- [Composition API RFC](https://vuejs.org/guide/extras/composition-api-faq.html)
- [@nuxt/ui Documentation](https://ui.nuxt.com/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

### Web3 Documentation
- [Reown AppKit](https://docs.reown.com/appkit/overview)
- [Wagmi Vue](https://wagmi.sh/vue/getting-started)
- [viem Documentation](https://viem.sh/)
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/vue/overview)

### VueUse
- [VueUse Documentation](https://vueuse.org/)
- [VueUse Functions](https://vueuse.org/functions.html)

### TypeScript
- [Vue TypeScript Guide](https://vuejs.org/guide/typescript/overview.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### Performance
- [Vue Performance Guide](https://vuejs.org/guide/best-practices/performance.html)
- [Nuxt Performance](https://nuxt.com/docs/guide/concepts/rendering#performance)

---

*Keep this document updated as patterns evolve and new best practices emerge.*
