<script setup lang="ts">
import ChatContainer from '@/components/chat/ChatContainer.vue'
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <!-- 对话区域 -->
    <main class="flex-1 overflow-hidden">
      <ChatContainer />
    </main>
  </div>
</template>