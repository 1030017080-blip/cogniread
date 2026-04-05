// 书籍类型定义

import type { KnowledgeNode, KnowledgeEdge } from './graph'

export interface BookMetadata {
  id: string
  title: string
  author: string
  description: string
  coverUrl?: string
  totalPages?: number
  publishYear?: number
  category?: string
}

export interface Book {
  id: string
  title: string
  author: string
  description: string
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
  coverUrl?: string
  progress?: number // 0-100 阅读进度（可选，默认为0）
  lastReadAt?: number
  createdAt?: number
}

export interface BookProgress {
  bookId: string
  masteredNodes: number
  totalNodes: number
  currentNodeId?: string
  studyDays: number
  totalStudyTime: number // 分钟
}