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

  const avatarProps = computed(() => {
    if (user.value.avatar) {
      return { src: user.value.avatar, alt: user.value.name }
    }
    return { icon: 'i-lucide-user', class: 'bg-muted' }
  })

  function updateUser(data: Partial<typeof user.value>) {
    Object.assign(user.value, data)
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
    user,
    isAuthenticated,
    avatarProps,
    updateUser,
    logout,
  }
})
