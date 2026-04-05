<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import MessageList from './MessageList.vue'
import ChatInput from './ChatInput.vue'
import VerificationPanel from '@/components/verification/VerificationPanel.vue'
import { useChatStore } from '@/stores/chat'
import { useBookStore } from '@/stores/book'
import { useGraphStore } from '@/stores/graph'
import { useVerificationStore } from '@/stores/verification'
import { 
  MessageCircle, 
  BookOpen, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  RefreshCw
} from 'lucide-vue-next'

const chatStore = useChatStore()
const bookStore = useBookStore()
const graphStore = useGraphStore()
const verificationStore = useVerificationStore()

const currentBook = computed(() => bookStore.currentBook)
const currentSession = computed(() => chatStore.currentSession)
const isLoading = computed(() => chatStore.isLoading)
const selectedNode = computed(() => graphStore.selectedNode)

// 对话模式
const chatMode = ref<'socratic' | 'collision'>('socratic')

// 是否显示验证面板
const showVerificationPanel = ref(true)

// 是否显示设置面板
const showSettingsPanel = ref(false)

// 确保有会话
function ensureSession() {
  if (!currentSession.value && currentBook.value) {
    chatStore.createSession(currentBook.value.id, 'learning')
  }
}

// 发送消息
async function handleSend(content: string) {
  ensureSession()
  
  // 如果有选中的节点，设置当前节点上下文
  if (selectedNode.value) {
    chatStore.setCurrentNode(selectedNode.value.id)
  }
  
  // 设置对话模式
  chatStore.setChatMode(chatMode.value)
  
  await chatStore.sendMessage(content)
}

// 切换对话模式
function toggleChatMode() {
  chatMode.value = chatMode.value === 'socratic' ? 'collision' : 'socratic'
  chatStore.setChatMode(chatMode.value)
}

// 切换验证面板显示
function toggleVerificationPanel() {
  showVerificationPanel.value = !showVerificationPanel.value
}

// 清空对话
function clearChat() {
  chatStore.clearCurrentSession()
}

// 监听书籍变化，创建新会话
watch(currentBook, (newBook) => {
  if (newBook) {
    // 创建新会话
    chatStore.createSession(newBook.id, 'learning')
  }
})

// 组件挂载时初始化
onMounted(() => {
  if (currentBook.value && !currentSession.value) {
    chatStore.createSession(currentBook.value.id, 'learning')
  }
})

// 模式名称
const modeNames = {
  socratic: '苏格拉底式',
  collision: '思维碰撞式'
}
</script>

<template>
  <div class="flex h-full">
    <!-- 主对话区域 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 头部工具栏 -->
      <header class="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <MessageCircle class="w-5 h-5 text-blue-500" />
          <div>
            <h2 class="font-semibold text-gray-900">对话学习</h2>
            <div v-if="currentBook" class="flex items-center gap-2 text-sm text-gray-500">
              <BookOpen class="w-3 h-3" />
              <span>{{ currentBook.title }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <!-- 模式切换 -->
          <button 
            @click="toggleChatMode"
            class="px-3 py-1.5 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-1 transition-colors"
            :class="{ 'bg-blue-50 border-blue-200 text-blue-600': chatMode === 'collision' }"
          >
            {{ modeNames[chatMode] }}
          </button>
          
          <!-- 验证面板切换 -->
          <button 
            @click="toggleVerificationPanel"
            class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            :class="{ 'bg-gray-100': showVerificationPanel }"
            title="验证面板"
          >
            <Award class="w-4 h-4 text-gray-600" />
          </button>
          
          <!-- 清空对话 -->
          <button 
            @click="clearChat"
            class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="清空对话"
          >
            <RefreshCw class="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </header>

      <!-- 消息列表 -->
      <div class="flex-1 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div v-if="!currentBook" class="flex items-center justify-center h-full">
          <div class="text-center max-w-md">
            <BookOpen class="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-700 mb-2">选择一本书开始学习</h3>
            <p class="text-gray-500">从左侧侧边栏选择书籍，开启认知之旅</p>
          </div>
        </div>
        <MessageList v-else />
      </div>

      <!-- 输入区 -->
      <div class="px-4 py-3 border-t border-gray-200 bg-white">
        <ChatInput 
          :disabled="!currentBook"
          :loading="isLoading"
          @send="handleSend" 
        />
      </div>
    </div>

    <!-- 验证面板（侧边） -->
    <div 
      v-if="showVerificationPanel" 
      class="w-[320px] border-l border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0"
    >
      <VerificationPanel />
    </div>
    
    <!-- 切换按钮 -->
    <button 
      v-if="!showVerificationPanel"
      @click="toggleVerificationPanel"
      class="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white border border-gray-200 rounded-l-lg shadow-sm hover:bg-gray-50 transition-colors"
    >
      <ChevronLeft class="w-4 h-4 text-gray-600" />
    </button>
  </div>
</template>