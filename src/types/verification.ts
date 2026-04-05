// 三重验证类型定义

export type VerificationLevel = 'not_understood' | 'partially_understood' | 'understood'

export interface VerificationScore {
  recall: number      // 回忆得分 (0-100)
  understanding: number // 理解得分 (0-100)
  application: number   // 应用得分 (0-100)
}

export interface VerificationResult {
  nodeId: string
  scores: VerificationScore
  totalScore: number
  level: VerificationLevel
  suggestion: string
  timestamp: number
}

export interface VerificationQuestion {
  id: string
  nodeId: string
  type: 'recall' | 'understanding' | 'application'
  question: string
  expectedAnswer: string
  userAnswer?: string
}

export interface VerificationSession {
  id: string
  nodeId: string
  questions: VerificationQuestion[]
  results: VerificationResult[]
  status: 'pending' | 'in_progress' | 'completed'
}