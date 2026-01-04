import { createSharedComposable } from '@vueuse/core'

export function formatModelName(modelId: string): string {
  const acronyms = ['gpt']
  const modelName = modelId.split('/')[1] || modelId

  return modelName
    .split('-')
    .map((word) => {
      const lowerWord = word.toLowerCase()
      return acronyms.includes(lowerWord)
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

const _useModels = () => {
  const models = [
    'openai/gpt-4o',
    'anthropic/claude-3-5-sonnet',
    'google/gemini-2.0-flash'
  ]

  const model = useCookie<string>('model', { default: () => 'openai/gpt-4o' })

  return {
    models,
    model,
    formatModelName
  }
}

export const useModels = createSharedComposable(_useModels)
