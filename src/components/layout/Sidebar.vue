<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBookStore } from '@/stores/book'
import { useChatStore } from '@/stores/chat'
import { useGraphStore } from '@/stores/graph'
import { 
  BookOpen, 
  Network, 
  MessageCircle, 
  Home, 
  ChevronRight,
  Brain,
  GraduationCap,
  Lock,
  BarChart3
} from 'lucide-vue-next'
import { thinkingFastAndSlow, westernPhilosophy } from '@/data/books'

const router = useRouter()
const route = useRoute()
const bookStore = useBookStore()
const chatStore = useChatStore()
const graphStore = useGraphStore()

const currentBook = computed(() => bookStore.currentBook)
const bookList = computed(() => bookStore.bookList)

// 学习统计
const stats = computed(() => {
  const nodes = graphStore.nodeList
  return {
    total: nodes.length,
    mastered: nodes.filter(n => n.status === 'mastered').length,
    learning: nodes.filter(n => n.status === 'learning').length,
    available: nodes.filter(n => n.status === 'available').length,
  }
})

// 进度百分比
const progressPercent = computed(() => {
  if (stats.value.total === 0) return 0
  return Math.round((stats.value.mastered / stats.value.total) * 100)
})

const menuItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/chat', label: '对话学习', icon: MessageCircle },
  { path: '/graph', label: '知识图谱', icon: Network }
]

function navigateTo(path: string) {
  router.push(path)
}

// 选择书籍
function selectBook(bookId: string) {
  bookStore.selectBook(bookId)
  
  // 重置图谱选择
  graphStore.clearSelection()
  
  // 如果当前在对话页面，创建新会话
  if (route.path === '/chat') {
    chatStore.createSession(bookId, 'learning')
  }
}

// 初始化书籍数据
onMounted(() => {
  // 设置书籍数据
  bookStore.setBooks([thinkingFastAndSlow, westernPhilosophy])
  
  // 如果没有当前书籍，默认选择第一本
  if (!currentBook.value && bookList.value.length > 0) {
    bookStore.selectBook(bookList.value[0].id)
  }
})

// 监听书籍切换
watch(currentBook, (newBook) => {
  if (newBook) {
    // 更新图谱数据
    graphStore.setGraphData(newBook.nodes, newBook.edges)
  }
})
</script>

<template>
  <aside class="flex flex-col h-full bg-white border-r border-gray-200">
    <!-- Logo 区域 -->
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <Brain class="w-6 h-6 text-blue-500" />
        <div>
          <span class="font-semibold text-lg text-gray-900">CogniRead</span>
          <span class="text-xs text-gray-400 ml-2">v0.1</span>
        </div>
      </div>
    </div>

    <!-- 当前书籍信息 -->
    <div v-if="currentBook" class="px-4 py-3 border-b border-gray-100 bg-gray-50">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
          <BookOpen class="w-5 h-5 text-blue-600" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-gray-900 truncate">{{ currentBook.title }}</div>
          <div class="text-xs text-gray-500">{{ currentBook.author }}</div>
        </div>
      </div>
      
      <!-- 进度条 -->
      <div class="mt-3">
        <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>学习进度</span>
          <span class="font-medium">{{ progressPercent }}%</span>
        </div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
        
        <!-- 统计 -->
        <div class="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <span class="flex items-center gap-1">
            <GraduationCap class="w-3 h-3" />
            {{ stats.mastered }} 已掌握
          </span>
          <span class="flex items-center gap-1">
            <Brain class="w-3 h-3" />
            {{ stats.learning }} 学习中
          </span>
        </div>
      </div>
    </div>

    <!-- 导航菜单 -->
    <nav class="flex-1 overflow-y-auto">
      <div class="px-2 py-3">
        <div class="space-y-1">
          <button
            v-for="item in menuItems"
            :key="item.path"
            @click="navigateTo(item.path)"
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            :class="{ 
              'bg-blue-50 text-blue-600 hover:bg-blue-50': route.path === item.path,
              'font-medium': route.path === item.path
            }"
          >
            <component 
              :is="item.icon" 
              class="w-5 h-5"
              :class="{ 'text-blue-500': route.path === item.path }"
            />
            <span>{{ item.label }}</span>
          </button>
        </div>

        <!-- 书籍列表 -->
        <div class="mt-6">
          <div class="flex items-center gap-2 px-3 mb-2">
            <BarChart3 class="w-4 h-4 text-gray-400" />
            <span class="text-sm font-medium text-gray-600">书籍库</span>
          </div>
          <div class="space-y-1">
            <button
              v-for="book in bookList"
              :key="book.id"
              @click="selectBook(book.id)"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors group"
              :class="{ 
                'bg-blue-50 text-blue-600 hover:bg-blue-50': currentBook?.id === book.id,
                'font-medium': currentBook?.id === book.id
              }"
            >
              <div 
                class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                :class="{ 
                  'bg-blue-100': currentBook?.id === book.id,
                  'bg-gray-100 group-hover:bg-gray-200': currentBook?.id !== book.id
                }"
              >
                <BookOpen 
                  class="w-4 h-4"
                  :class="{ 'text-blue-500': currentBook?.id === book.id, 'text-gray-400': currentBook?.id !== book.id }"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="truncate text-sm">{{ book.title }}</div>
                <div class="text-xs text-gray-400 truncate">{{ book.author }}</div>
              </div>
              <div v-if="(book.progress || 0) > 0" class="flex items-center gap-1">
                <div class="w-1.5 h-1.5 rounded-full" :class="{
                  'bg-green-500': (book.progress || 0) >= 80,
                  'bg-blue-500': (book.progress || 0) >= 50 && (book.progress || 0) < 80,
                  'bg-gray-300': (book.progress || 0) < 50
                }"></div>
                <span class="text-xs text-gray-400">{{ book.progress || 0 }}%</span>
              </div>
              <Lock v-if="(book.progress || 0) === 0" class="w-3 h-3 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 底部信息 -->
    <div class="px-4 py-3 border-t border-gray-200 bg-gray-50">
      <div class="text-xs text-gray-500 text-center">
        <div class="flex items-center justify-center gap-1 mb-1">
          <Brain class="w-3 h-3" />
          <span>认知阅读助手</span>
        </div>
        <div class="text-gray-400">三重验证 · AI记忆边界</div>
      </div>
    </div>
  </aside>
</template>