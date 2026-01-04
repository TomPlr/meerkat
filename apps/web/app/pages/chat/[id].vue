<script setup lang="ts">
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const route = useRoute()
const router = useRouter()
const { model } = useModels()

const input = ref('')
const messages = ref<Message[]>([])
const isStreaming = ref(false)

// Check for initial message from query
const initialMessage = route.query.message as string | undefined

onMounted(async () => {
  if (initialMessage) {
    // Remove the query parameter from URL
    router.replace({ path: route.path })

    // Add the initial user message
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'user',
      content: initialMessage
    })

    // Simulate AI response (replace with actual API call)
    await generateResponse(initialMessage)
  }
})

async function generateResponse(userMessage: string) {
  isStreaming.value = true

  // Simulate streaming response (replace with actual AI API)
  const assistantMessage: Message = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: ''
  }
  messages.value.push(assistantMessage)

  // Simulated response - replace with actual API integration
  const response = `Thank you for your question about "${userMessage}".

This is a placeholder response. To enable real AI responses, you'll need to:

1. Set up an AI provider (OpenAI, Anthropic, etc.)
2. Create an API endpoint in your server
3. Connect this chat interface to your API

The chat UI is fully functional and ready for integration!`

  // Simulate streaming
  for (const char of response) {
    assistantMessage.content += char
    await new Promise(resolve => setTimeout(resolve, 10))
  }

  isStreaming.value = false
}

async function handleSubmit() {
  if (!input.value.trim() || isStreaming.value) return

  const userMessage = input.value
  input.value = ''

  messages.value.push({
    id: crypto.randomUUID(),
    role: 'user',
    content: userMessage
  })

  await generateResponse(userMessage)
}

const status = computed(() => {
  if (isStreaming.value) return 'streaming'
  return 'ready'
})
</script>

<template>
  <UDashboardPanel id="chat-conversation" class="relative" :ui="{ body: 'p-0 sm:p-0' }">
    <template #header>
      <ChatNavbar />
    </template>

    <template #body>
      <UContainer class="flex-1 flex flex-col gap-4 sm:gap-6">
        <UChatMessages
          should-auto-scroll
          :messages="messages"
          :status="status"
          :spacing-offset="160"
          class="lg:pt-(--ui-header-height) pb-4 sm:pb-6"
        >
          <template #content="{ message }">
            <div class="prose prose-sm dark:prose-invert max-w-none">
              <p class="whitespace-pre-wrap">{{ message.content }}</p>
            </div>
          </template>
        </UChatMessages>

        <UChatPrompt
          v-model="input"
          :status="status"
          variant="subtle"
          class="sticky bottom-0 [view-transition-name:chat-prompt] rounded-b-none z-10"
          :ui="{ base: 'px-1.5' }"
          @submit="handleSubmit"
        >
          <template #footer>
            <div class="flex items-center gap-1">
              <ChatModelSelect />
            </div>

            <UChatPromptSubmit
              :status="status"
              color="neutral"
              size="sm"
            />
          </template>
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>
