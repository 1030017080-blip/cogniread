// RAG 检索 API - 基于阿里云百炼 Embedding

import { BAILIAN_CONFIG } from './config'

export interface RAGResult {
  id: string
  content: string
  score: number
  source: string
  metadata?: Record<string, any>
}

export interface RAGSearchOptions {
  topK?: number
  threshold?: number
  bookId?: string
}

/**
 * 计算文本的向量嵌入
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch(BAILIAN_CONFIG.embeddingUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BAILIAN_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: BAILIAN_CONFIG.models.embedding,
      input: {
        texts: [text]
      },
      parameters: {
        text_type: 'query'
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Embedding API 错误: ${response.status}`)
  }

  const data = await response.json()
  return data.output?.embeddings?.[0]?.embedding || []
}

/**
 * 计算多个文本的向量嵌入
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await fetch(BAILIAN_CONFIG.embeddingUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${BAILIAN_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: BAILIAN_CONFIG.models.embedding,
      input: {
        texts: texts
      },
      parameters: {
        text_type: 'document'
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Embedding API 错误: ${response.status}`)
  }

  const data = await response.json()
  return data.output?.embeddings?.map((e: any) => e.embedding) || []
}

/**
 * 计算余弦相似度
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * 本地知识库检索
 * 使用向量相似度匹配最相关的内容
 */
export async function searchLocalKnowledge(
  query: string,
  documents: Array<{ id: string; content: string; source: string; embedding?: number[] }>,
  options: RAGSearchOptions = {}
): Promise<RAGResult[]> {
  const { topK = 5, threshold = 0.3 } = options

  // 获取查询向量
  const queryEmbedding = await getEmbedding(query)
  
  // 计算相似度
  const results = documents
    .filter(doc => doc.embedding && doc.embedding.length > 0)
    .map(doc => ({
      id: doc.id,
      content: doc.content,
      score: cosineSimilarity(queryEmbedding, doc.embedding!),
      source: doc.source
    }))
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return results
}

/**
 * 构建RAG上下文
 * 将检索结果转换为可用的上下文文本
 */
export function buildRAGContext(
  results: RAGResult[],
  maxLength: number = 2000
): string {
  if (results.length === 0) return ''
  
  const contexts: string[] = []
  let totalLength = 0
  
  for (const result of results) {
    const context = `【来源: ${result.source}】\n${result.content}\n`
    
    if (totalLength + context.length > maxLength) break
    
    contexts.push(context)
    totalLength += context.length
  }
  
  return contexts.join('\n---\n')
}

/**
 * 混合检索
 * 结合关键词匹配和向量相似度
 */
export async function hybridSearch(
  query: string,
  documents: Array<{ 
    id: string
    content: string
    source: string
    keywords?: string[]
    embedding?: number[]
  }>,
  options: RAGSearchOptions & { keywordWeight?: number } = {}
): Promise<RAGResult[]> {
  const { topK = 5, threshold = 0.3, keywordWeight = 0.3 } = options
  const vectorWeight = 1 - keywordWeight

  // 获取查询向量
  const queryEmbedding = await getEmbedding(query)
  
  // 提取查询关键词
  const queryKeywords = extractKeywords(query)
  
  // 计算综合得分
  const results = documents
    .filter(doc => doc.embedding && doc.embedding.length > 0)
    .map(doc => {
      // 向量相似度得分
      const vectorScore = cosineSimilarity(queryEmbedding, doc.embedding!)
      
      // 关键词匹配得分
      const keywordScore = doc.keywords 
        ? calculateKeywordScore(queryKeywords, doc.keywords)
        : 0
      
      // 综合得分
      const totalScore = vectorScore * vectorWeight + keywordScore * keywordWeight
      
      return {
        id: doc.id,
        content: doc.content,
        score: totalScore,
        source: doc.source
      }
    })
    .filter(r => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  return results
}

// 辅助函数

function extractKeywords(text: string): string[] {
  // 简单的关键词提取（实际应用中可以使用分词工具）
  return text
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 1)
}

function calculateKeywordScore(queryKeywords: string[], docKeywords: string[]): number {
  if (queryKeywords.length === 0 || docKeywords.length === 0) return 0
  
  const querySet = new Set(queryKeywords)
  const docSet = new Set(docKeywords)
  
  let matchCount = 0
  for (const keyword of querySet) {
    if (docSet.has(keyword)) matchCount++
  }
  
  return matchCount / querySet.size
}