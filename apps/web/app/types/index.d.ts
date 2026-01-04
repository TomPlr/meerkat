export interface Chat {
  id: string
  title?: string
  createdAt: string
  messages?: ChatMessage[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}
