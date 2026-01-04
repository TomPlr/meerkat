export interface Notification {
  id: string | number
  unread: boolean
  sender: {
    name: string
    avatar: {
      icon?: string
      src?: string
      class?: string
    }
  }
  body: string
  date: string
}

export const useNotifications = createSharedComposable(() => {
  const notifications = ref<Notification[]>([
    {
      id: 1,
      unread: true,
      sender: {
        name: 'System',
        avatar: { icon: 'i-lucide-bell', class: 'bg-primary/10 text-primary' },
      },
      body: 'Welcome to DeFi Assistant!',
      date: new Date().toISOString(),
    },
  ])

  const unreadCount = computed(() => notifications.value.filter(n => n.unread).length)
  const hasUnread = computed(() => unreadCount.value > 0)

  function addNotification(notification: Omit<Notification, 'id' | 'date'>) {
    notifications.value.unshift({
      ...notification,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    })
  }

  function markAsRead(id: string | number) {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.unread = false
    }
  }

  function markAllAsRead() {
    notifications.value.forEach(n => (n.unread = false))
  }

  function removeNotification(id: string | number) {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  function clearAll() {
    notifications.value = []
  }

  return {
    notifications,
    unreadCount,
    hasUnread,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  }
})
