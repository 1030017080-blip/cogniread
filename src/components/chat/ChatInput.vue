<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Send, Loader2, Sparkles } from 'lucide-vue-next'

const props = defineProps<{
  disabled?: boolean
  loading?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  send: [content: string]
}>()

const inputText = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 自动调整高度
function adjustHeight() {
  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      const newHeight = Math.min(textareaRef.value.scrollHeight, 150)
      textareaRef.value.style.height = `${newHeight}px`
    }
  })
}

// 监听内容变化调整高度
watch(inputText, () => {
  adjustHeight()
})

function handleSubmit() {
  if (inputText.value.trim() && !props.disabled && !props.loading) {
    emit('send', inputText.value.trim())
    inputText.value = ''
    // 重置高度
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.style.height = 'auto'
      }
    })
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}

// 快捷提示
const suggestions = [
  '解释一下这个概念',
  '举个例子说明',
  '这个概念有什么应用？',
  '为什么这个很重要？'
]

function useSuggestion(suggestion: string) {
  inputText.value = suggestion
  adjustHeight()
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- 快捷提示 -->
    <div v-if="!inputText && !disabled && !loading" class="flex flex-wrap gap-2">
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        @click="useSuggestion(suggestion)"
        class="px-3 py-1.5 text-xs rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-1"
      >
        <Sparkles class="w-3 h-3" />
        {{ suggestion }}
      </button>
    </div>

    <!-- 输入区域 -->
    <div class="flex gap-2 items-end">
      <div class="flex-1 relative">
        <textarea
          ref="textareaRef"
          v-model="inputText"
          :disabled="disabled || loading"
          @keydown="handleKeyDown"
          :placeholder="placeholder || '输入你的问题或想法...'"
          class="w-full resize-none rounded-lg border border-gray-200 p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 bg-white min-h-[44px] max-h-[150px] overflow-y-auto transition-all"
          rows="1"
        />
        <!-- 字数统计 -->
        <div v-if="inputText" class="absolute right-2 bottom-1 text-xs text-gray-400">
          {{ inputText.length }}
        </div>
      </div>
      <button
        @click="handleSubmit"
        :disabled="disabled || loading || !inputText.trim()"
        class="h-[44px] px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 min-w-[80px]"
      >
        <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
        <Send v-else class="w-4 h-4" />
        <span>{{ loading ? '发送中' : '发送' }}</span>
      </button>
    </div>

    <!-- 提示文字 -->
    <div class="text-xs text-gray-400 flex items-center gap-2">
      <span>Enter 发送</span>
      <span class="text-gray-300">|</span>
      <span>Shift + Enter 换行</span>
    </div>
  </div>
</template>