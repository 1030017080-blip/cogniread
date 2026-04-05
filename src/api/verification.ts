// 三重验证API
// 通俗举例(30%) + 知识迁移(30%) + 向量相似度(40%)
// 返回综合得分和理解程度

import type { VerificationResult, VerificationQuestion } from '@/types/verification'

export interface VerificationAPIOptions {
  nodeId: string
  userAnswer: string
  standardAnswer: string
  context?: string
}

export interface VerificationScores {
  exampleScore: number      // 通俗举例得分 (0-100) - 30%
  transferScore: number     // 知识迁移得分 (0-100) - 30%
  similarityScore: number   // 向量相似度得分 (0-100) - 40%
}

// 计算字符串相似度（简化的 Jaccard 相似度）
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(w => w.length > 0))
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(w => w.length > 0))
  
  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])
  
  if (union.size === 0) return 0
  return intersection.size / union.size
}

// 检测是否包含举例（检查 "例如"、"比如"、"举个例子" 等）
function detectExample(text: string): { hasExample: boolean; exampleScore: number } {
  const examplePatterns = [
    /例如[，,：:]?\s*.+/,
    /比如[，,：:]?\s*.+/,
    /举个例子[，,：:]?\s*.+/,
    /举例说明[，,：:]?\s*.+/,
    /以.+为例/,
    /就像.+一样/,
    /相当于.+/
  ]
  
  let matchCount = 0
  for (const pattern of examplePatterns) {
    if (pattern.test(text)) {
      matchCount++
    }
  }
  
  // 如果找到多个匹配，得分更高
  const hasExample = matchCount > 0
  const exampleScore = Math.min(100, matchCount * 40 + 30)
  
  return { hasExample, exampleScore }
}

// 检测知识迁移（检查是否将概念应用到新场景）
function detectKnowledgeTransfer(text: string, context?: string): { hasTransfer: boolean; transferScore: number } {
  const transferPatterns = [
    /这让我联想到/,
    /类似的情况/,
    /同样地/,
    /相似地/,
    /对比.+来看/,
    /从这个角度/,
    /换个角度/,
    /延伸到/,
    /应用[到在]/,
    /可以用于/
  ]
  
  let matchCount = 0
  for (const pattern of transferPatterns) {
    if (pattern.test(text)) {
      matchCount++
    }
  }
  
  // 如果有上下文，检查是否引用了相关概念
  let contextBonus = 0
  if (context) {
    const contextWords = context.toLowerCase().split(/\s+/)
    const textWords = text.toLowerCase().split(/\s+/)
    const commonWords = contextWords.filter(w => textWords.includes(w) && w.length > 1)
    contextBonus = Math.min(20, commonWords.length * 5)
  }
  
  const hasTransfer = matchCount > 0 || contextBonus > 0
  const transferScore = Math.min(100, matchCount * 35 + 25 + contextBonus)
  
  return { hasTransfer, transferScore }
}

// 生成验证问题
export function generateVerificationQuestions(
  nodeId: string,
  nodeTitle: string,
  nodeDescription: string
): VerificationQuestion[] {
  return [
    {
      id: `${nodeId}-q1`,
      nodeId,
      type: 'recall',
      question: `请用自己的话简述"${nodeTitle}"的核心概念是什么？`,
      expectedAnswer: nodeDescription
    },
    {
      id: `${nodeId}-q2`,
      nodeId,
      type: 'understanding',
      question: `请举一个生活中的例子来说明"${nodeTitle}"。`,
      expectedAnswer: ''
    },
    {
      id: `${nodeId}-q3`,
      nodeId,
      type: 'application',
      question: `"${nodeTitle}"这个概念可以应用在哪些不同的场景中？`,
      expectedAnswer: ''
    }
  ]
}

// 执行验证
export async function verify(options: VerificationAPIOptions): Promise<VerificationResult> {
  const { nodeId, userAnswer, standardAnswer, context } = options
  
  // 1. 计算向量相似度（使用简化的文本相似度）
  const similarity = calculateSimilarity(userAnswer, standardAnswer)
  const similarityScore = Math.round(similarity * 100)
  
  // 2. 检测通俗举例
  const { exampleScore } = detectExample(userAnswer)
  
  // 3. 检测知识迁移
  const { transferScore } = detectKnowledgeTransfer(userAnswer, context)
  
  // 4. 计算综合得分
  const scores: VerificationScores = {
    exampleScore,
    transferScore,
    similarityScore
  }
  
  // 加权计算总分：通俗举例(30%) + 知识迁移(30%) + 向量相似度(40%)
  const totalScore = Math.round(
    exampleScore * 0.3 +
    transferScore * 0.3 +
    similarityScore * 0.4
  )
  
  // 5. 确定理解程度
  let level: VerificationResult['level']
  if (totalScore >= 80) {
    level = 'understood'
  } else if (totalScore >= 50) {
    level = 'partially_understood'
  } else {
    level = 'not_understood'
  }
  
  // 6. 生成建议
  let suggestion = ''
  if (level === 'understood') {
    suggestion = '你已经很好地理解了这个概念。建议尝试学习更深入的相关知识点。'
  } else if (level === 'partially_understood') {
    if (exampleScore < 50) {
      suggestion = '建议多思考一些生活中的例子来加深理解。'
    } else if (transferScore < 50) {
      suggestion = '建议尝试将这个概念应用到不同的场景中，拓展理解。'
    } else {
      suggestion = '建议重新回顾概念的核心要点，确保准确理解。'
    }
  } else {
    suggestion = '建议从头开始学习这个概念，仔细阅读相关内容并完成基础练习。'
  }
  
  return {
    nodeId,
    scores: {
      recall: similarityScore,
      understanding: exampleScore,
      application: transferScore
    },
    totalScore,
    level,
    suggestion,
    timestamp: Date.now()
  }
}

// 批量验证
export async function verifyBatch(
  answers: Array<{ nodeId: string; userAnswer: string; standardAnswer: string }>
): Promise<VerificationResult[]> {
  const results: VerificationResult[] = []
  
  for (const answer of answers) {
    const result = await verify(answer)
    results.push(result)
  }
  
  return results
}

// 创建验证 API 实例
export function createVerificationAPI() {
  return {
    verify,
    verifyBatch,
    generateVerificationQuestions
  }
}

// 导出类型
export type VerificationAPI = ReturnType<typeof createVerificationAPI>