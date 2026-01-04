<script setup lang="ts">
const { isNotificationsSlideoverOpen } = useDashboard()
const { notifications, markAsRead, markAllAsRead, hasUnread } = useNotifications()
</script>

<template>
  <USlideover v-model:open="isNotificationsSlideoverOpen" title="Notifications">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <span class="font-semibold">Notifications</span>
        <UButton
          v-if="hasUnread"
          label="Mark all as read"
          variant="ghost"
          size="xs"
          @click="markAllAsRead"
        />
      </div>
    </template>

    <template #body>
      <div v-if="notifications.length === 0" class="text-center text-muted py-8">
        <UIcon name="i-lucide-bell-off" class="size-8 mb-2" />
        <p>No notifications yet</p>
      </div>

      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="px-3 py-2.5 rounded-md hover:bg-elevated/50 flex items-center gap-3 relative -mx-3 first:-mt-3 last:-mb-3 cursor-pointer"
        @click="markAsRead(notification.id)"
      >
        <UChip color="error" :show="!!notification.unread" inset>
          <UAvatar v-bind="notification.sender.avatar" :alt="notification.sender.name" size="md" />
        </UChip>

        <div class="text-sm flex-1">
          <p class="flex items-center justify-between">
            <span class="text-highlighted font-medium">{{ notification.sender.name }}</span>
            <time :datetime="notification.date" class="text-muted text-xs" />
          </p>

          <p class="text-dimmed">
            {{ notification.body }}
          </p>
        </div>
      </div>
    </template>
  </USlideover>
</template>
