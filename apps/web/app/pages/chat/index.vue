<script setup lang="ts">
const input = ref('')
const loading = ref(false)
const router = useRouter()

const { model } = useModels()

async function createChat(prompt: string) {
  if (!prompt.trim()) return

  input.value = prompt
  loading.value = true

  // Generate a new chat ID
  const chatId = crypto.randomUUID()

  // Navigate to the chat page with the initial message
  await router.push({
    path: `/chat/${chatId}`,
    query: { message: prompt }
  })
}

async function onSubmit() {
  await createChat(input.value)
}

const quickChats = [
  {
    label: 'Explain DeFi yield farming',
    icon: 'i-lucide-sprout'
  },
  {
    label: 'What is impermanent loss?',
    icon: 'i-lucide-help-circle'
  },
  {
    label: 'Best practices for wallet security',
    icon: 'i-lucide-shield'
  },
  {
    label: 'Compare DEX vs CEX',
    icon: 'i-lucide-scale'
  },
  {
    label: 'Explain gas fees on Ethereum',
    icon: 'i-lucide-fuel'
  },
  {
    label: 'What are liquidity pools?',
    icon: 'i-lucide-droplets'
  }
]
</script>

<template>
  <UDashboardPanel id="chat-home" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <ChatNavbar />
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col justify-center gap-4 sm:gap-6 py-8">
        <h1 class="text-3xl sm:text-4xl text-highlighted font-bold">
          How can I help you today?
        </h1>

        <UChatPrompt
          v-model="input"
          :status="loading ? 'streaming' : 'ready'"
          class="[view-transition-name:chat-prompt]"
          variant="subtle"
          :ui="{ base: 'px-1.5' }"
          @submit="onSubmit"
        >
          <template #footer>
            <div class="flex items-center gap-1">
              <ChatModelSelect />
            </div>

            <UChatPromptSubmit color="neutral" size="sm" />
          </template>
        </UChatPrompt>

        <div class="flex flex-wrap gap-2">
          <UButton
            v-for="quickChat in quickChats"
            :key="quickChat.label"
            :icon="quickChat.icon"
            :label="quickChat.label"
            size="sm"
            color="neutral"
            variant="outline"
            class="rounded-full"
            @click="createChat(quickChat.label)"
          />
        </div>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
