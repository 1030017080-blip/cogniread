<script setup lang="ts">
import { useRouter } from 'vue-router'
import { BookOpen, MessageCircle, GitBranch } from 'lucide-vue-next'
import { useBookStore } from '@/stores/book'
import { books } from '@/data/books'
import { onMounted } from 'vue'

const router = useRouter()
const bookStore = useBookStore()

// 初始化书籍数据
onMounted(() => {
  bookStore.setBooks(books)
  // 默认加载第一本书
  if (books.length > 0) {
    bookStore.loadBook(books[0].id)
  }
})

function goToChat() {
  router.push('/chat')
}

function goToGraph() {
  router.push('/graph')
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-8">
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold text-gray-900 mb-4">CogniRead</h1>
      <p class="text-xl text-gray-600">认知阅读助手 - 让AI记住你的认知边界</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
      <button 
        @click="goToChat"
        class="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
      >
        <MessageCircle class="w-12 h-12 text-blue-600 mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">开始对话</h2>
        <p class="text-gray-500 text-center">与AI进行苏格拉底式对话，探索知识</p>
      </button>

      <button 
        @click="goToGraph"
        class="flex flex-col items-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100"
      >
        <GitBranch class="w-12 h-12 text-green-600 mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">知识图谱</h2>
        <p class="text-gray-500 text-center">查看学习进度和认知边界</p>
      </button>
    </div>

    <div class="mt-12 text-center text-gray-400 text-sm">
      <p>核心创新：三重验证机制</p>
      <p class="mt-1">通俗举例(30%) + 知识迁移(30%) + 向量相似度(40%)</p>
    </div>
  </div>
</template>