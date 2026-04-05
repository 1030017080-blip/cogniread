// 三重验证状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { VerificationResult, VerificationSession, VerificationQuestion, VerificationLevel } from '@/types/verification'
import { generateId, calculateVerificationLevel, generateSuggestion } from '@/lib/utils'

export const useVerificationStore = defineStore('verification', () => {
  // 状态
  const sessions = ref<Record<string, VerificationSession>>({})
  const currentSessionId = ref<string | null>(null)
  const verificationResults = ref<Record<string, VerificationResult>>({})

  // 当前验证会话
  const currentSession = computed(() => {
    if (!currentSessionId.value) return null
    return sessions.value[currentSessionId.value]
  })

  // 当前验证结果
  const currentResult = computed(() => {
    if (!currentSession.value?.nodeId) return null
    return verificationResults.value[currentSession.value.nodeId]
  })

  // 创建验证会话
  function createVerificationSession(nodeId: string, questions: VerificationQuestion[]): string {
    const sessionId = generateId()
    sessions.value[sessionId] = {
      id: sessionId,
      nodeId,
      questions,
      results: [],
      status: 'pending'
    }
    currentSessionId.value = sessionId
    return sessionId
  }

  // 开始验证
  function startVerification() {
    if (currentSessionId.value && sessions.value[currentSessionId.value]) {
      sessions.value[currentSessionId.value].status = 'in_progress'
    }
  }

  // 提交答案
  function submitAnswer(questionId: string, answer: string) {
    if (!currentSessionId.value) return
    
    const session = sessions.value[currentSessionId.value]
    const question = session.questions.find(q => q.id === questionId)
    if (question) {
      question.userAnswer = answer
    }
  }

  // 计算验证结果
  function calculateResult(): VerificationResult | null {
    if (!currentSession.value) return null

    const session = currentSession.value
    let recallScore = 0
    let understandingScore = 0
    let applicationScore = 0

    session.questions.forEach(q => {
      const baseScore = q.userAnswer && q.userAnswer.length > 0 ? 50 : 0
      switch (q.type) {
        case 'recall':
          recallScore += baseScore + (q.userAnswer === q.expectedAnswer ? 50 : 0)
          break
        case 'understanding':
          understandingScore += baseScore + 25
          break
        case 'application':
          applicationScore += baseScore + 25
          break
      }
    })

    // 平均化
    const recallQs = session.questions.filter(q => q.type === 'recall').length
    const understandingQs = session.questions.filter(q => q.type === 'understanding').length
    const applicationQs = session.questions.filter(q => q.type === 'application').length

    if (recallQs) recallScore = recallScore / recallQs
    if (understandingQs) understandingScore = understandingScore / understandingQs
    if (applicationQs) applicationScore = applicationScore / applicationQs

    const totalScore = Math.round((recallScore + understandingScore + applicationScore) / 3)
    const level = calculateVerificationLevel(totalScore)
    const suggestion = generateSuggestion(level, session.nodeId)

    const result: VerificationResult = {
      nodeId: session.nodeId,
      scores: {
        recall: recallScore,
        understanding: understandingScore,
        application: applicationScore
      },
      totalScore,
      level,
      suggestion,
      timestamp: Date.now()
    }

    // 保存结果
    verificationResults.value[session.nodeId] = result
    session.results.push(result)
    session.status = 'completed'

    return result
  }

  // 获取节点的验证历史
  function getNodeVerificationHistory(nodeId: string): VerificationResult[] {
    return Object.values(verificationResults.value)
      .filter(r => r.nodeId === nodeId)
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  // 获取节点的最新验证结果
  function getNodeVerificationResult(nodeId: string): VerificationResult | null {
    const history = getNodeVerificationHistory(nodeId)
    return history[0] ?? null
  }

  // 清除当前会话
  function clearCurrentSession() {
    currentSessionId.value = null
  }

  return {
    sessions,
    currentSessionId,
    verificationResults,
    currentSession,
    currentResult,
    createVerificationSession,
    startVerification,
    submitAnswer,
    calculateResult,
    getNodeVerificationHistory,
    getNodeVerificationResult,
    clearCurrentSession
  }
})