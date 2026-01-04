<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard()
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col items-center justify-center min-h-96 gap-6 p-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-highlighted mb-2">Welcome to DeFi Assistant</h1>
          <p class="text-muted">Your personal dashboard for managing DeFi activities</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-wallet" class="size-5 text-primary" />
                <span class="font-medium">Portfolio</span>
              </div>
            </template>
            <p class="text-muted text-sm">Track your DeFi portfolio across multiple chains.</p>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-message-circle" class="size-5 text-primary" />
                <span class="font-medium">AI Chat</span>
              </div>
            </template>
            <p class="text-muted text-sm">
              Get AI-powered insights and assistance for your DeFi activities.
            </p>
            <template #footer>
              <UButton to="/chat" variant="soft" size="sm">Open Chat</UButton>
            </template>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-settings" class="size-5 text-primary" />
                <span class="font-medium">Settings</span>
              </div>
            </template>
            <p class="text-muted text-sm">Configure your preferences and manage your account.</p>
            <template #footer>
              <UButton to="/settings" variant="soft" size="sm">Open Settings</UButton>
            </template>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
