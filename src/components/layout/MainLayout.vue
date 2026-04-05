<script setup lang="ts">
import Sidebar from './Sidebar.vue'
</script>

<template>
  <div class="flex h-screen bg-gray-50">
    <!-- 侧边栏 -->
    <Sidebar class="w-64 border-r border-gray-200" />
    
    <!-- 主内容区 -->
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>