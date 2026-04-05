<script setup lang="ts">
import GraphContainer from '@/components/graph/GraphContainer.vue'
import { useGraphStore } from '@/stores/graph'
import { useBookStore } from '@/stores/book'
import { books } from '@/data/books'
import { computed, onMounted } from 'vue'

const graphStore = useGraphStore()
const bookStore = useBookStore()

// 确保书籍数据已加载
onMounted(() => {
  if (bookStore.bookList.length === 0) {
    bookStore.setBooks(books)
    if (books.length > 0) {
      bookStore.loadBook(books[0].id)
    }
  }
})

const stats = computed(() => {
  const nodes = graphStore.nodeList
  return {
    total: nodes.length,
    mastered: nodes.filter(n => n.status === 'mastered').length,
    available: nodes.filter(n => n.status === 'available').length,
    learning: nodes.filter(n => n.status === 'learning').length,
    forgotten: nodes.filter(n => n.status === 'forgotten').length,
  }
})
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- 顶部栏 -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900">知识图谱</h1>
        <div class="flex items-center gap-4 text-sm">
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-full bg-green-500"></span>
            已掌握 {{ stats.mastered }}
          </span>
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-full bg-blue-500"></span>
            可学习 {{ stats.available }}
          </span>
          <span class="flex items-center gap-1">
            <span class="w-3 h-3 rounded-full bg-red-500"></span>
            需复习 {{ stats.forgotten }}
          </span>
        </div>
      </div>
    </header>

    <!-- 图谱区域 -->
    <main class="flex-1 overflow-hidden">
      <GraphContainer />
    </main>
  </div>
</template>