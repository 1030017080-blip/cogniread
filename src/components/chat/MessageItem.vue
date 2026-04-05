<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import type { Message } from '@/types/chat'
import { User, Bot, Sparkles, Loader2 } from 'lucide-vue-next'
import { formatTime } from '@/lib/utils'

const props = defineProps<{
  message: Message
  isStreaming?: boolean
}>()

const isUser = computed(() => props.message.role === 'user')
const isAssistant = computed(() => props.message.role === 'assistant')
const formattedTime = computed(() => formatTime(props.message.timestamp))

// 流式输出的打字机效果
const displayContent = ref('')
const isTyping = ref(false)

// 当内容变化时，模拟打字机效果
watch(() => props.message.content, (newContent) => {
  if (props.isStreaming && newContent.length > displayContent.value.length) {
    // 流式输出时直接显示新内容
    displayContent.value = newContent
  } else if (!props.isStreaming && displayContent.value !== newContent) {
    // 非流式时完整显示
    displayContent.value = newContent
  }
}, { immediate: true })

// 检测是否还在等待内容
const isWaiting = computed(() => props.isStreaming && !props.message.content)

// 消息状态
const messageStatus = computed(() => {
  if (isWaiting.value) return 'waiting'
  if (props.isStreaming) return 'streaming'
  return 'complete'
})

// Markdown渲染支持（简化版）
function renderMarkdown(text: string): string {
  // 处理代码块
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 rounded p-2 my-2 overflow-x-auto"><code>$2</code></pre>')
  // 处理行内代码
  text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 rounded px-1">$1</code>')
  // 处理粗体
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // 处理斜体
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
  // 处理列表
  text = text.replace(/^(\s*)-\s(.+)/gm, '$1<li>$2</li>')
  // 处理换行
  text = text.replace(/\n/g, '<br>')
  return text
}

const renderedContent = computed(() => renderMarkdown(displayContent.value))

// 消息长度
const contentLength = computed(() => displayContent.value.length)

// 是否是长消息
const isLongMessage = computed(() => contentLength.value > 500)
</script>

<template>
  <div class="flex gap-3 group" :class="{ 'justify-end': isUser }">
    <!-- AI 消息 -->
    <template v-if="isAssistant">
      <div class="flex-shrink-0">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
          <Bot v-if="messageStatus === 'complete'" class="w-4 h-4 text-blue-600" />
          <Loader2 v-else class="w-4 h-4 text-blue-600 animate-spin" />
        </div>
      </div>
      <div class="flex-1 max-w-[85%] min-w-[200px]">
        <div class="bg-white rounded-lg rounded-tl-sm p-4 shadow-sm border border-gray-100 relative">
          <!-- 状态指示器 -->
          <div v-if="messageStatus === 'streaming'" class="absolute -top-1 -right-1">
            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>

          <!-- 等待状态 -->
          <div v-if="isWaiting" class="flex items-center gap-2 text-gray-400">
            <Loader2 class="w-4 h-4 animate-spin" />
            <span class="text-sm">思考中...</span>
          </div>

          <!-- 内容 -->
          <div v-else class="text-gray-800 leading-relaxed prose prose-sm max-w-none">
            <div v-html="renderedContent" class="message-content"></div>
            
            <!-- 流式输出时的光标 -->
            <span v-if="messageStatus === 'streaming'" class="inline-block w-0.5 h-4 bg-blue-500 animate-pulse ml-0.5"></span>
          </div>

          <!-- 消息元数据 -->
          <div v-if="!isWaiting && contentLength > 0" class="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
            <span class="text-xs text-gray-400">{{ formattedTime }}</span>
            <span v-if="contentLength > 100" class="text-xs text-gray-300">· {{ contentLength }} 字</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 用户消息 -->
    <template v-if="isUser">
      <div class="flex-1 max-w-[85%] min-w-[100px]">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg rounded-tr-sm p-3 text-white shadow-sm">
          <p class="whitespace-pre-wrap">{{ message.content }}</p>
        </div>
        <div class="flex items-center gap-2 mt-1 justify-end">
          <span class="text-xs text-gray-400">{{ formattedTime }}</span>
        </div>
      </div>
      <div class="flex-shrink-0">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
          <User class="w-4 h-4 text-gray-600" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.message-content {
  word-break: break-word;
}

.message-content :deep(pre) {
  margin: 0.5rem 0;
  padding: 0.75rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
  overflow-x: auto;
}

.message-content :deep(code) {
  font-family: ui-monospace, monospace;
  font-size: 0.875em;
}

.message-content :deep(li) {
  margin-left: 0.5rem;
  list-style-type: disc;
}

.message-content :deep(strong) {
  font-weight: 600;
}

.message-content :deep(em) {
  font-style: italic;
}
</style>