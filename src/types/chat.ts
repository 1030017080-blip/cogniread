// 对话类型定义

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: number
  nodeId?: string
}

export type ChatMode = 'learning' | 'review' | 'exploration'

export interface ChatSession {
  id: string
  bookId: string
  messages: Message[]
  mode: ChatMode
  currentNodeId?: string
  createdAt: number
  updatedAt: number
}