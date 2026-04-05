<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from 'vue'
import MessageItem from './MessageItem.vue'
import { useChatStore } from '@/stores/chat'
import { useBookStore } from '@/stores/book'
import { BookOpen, MessageCircle, Loader2 } from 'lucide-vue-next'

const chatStore = useChatStore()
const bookStore = useBookStore()

const messages = computed(() => chatStore.currentMessages)
const isLoading = computed(() => chatStore.isLoading)
const streamingContent = computed(() => chatStore.streamingContent)
const currentBook = computed(() => bookStore.currentBook)

// 消息容器引用，用于自动滚动
const messagesContainer = ref<HTMLDivElement | null>(null)

// 是否正在流式输出
const isStreamingMessage = computed(() => isLoading.value && messages.value.length > 0)

// 自动滚动到最新消息
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 监听消息变化，自动滚动
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// 监听流式内容变化
watch(streamingContent, () => {
  scrollToBottom()
})

// 组件挂载时滚动到底部
onMounted(() => {
  scrollToBottom()
})

// 获取最后一条消息（用于流式输出）
const lastMessage = computed(() => {
  if (messages.value.length === 0) return null
  return messages.value[messages.value.length - 1]
})

// 是否显示流式输出指示器
const showStreamingIndicator = computed(() => {
  return isLoading.value && messages.value.length === 0
})
</script>

<template>
  <div ref="messagesContainer" class="h-full overflow-y-auto px-4 py-6">
    <!-- 空状态 -->
    <div v-if="messages.length === 0 && !isLoading" class="flex flex-col items-center justify-center h-full min-h-[300px]">
      <div class="text-center max-w-md">
        <!-- 当前书籍信息 -->
        <div v-if="currentBook" class="mb-6">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100">
            <BookOpen class="w-4 h-4 text-blue-500" />
            <span class="text-sm font-medium text-blue-700">{{ currentBook.title }}</span>
          </div>
        </div>

        <!-- 提示 -->
        <MessageCircle class="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-700 mb-2">开始对话学习</h3>
        <p class="text-gray-500 mb-4">
          你可以询问概念、请求解释或尝试应用练习
        </p>
        
        <!-- 建议的问题 -->
        <div class="space-y-2">
          <p class="text-sm text-gray-400">试试这些问题：</p>
          <div class="flex flex-wrap justify-center gap-2">
            <span class="px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-600">这个概念是什么意思？</span>
            <span class="px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-600">给我举个例子</span>
            <span class="px-3 py-1.5 text-sm rounded-full bg-gray-100 text-gray-600">这个概念如何应用？</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 等待AI回复 -->
    <div v-if="showStreamingIndicator" class="flex items-center gap-3 py-4">
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
        <Loader2 class="w-4 h-4 text-blue-600 animate-spin" />
      </div>
      <div class="flex-1">
        <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
          <div class="flex items-center gap-2 text-gray-500">
            <Loader2 class="w-4 h-4 animate-spin" />
            <span class="text-sm">正在思考...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="space-y-6">
      <MessageItem
        v-for="(message, index) in messages"
        :key="message.id"
        :message="message"
        :isStreaming="isStreamingMessage && index === messages.length - 1 && message.role === 'assistant'"
      />
    </div>

    <!-- 底部留白 -->
    <div class="h-4"></div>
  </div>
</template>