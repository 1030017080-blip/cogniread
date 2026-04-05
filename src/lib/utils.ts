// 工具函数

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Tailwind CSS 类名合并
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 生成唯一 ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// 格式化时间
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化日期
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 计算验证等级
export function calculateVerificationLevel(totalScore: number): 'not_understood' | 'partially_understood' | 'understood' {
  if (totalScore >= 80) return 'understood'
  if (totalScore >= 50) return 'partially_understood'
  return 'not_understood'
}

// 根据验证等级生成建议
export function generateSuggestion(level: 'not_understood' | 'partially_understood' | 'understood', nodeId: string): string {
  switch (level) {
    case 'understood':
      return '你已经很好地理解了这个概念，可以继续学习下一个知识点。'
    case 'partially_understood':
      return '你对这个概念有一定理解，建议重新阅读相关内容并尝试应用。'
    case 'not_understood':
      return '建议从头开始学习这个概念，仔细阅读并完成基础练习。'
  }
}

// 获取节点状态颜色
export function getNodeStatusColor(status: 'locked' | 'available' | 'learning' | 'mastered' | 'forgotten'): string {
  switch (status) {
    case 'locked':
      return '#94a3b8' // slate-400
    case 'available':
      return '#3b82f6' // blue-500
    case 'learning':
      return '#f59e0b' // amber-500
    case 'mastered':
      return '#22c55e' // green-500
    case 'forgotten':
      return '#ef4444' // red-500
  }
}

// 延迟函数
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// 安全获取对象属性
export function safeGet<T>(obj: Record<string, T>, key: string, defaultValue: T): T {
  return obj[key] ?? defaultValue
}