// 对话状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Message, ChatSession, ChatMode } from '@/types/chat'
import { generateId } from '@/lib/utils'
import { chatWithBailian, type ChatChunk } from '@/api/chat'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const sessions = ref<Record<string, ChatSession>>({})
  const currentSessionId = ref<string | null>(null)
  const isLoading = ref(false)
  const streamingContent = ref('')

  // 对话模式：socratic（苏格拉底式）或 collision（思维碰撞式）
  const chatMode = ref<'socratic' | 'collision'>('socratic')

  // 当前会话
  const currentSession = computed(() => {
    if (!currentSessionId.value) return null
    return sessions.value[currentSessionId.value]
  })

  // 当前会话消息
  const currentMessages = computed(() => {
    return currentSession.value?.messages ?? []
  })

  // 创建新会话
  function createSession(bookId: string, mode: ChatMode = 'learning'): string {
    const sessionId = generateId()
    sessions.value[sessionId] = {
      id: sessionId,
      bookId,
      messages: [],
      mode,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    currentSessionId.value = sessionId
    return sessionId
  }

  // 添加消息
  function addMessage(content: string, role: 'user' | 'assistant', nodeId?: string): Message {
    if (!currentSessionId.value) {
      throw new Error('No active session')
    }

    const message: Message = {
      id: generateId(),
      role,
      content,
      timestamp: Date.now(),
      nodeId
    }

    sessions.value[currentSessionId.value].messages.push(message)
    sessions.value[currentSessionId.value].updatedAt = Date.now()
    return message
  }

  // 更新最后一条消息
  function updateLastMessage(content: string) {
    if (!currentSessionId.value) return
    const messages = sessions.value[currentSessionId.value].messages
    if (messages.length > 0) {
      messages[messages.length - 1].content = content
    }
  }

  // 发送用户消息
  async function sendMessage(content: string, nodeId?: string): Promise<Message> {
    // 添加用户消息
    const userMessage = addMessage(content, 'user', nodeId)
    
    isLoading.value = true
    streamingContent.value = ''
    
    try {
      // 创建一个空的助手消息
      const assistantMessage = addMessage('', 'assistant', nodeId)
      
      // 调用流式 API
      let fullContent = ''
      for await (const chunk of chatWithBailian(content, {
        mode: chatMode.value,
      })) {
        if (chunk.content) {
          fullContent += chunk.content
          updateLastMessage(fullContent)
        }
        if (chunk.done) break
      }
      
      // 如果没有收到内容，使用备用回复
      if (!fullContent) {
        updateLastMessage('抱歉，我暂时无法回应。请稍后再试。')
      }
      
      return assistantMessage
    } catch (error) {
      console.error('Failed to send message:', error)
      return addMessage('抱歉，发生了错误。请稍后重试。', 'assistant', nodeId)
    } finally {
      isLoading.value = false
      streamingContent.value = ''
    }
  }

  // 切换对话模式
  function setChatMode(mode: 'socratic' | 'collision') {
    chatMode.value = mode
  }

  // 设置当前节点
  function setCurrentNode(nodeId: string | undefined) {
    if (currentSessionId.value && sessions.value[currentSessionId.value]) {
      sessions.value[currentSessionId.value].currentNodeId = nodeId
      sessions.value[currentSessionId.value].updatedAt = Date.now()
    }
  }

  // 切换会话
  function switchSession(sessionId: string) {
    if (sessions.value[sessionId]) {
      currentSessionId.value = sessionId
    }
  }

  // 清空当前会话
  function clearCurrentSession() {
    if (currentSessionId.value && sessions.value[currentSessionId.value]) {
      sessions.value[currentSessionId.value].messages = []
      sessions.value[currentSessionId.value].updatedAt = Date.now()
    }
  }

  // 删除会话
  function deleteSession(sessionId: string) {
    delete sessions.value[sessionId]
    if (currentSessionId.value === sessionId) {
      currentSessionId.value = null
    }
  }

  return {
    sessions,
    currentSessionId,
    isLoading,
    streamingContent,
    chatMode,
    currentSession,
    currentMessages,
    createSession,
    sendMessage,
    setChatMode,
    setCurrentNode,
    switchSession,
    clearCurrentSession,
    deleteSession
  }
})