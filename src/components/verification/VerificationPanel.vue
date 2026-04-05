<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useVerificationStore } from '@/stores/verification'
import { useGraphStore } from '@/stores/graph'
import { 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  RotateCcw, 
  Award,
  ChevronRight,
  Send,
  Loader2,
  Brain,
  BookOpen,
  Lightbulb,
  Target,
  Sparkles
} from 'lucide-vue-next'
import { generateVerificationQuestions } from '@/api/verification'
import type { VerificationQuestion } from '@/types/verification'

const verificationStore = useVerificationStore()
const graphStore = useGraphStore()

const selectedNode = computed(() => graphStore.selectedNode)
const currentSession = computed(() => verificationStore.currentSession)
const currentResult = computed(() => verificationStore.currentResult)

// 当前问题索引
const currentQuestionIndex = ref(0)
// 用户答案
const userAnswers = ref<Record<string, string>>({})
// 是否正在验证
const isVerifying = ref(false)

// 当前问题
const currentQuestion = computed(() => {
  if (!currentSession.value || !currentSession.value.questions) return null
  return currentSession.value.questions[currentQuestionIndex.value]
})

// 是否是最后一个问题
const isLastQuestion = computed(() => {
  if (!currentSession.value) return false
  return currentQuestionIndex.value >= currentSession.value.questions.length - 1
})

// 验证等级对应的图标和颜色
const levelConfig = {
  understood: { icon: CheckCircle, color: 'green', bgColor: 'bg-green-50', textColor: 'text-green-600', label: '已理解' },
  partially_understood: { icon: HelpCircle, color: 'amber', bgColor: 'bg-amber-50', textColor: 'text-amber-600', label: '部分理解' },
  not_understood: { icon: AlertCircle, color: 'red', bgColor: 'bg-red-50', textColor: 'text-red-600', label: '未理解' }
}

// 重置验证状态
function resetVerification() {
  currentQuestionIndex.value = 0
  userAnswers.value = {}
  verificationStore.clearCurrentSession()
}

// 开始验证
async function startVerification() {
  if (!selectedNode.value) return
  
  // 重置状态
  resetVerification()
  
  // 生成验证问题
  const questions = generateVerificationQuestions(
    selectedNode.value.id,
    selectedNode.value.title,
    selectedNode.value.description || ''
  )
  
  // 创建验证会话
  verificationStore.createVerificationSession(selectedNode.value.id, questions)
  verificationStore.startVerification()
}

// 提交当前问题答案
function submitCurrentAnswer() {
  if (!currentQuestion.value) return
  
  const answer = userAnswers.value[currentQuestion.value.id] || ''
  verificationStore.submitAnswer(currentQuestion.value.id, answer)
  
  // 移动到下一题或提交验证
  if (!isLastQuestion.value) {
    currentQuestionIndex.value++
  }
}

// 完成验证
async function completeVerification() {
  if (!selectedNode.value || !currentSession.value) return
  
  isVerifying.value = true
  
  try {
    // 提交最后一个答案
    if (currentQuestion.value) {
      const answer = userAnswers.value[currentQuestion.value.id] || ''
      verificationStore.submitAnswer(currentQuestion.value.id, answer)
    }
    
    // 计算验证结果
    const result = verificationStore.calculateResult()
    
    // 如果验证通过，更新节点状态
    if (result && result.level === 'understood') {
      graphStore.markMastered(selectedNode.value.id)
    }
  } finally {
    isVerifying.value = false
  }
}

// 重新验证
function retryVerification() {
  resetVerification()
  startVerification()
}

// 监听选中节点变化
watch(selectedNode, (newNode) => {
  if (newNode) {
    resetVerification()
  }
})

// 问题类型标签
const questionTypeLabels: Record<string, string> = {
  recall: '回忆',
  understanding: '理解',
  application: '应用'
}

const questionTypeColors: Record<string, string> = {
  recall: 'bg-blue-100 text-blue-700',
  understanding: 'bg-green-100 text-green-700',
  application: 'bg-purple-100 text-purple-700'
}

