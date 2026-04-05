// 书籍状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Book, BookProgress } from '@/types/book'
import type { KnowledgeNode, KnowledgeEdge } from '@/types/graph'
import { useGraphStore } from './graph'

export const useBookStore = defineStore('book', () => {
  // 状态
  const books = ref<Record<string, Book>>({})
  const currentBookId = ref<string | null>(null)
  const bookProgress = ref<Record<string, BookProgress>>({})

  // 当前书籍
  const currentBook = computed(() => {
    if (!currentBookId.value) return null
    return books.value[currentBookId.value]
  })

  // 书籍列表
  const bookList = computed(() => Object.values(books.value))

  // 当前书籍进度
  const currentProgress = computed(() => {
    if (!currentBookId.value) return null
    return bookProgress.value[currentBookId.value]
  })

  // 加载书籍（并设置图谱）
  function loadBook(bookId: string) {
    const book = books.value[bookId]
    if (!book) return
    
    currentBookId.value = bookId
    
    // 同步图谱数据
    const graphStore = useGraphStore()
    graphStore.setGraphData(book.nodes, book.edges)
    
    // 更新最后阅读时间
    book.lastReadAt = Date.now()
  }

  // 设置书籍数据
  function setBooks(bookData: Book[]) {
    books.value = {}
    bookData.forEach(book => {
      books.value[book.id] = book
    })
  }

  // 添加书籍
  function addBook(book: Book) {
    books.value[book.id] = book
  }

  // 更新书籍进度
  function updateProgress(bookId: string, updates: Partial<BookProgress>) {
    if (bookProgress.value[bookId]) {
      bookProgress.value[bookId] = { ...bookProgress.value[bookId], ...updates }
    } else {
      bookProgress.value[bookId] = {
        bookId,
        masteredNodes: 0,
        totalNodes: 0,
        studyDays: 0,
        totalStudyTime: 0,
        ...updates
      }
    }
  }

  // 计算并更新进度
  function calculateProgress(bookId: string) {
    const book = books.value[bookId]
    if (!book) return

    const graphStore = useGraphStore()
    const masteredNodes = graphStore.masteredNodes.length
    const totalNodes = book.nodes.length

    updateProgress(bookId, {
      masteredNodes,
      totalNodes,
      currentNodeId: graphStore.focusedNodeId ?? graphStore.selectedNodeId ?? undefined
    })

    // 更新书籍进度百分比
    book.progress = Math.round((masteredNodes / totalNodes) * 100)
  }

  // 获取书籍
  function getBook(bookId: string): Book | null {
    return books.value[bookId] ?? null
  }

  // 选择书籍
  function selectBook(bookId: string | null) {
    if (bookId && books.value[bookId]) {
      loadBook(bookId)
    } else {
      currentBookId.value = null
    }
  }

  // 初始化进度
  function initializeProgress(bookId: string) {
    const book = books.value[bookId]
    if (!book) return

    if (!bookProgress.value[bookId]) {
      bookProgress.value[bookId] = {
        bookId,
        masteredNodes: 0,
        totalNodes: book.nodes.length,
        studyDays: 0,
        totalStudyTime: 0
      }
    }
  }

  // 增加学习时间
  function addStudyTime(bookId: string, minutes: number) {
    if (bookProgress.value[bookId]) {
      bookProgress.value[bookId].totalStudyTime += minutes
    }
  }

  // 获取推荐书籍（根据进度排序）
  const recommendedBooks = computed(() => {
    return bookList.value
      .filter(b => (b.progress || 0) > 0 && (b.progress || 0) < 100)
      .sort((a, b) => (b.lastReadAt || 0) - (a.lastReadAt || 0))
      .slice(0, 3)
  })

  return {
    books,
    currentBookId,
    bookProgress,
    currentBook,
    bookList,
    currentProgress,
    recommendedBooks,
    loadBook,
    setBooks,
    addBook,
    updateProgress,
    calculateProgress,
    getBook,
    selectBook,
    initializeProgress,
    addStudyTime
  }
})