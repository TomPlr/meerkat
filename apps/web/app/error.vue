<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })

const statusCode = computed(() => props.error?.statusCode ?? 500)
const statusMessage = computed(() => {
  if (statusCode.value === 404) {
    return 'Page not found'
  }
  return props.error?.statusMessage ?? 'An error occurred'
})

const description = computed(() => {
  if (statusCode.value === 404) {
    return "The page you're looking for doesn't exist or has been moved."
  }
  return 'Something went wrong. Please try again later.'
})

const icon = computed(() => {
  if (statusCode.value === 404) {
    return 'i-lucide-file-question'
  }
  return 'i-lucide-alert-triangle'
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-default">
    <div class="text-center px-4">
      <div class="mb-6">
        <UIcon :name="icon" class="size-16 text-muted mx-auto" />
      </div>

      <h1 class="text-6xl font-bold text-highlighted mb-2">
        {{ statusCode }}
      </h1>

      <h2 class="text-2xl font-semibold text-highlighted mb-4">
        {{ statusMessage }}
      </h2>

      <p class="text-muted mb-8 max-w-md mx-auto">
        {{ description }}
      </p>

      <div class="flex gap-3 justify-center">
        <UButton
          label="Go home"
          icon="i-lucide-home"
          color="primary"
          @click="handleError"
        />
        <UButton
          label="Go back"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="outline"
          @click="$router.back()"
        />
      </div>
    </div>
  </div>
</template>
