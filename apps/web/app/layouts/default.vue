<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const open = ref(false)

const links = [
  [
    {
      label: 'Home',
      icon: 'i-lucide-house',
      to: '/',
      onSelect: () => {
        open.value = false
      },
    },
    {
      label: 'AI Chat',
      icon: 'i-lucide-message-circle',
      to: '/chat',
      onSelect: () => {
        open.value = false
      },
    },
    {
      label: 'Settings',
      to: '/settings',
      icon: 'i-lucide-settings',
      defaultOpen: true,
      type: 'trigger',
      children: [
        {
          label: 'General',
          to: '/settings',
          exact: true,
          onSelect: () => {
            open.value = false
          },
        },
        {
          label: 'Notifications',
          to: '/settings/notifications',
          onSelect: () => {
            open.value = false
          },
        },
      ],
    },
  ],
  // [
  //   {
  //     label: 'Feedback',
  //     icon: 'i-lucide-message-circle',
  //     to: 'https://github.com/your-repo/issues',
  //     target: '_blank',
  //   },
  //   {
  //     label: 'Help & Support',
  //     icon: 'i-lucide-info',
  //     to: 'https://github.com/your-repo',
  //     target: '_blank',
  //   },
  // ],
] satisfies NavigationMenuItem[][]

const groups = computed(() => [
  {
    id: 'links',
    label: 'Go to',
    items: links.flat(),
  },
  // {
  //   id: 'code',
  //   label: 'Code',
  //   items: [
  //     {
  //       id: 'source',
  //       label: 'View page source',
  //       icon: 'i-simple-icons-github',
  //       to: `https://github.com/your-repo`,
  //       target: '_blank',
  //     },
  //   ],
  // },
])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <ClientOnly>
          <WalletsMenu :collapsed="collapsed" />
        </ClientOnly>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
