<script setup lang="ts">
import { useAppKit, useAppKitAccount, useAppKitNetwork, useDisconnect } from '@reown/appkit/vue'
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const { open } = useAppKit()
const { disconnect } = useDisconnect()

const account = useAppKitAccount()
const network = useAppKitNetwork()

const isConnected = computed(() => account.value.isConnected)
const address = computed(() => account.value.address)
const status = computed(() => account.value.status)
const chainName = computed(() => network.value.caipNetwork?.name)

const isConnecting = computed(
  () => status.value === 'connecting' || status.value === 'reconnecting'
)

const displayAddress = computed(() => {
  if (!address.value) return ''
  return `${address.value.slice(0, 6)}...${address.value.slice(-4)}`
})

const { copy, copied } = useClipboard()

const disconnectedState = {
  label: 'Connect Wallet',
  avatar: {
    icon: 'i-lucide-wallet',
    class: 'bg-primary/10 text-primary',
  },
}

const connectedState = computed(() => ({
  label: displayAddress.value,
  avatar: {
    icon: 'i-lucide-wallet',
    class: 'bg-primary/10 text-primary',
  },
}))

const currentState = computed(() => (isConnected.value ? connectedState.value : disconnectedState))

const items = computed<DropdownMenuItem[][]>(() => {
  if (!isConnected.value) {
    return [
      [
        {
          label: 'Connect Wallet',
          icon: 'i-lucide-wallet',
          onSelect: () => open(),
        },
      ],
    ]
  }

  return [
    [
      {
        type: 'label',
        label: chainName.value || 'Connected',
        icon: 'i-lucide-link',
      },
    ],
    [
      {
        label: copied.value ? 'Copied!' : 'Copy address',
        icon: copied.value ? 'i-lucide-check' : 'i-lucide-copy',
        onSelect: () => copy(address.value || ''),
      },
      {
        label: 'Switch network',
        icon: 'i-lucide-arrow-left-right',
        onSelect: () => open({ view: 'Networks' }),
      },
      {
        label: 'Wallet details',
        icon: 'i-lucide-settings',
        onSelect: () => open(),
      },
    ],
    [
      {
        label: 'Disconnect',
        icon: 'i-lucide-log-out',
        color: 'error' as const,
        onSelect: async () => await disconnect(),
      },
    ],
  ]
})
</script>

<template>
  <!-- Disconnected: simple button -->
  <UButton
    v-if="!isConnected"
    color="primary"
    variant="soft"
    block
    :square="collapsed"
    :loading="isConnecting"
    class="data-[state=open]:bg-elevated"
    :class="[!collapsed && 'py-2']"
    @click="open()"
  >
    <template #leading>
      <UAvatar icon="i-lucide-wallet" size="2xs" class="bg-primary/10 text-primary" />
    </template>
    <span v-if="!collapsed">{{ isConnecting ? 'Connecting...' : 'Connect Wallet' }}</span>
  </UButton>

  <!-- Connected: dropdown menu -->
  <UDropdownMenu
    v-else
    :items="items"
    :content="{ side: 'bottom', align: 'start', sideOffset: 8, collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      :ui="{ trailingIcon: 'text-dimmed' }"
    >
      <template #leading>
        <UAvatar icon="i-lucide-wallet" size="xs" class="bg-primary/10 text-primary" />
      </template>
      <template v-if="!collapsed" #default>
        <div class="flex flex-col items-start text-left min-w-0 flex-1">
          <span class="truncate text-sm font-medium">{{ displayAddress }}</span>
          <span v-if="chainName" class="text-xs text-dimmed truncate">{{ chainName }}</span>
        </div>
      </template>
      <template v-if="!collapsed" #trailing>
        <UIcon name="i-lucide-chevrons-up-down" class="size-4 text-dimmed" />
      </template>
    </UButton>
  </UDropdownMenu>
</template>