// 问题类型图标
const questionTypeIcons: Record<string, any> = {
  recall: Brain,
  understanding: Lightbulb,
  application: Target
}
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-100">
    <!-- 标题 -->
    <div class="flex items-center gap-2 p-4 border-b border-gray-100">
      <Award class="w-5 h-5 text-blue-500" />
      <h3 class="font-semibold text-gray-900">三重验证</h3>
    </div>

    <div class="p-4">
      <!-- 未选择节点 -->
      <div v-if="!selectedNode" class="text-center py-8 text-gray-500">
        <HelpCircle class="w-10 h-10 mx-auto mb-3 text-gray-300" />
        <p class="font-medium text-gray-600">选择一个知识节点</p>
        <p class="text-sm mt-1">点击图谱中的节点开始验证</p>
      </div>

      <!-- 已选择节点 -->
      <div v-else>
        <!-- 节点信息 -->
        <div class="mb-4 p-3 rounded-lg bg-gray-50">
          <div class="font-medium text-gray-900">{{ selectedNode.title }}</div>
          <div class="text-sm text-gray-500 mt-1">{{ selectedNode.description }}</div>
        </div>

        <!-- 验证流程 -->
        <div v-if="currentSession && currentSession.status !== 'completed'">
          <!-- 进度条 -->
          <div class="mb-4">
            <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>验证进度</span>
              <span>{{ currentQuestionIndex + 1 }} / {{ currentSession.questions.length }}</span>
            </div>
            <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-blue-500 transition-all duration-300"
                :style="{ width: `${((currentQuestionIndex + 1) / currentSession.questions.length) * 100}%` }"
              ></div>
            </div>
          </div>

          <!-- 当前问题 -->
          <div v-if="currentQuestion" class="space-y-4">
            <!-- 问题类型标签 -->
            <div class="flex items-center gap-2">
              <span 
                class="px-2 py-1 rounded text-xs font-medium"
                :class="questionTypeColors[currentQuestion.type]"
              >
                {{ questionTypeLabels[currentQuestion.type] }}
              </span>
              <span class="text-xs text-gray-400">问题 {{ currentQuestionIndex + 1 }}</span>
            </div>

            <!-- 问题内容 -->
            <div class="p-3 rounded-lg border border-gray-200 bg-white">
              <p class="text-gray-700">{{ currentQuestion.question }}</p>
            </div>

            <!-- 答案输入 -->
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">你的回答</label>
              <textarea
                v-model="userAnswers[currentQuestion.id]"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="4"
                placeholder="请输入你的答案..."
              ></textarea>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2">
              <button
                v-if="!isLastQuestion"
                @click="submitCurrentAnswer"
                :disabled="!userAnswers[currentQuestion.id]"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <span>下一题</span>
                <ChevronRight class="w-4 h-4" />
              </button>
              <button
                v-else
                @click="completeVerification"
                :disabled="isVerifying || !userAnswers[currentQuestion.id]"
                class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Loader2 v-if="isVerifying" class="w-4 h-4 animate-spin" />
                <Send v-else class="w-4 h-4" />
                <span>{{ isVerifying ? '验证中...' : '提交验证' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 验证结果 -->
        <div v-else-if="currentResult" class="space-y-4">
          <!-- 总体等级 -->
          <div 
            class="flex items-center gap-3 p-4 rounded-lg"
            :class="levelConfig[currentResult.level].bgColor"
          >
            <component 
              :is="levelConfig[currentResult.level].icon" 
              class="w-6 h-6"
              :class="levelConfig[currentResult.level].textColor"
            />
            <div>
              <div class="font-semibold" :class="levelConfig[currentResult.level].textColor">
                {{ levelConfig[currentResult.level].label }}
              </div>
              <div class="text-sm text-gray-500">
                综合得分: {{ currentResult.totalScore }} 分
              </div>
            </div>
          </div>

          <!-- 详细分数 -->
          <div class="grid grid-cols-3 gap-3">
            <div class="text-center p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div class="text-2xl font-bold text-blue-600">{{ currentResult.scores.recall }}</div>
              <div class="text-xs text-gray-500 mt-1">回忆</div>
            </div>
            <div class="text-center p-3 rounded-lg bg-green-50 border border-green-100">
              <div class="text-2xl font-bold text-green-600">{{ currentResult.scores.understanding }}</div>
              <div class="text-xs text-gray-500 mt-1">理解</div>
            </div>
            <div class="text-center p-3 rounded-lg bg-purple-50 border border-purple-100">
              <div class="text-2xl font-bold text-purple-600">{{ currentResult.scores.application }}</div>
              <div class="text-xs text-gray-500 mt-1">应用</div>
            </div>
          </div>

          <!-- 分数说明 -->
          <div class="text-xs text-gray-400 p-2 rounded bg-gray-50">
            <p>得分计算：通俗举例(30%) + 知识迁移(30%) + 相似度匹配(40%)</p>
          </div>

          <!-- 建议 -->
          <div class="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div class="text-sm font-medium text-gray-700 mb-1">💡 学习建议</div>
            <p class="text-sm text-gray-600">{{ currentResult.suggestion }}</p>
          </div>

          <!-- 重新验证 -->
          <button 
            @click="retryVerification"
            class="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
          >
            <RotateCcw class="w-4 h-4" />
            <span>重新验证</span>
          </button>
        </div>

        <!-- 开始验证按钮 -->
        <div v-else>
          <button 
            @click="startVerification"
            class="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm font-medium"
          >
            开始验证
          </button>
          <div class="mt-4 p-3 rounded-lg bg-gray-50">
            <div class="text-sm font-medium text-gray-700 mb-2">三重验证评估维度：</div>
            <ul class="text-xs text-gray-500 space-y-1">
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>回忆 - 能否记起核心概念</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                <span>理解 - 能否举出合适例子</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                <span>应用 - 能否迁移到新场景</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>