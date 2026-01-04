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

```typescript
import { createSharedComposable } from '@vueuse/core'

const _useFeature = () => {
  const state = ref(initialValue)
  const computed = computed(() => /* ... */)

  function action() { /* ... */ }

  return { state, computed, action }
}

export const useFeature = createSharedComposable(_useFeature)
```

**Why `createSharedComposable`?**
- Ensures single instance across all components
- Prevents state duplication
- Works seamlessly with Nuxt's auto-import

**Current Composables:**
- ✅ `useUser()` - User state and authentication
- ✅ `useNotifications()` - Notification system
- ✅ `useDashboard()` - Dashboard state & keyboard shortcuts
- ✅ `useModels()` - AI model selection
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

```typescript
import { createSharedComposable } from '@vueuse/core'

const _useNotifications = () => {
  const notifications = ref<Notification[]>([])

  function addNotification(notification: Omit<Notification, 'id' | 'date'>) {
    notifications.value.unshift({
      ...notification,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    })
  }

  return { notifications, addNotification }
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

## Migration Notes

### Recent Code Quality Improvements

1. **Removed duplicate type definitions** - `Notification` and `User` types removed from `types/index.d.ts` (defined in composables)
2. **Fixed composable patterns** - All shared composables now use `createSharedComposable` consistently
3. **Improved CSS theme config** - Separated `@theme` (custom) from `@theme static` (overrides)
4. **Cleaned up placeholder URLs** - Removed/commented placeholder GitHub links
5. **Enhanced Vue Query config** - Added sensible defaults for caching and retries
6. **Removed workarounds** - Cleaned up 'old-neutral' chip display workaround

### Breaking Changes from Cleanup

None - all changes are backward compatible improvements.
