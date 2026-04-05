<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import { useGraphStore } from '@/stores/graph'
import { useBookStore } from '@/stores/book'
import { useVerificationStore } from '@/stores/verification'
import type { KnowledgeNode } from '@/types/graph'
import { getNodeStatusColor } from '@/lib/utils'
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Award,
  BookOpen,
  Lock,
  Unlock,
  GraduationCap,
  Brain,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  X
} from 'lucide-vue-next'

const graphStore = useGraphStore()
const bookStore = useBookStore()
const verificationStore = useVerificationStore()

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// 是否显示节点详情面板
const showDetailPanel = ref(true)

const nodes = computed(() => graphStore.nodeList)
const edges = computed(() => graphStore.edgeList)
const selectedNode = computed(() => graphStore.selectedNode)
const currentBook = computed(() => bookStore.currentBook)

// 获取选中节点的验证结果
const nodeVerificationResult = computed(() => {
  if (!selectedNode.value) return null
  return verificationStore.getNodeVerificationResult(selectedNode.value.id)
})

// 获取节点的依赖节点
const nodeDependencies = computed(() => {
  if (!selectedNode.value) return []
  return graphStore.getDependencies(selectedNode.value.id)
})

// 获取节点的相关边
const nodeEdges = computed(() => {
  if (!selectedNode.value) return []
  return graphStore.getNodeEdges(selectedNode.value.id)
})

// 节点状态颜色映射
const statusColors: Record<string, string> = {
  locked: '#94a3b8',      // slate-400
  available: '#3b82f6',   // blue-500
  learning: '#f59e0b',    // amber-500
  mastered: '#22c55e',    // green-500
  forgotten: '#ef4444'    // red-500
}

// 节点状态文字映射
const statusLabels: Record<string, string> = {
  locked: '锁定',
  available: '可学',
  learning: '学习中',
  mastered: '已掌握',
  forgotten: '遗忘'
}

// 节点类型文字映射
const typeLabels: Record<string, string> = {
  concept: '概念',
  principle: '原理',
  example: '例子',
  application: '应用'
}

// 状态图标映射
const statusIcons: Record<string, any> = {
  locked: Lock,
  available: Unlock,
  learning: Brain,
  mastered: GraduationCap,
  forgotten: AlertTriangle
}

// 节点点击处理
function handleNodeClick(nodeId: string) {
  graphStore.selectNode(nodeId)
}

// 关闭详情面板
function closeDetailPanel() {
  graphStore.clearSelection()
}

// 开始学习节点
function startLearningNode() {
  if (selectedNode.value && selectedNode.value.status === 'available') {
    graphStore.startLearning(selectedNode.value.id)
  }
}

// 初始化图表
function initChart() {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value, undefined, {
    renderer: 'canvas'
  })

  // 配置图表
  updateChart()

  // 点击事件
  chartInstance.on('click', (params: any) => {
    if (params.dataType === 'node') {
      handleNodeClick(params.data.id)
    }
  })

  // 鼠标悬停事件
  chartInstance.on('mouseover', (params: any) => {
    if (params.dataType === 'node') {
      chartRef.value!.style.cursor = 'pointer'
    }
  })

  chartInstance.on('mouseout', () => {
    if (chartRef.value) {
      chartRef.value.style.cursor = 'default'
    }
  })
}

// 更新图表数据
function updateChart() {
  if (!chartInstance) return

  // 构建节点数据 - 使用力导向布局时不需要指定位置
  const nodesData = nodes.value.map((node) => ({
    id: node.id,
    name: node.title,
    symbolSize: selectedNode.value?.id === node.id ? 55 : 40,
    category: node.status,
    itemStyle: {
      color: statusColors[node.status] || '#94a3b8',
      borderColor: selectedNode.value?.id === node.id ? '#1e40af' : '#fff',
      borderWidth: selectedNode.value?.id === node.id ? 3 : 2,
      shadowBlur: selectedNode.value?.id === node.id ? 10 : 5,
      shadowColor: 'rgba(0, 0, 0, 0.2)'
    },
    label: {
      show: true,
      fontSize: 12,
      color: '#1f2937'
    },
    // 保留原始位置作为初始位置
    x: node.position?.x,
    y: node.position?.y
  }))

  // 构建边数据
  const edgesData = edges.value.map(edge => ({
    source: edge.sourceId,
    target: edge.targetId,
    value: edge.label,
    lineStyle: {
      color: edge.type === 'dependency' ? '#f97316' : '#94a3b8',
      width: 2,
      curveness: 0.2,
      type: edge.type === 'dependency' ? 'solid' : 'dashed'
    },
    label: {
      show: !!edge.label,
      formatter: edge.label || '',
      fontSize: 10,
      color: '#6b7280'
    }
  }))

  // 图表配置
  const option: any = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [10, 15],
      textStyle: {
        color: '#374151',
        fontSize: 13
      },
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const node = nodes.value.find(n => n.id === params.data.id)
          if (node) {
            return `
              <div style="padding: 8px;">
                <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${node.title}</div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${node.description?.substring(0, 50) || ''}...</div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px;">
                  <span style="display: inline-flex; align-items: center; gap: 4px;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColors[node.status]};"></span>
                    ${statusLabels[node.status]}
                  </span>
                  <span style="color: #d1d5db;">|</span>
                  <span style="color: #6b7280;">${typeLabels[node.type] || node.type}</span>
                </div>
              </div>
            `
          }
        }
        return ''
      }
    },
    legend: {
      data: ['锁定', '可学', '学习中', '已掌握', '遗忘'],
      orient: 'horizontal',
      bottom: 10,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: {
        fontSize: 12,
        color: '#6b7280'
      },
      formatter: (name: string) => {
        return name
      }
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        focusNodeAdjacency: true,
        data: nodesData,
        links: edgesData,
        categories: [
          { name: 'locked', itemStyle: { color: statusColors.locked } },
          { name: 'available', itemStyle: { color: statusColors.available } },
          { name: 'learning', itemStyle: { color: statusColors.learning } },
          { name: 'mastered', itemStyle: { color: statusColors.mastered } },
          { name: 'forgotten', itemStyle: { color: statusColors.forgotten } }
        ],
        // 力导向布局配置
        force: {
          repulsion: 300,        // 节点间斥力
          gravity: 0.1,          // 向心力
          edgeLength: [100, 200], // 边的长度范围
          layoutAnimation: true
        },
        // 边配置
        edgeSymbol: ['none', 'arrow'],
        edgeSymbolSize: [0, 8],
        // 标签配置
        label: {
          show: true,
          position: 'bottom',
          fontSize: 12,
          color: '#374151',
          formatter: '{b}'
        },
        // 线条样式
        lineStyle: {
          opacity: 0.8,
          width: 2,
          curveness: 0.2
        },
        // 强调样式
        emphasis: {
          focus: 'adjacency',
          itemStyle: {
            shadowBlur: 15,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          },
          lineStyle: {
            width: 4
          }
        },
        // 选中样式
        blur: {
          itemStyle: {
            opacity: 0.3
          },
          lineStyle: {
            opacity: 0.1
          }
        }
      }
    ],
    // 动画配置
    animationDuration: 1500,
    animationEasingUpdate: 'quinticInOut'
  }

  chartInstance.setOption(option, true)
}

// 监听数据变化
watch([nodes, edges, selectedNode], () => {
  updateChart()
}, { deep: true })

// 窗口大小变化时重绘
function handleResize() {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 重置图谱视图
function resetView() {
  if (chartInstance) {
    chartInstance.dispatchAction({
      type: 'restore'
    })
  }
  graphStore.clearSelection()
}

// 放大
function zoomIn() {
  if (chartInstance) {
    const option = chartInstance.getOption() as any
    const zoom = (option.series[0].zoom || 1) * 1.2
    chartInstance.setOption({
      series: [{ zoom: Math.min(zoom, 3) }]
    })
  }
}

// 缩小
function zoomOut() {
  if (chartInstance) {
    const option = chartInstance.getOption() as any
    const zoom = (option.series[0].zoom || 1) / 1.2
    chartInstance.setOption({
      series: [{ zoom: Math.max(zoom, 0.3) }]
    })
  }
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
})

// 暴露方法
defineExpose({
  resetView,
  zoomIn,
  zoomOut
})
</script>

<template>
  <div class="flex h-full">
    <!-- 主图谱区域 -->
    <div class="flex-1 flex flex-col min-w-0 relative">
      <!-- 头部工具栏 -->
      <header class="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <div class="flex items-center gap-3">
          <Network class="w-5 h-5 text-blue-500" />
          <div>
            <h2 class="font-semibold text-gray-900">知识图谱</h2>
            <div v-if="currentBook" class="flex items-center gap-2 text-sm text-gray-500">
              <BookOpen class="w-3 h-3" />
              <span>{{ currentBook.title }}</span>
            </div>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <button 
            @click="zoomIn"
            class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="放大"
          >
            <ZoomIn class="w-4 h-4 text-gray-600" />
          </button>
          <button 
            @click="zoomOut"
            class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="缩小"
          >
            <ZoomOut class="w-4 h-4 text-gray-600" />
          </button>
          <button 
            @click="resetView"
            class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="重置视图"
          >
            <RefreshCw class="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </header>

      <!-- 图表容器 -->
      <div class="flex-1 relative">
        <div ref="chartRef" class="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100"></div>
        
        <!-- 空状态 -->
        <div 
          v-if="nodes.length === 0" 
          class="absolute inset-0 flex items-center justify-center bg-gray-50"
        >
          <div class="text-center max-w-md">
            <Network class="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-700 mb-2">选择一本书开始学习</h3>
            <p class="text-gray-500">从左侧侧边栏选择书籍，开始探索知识图谱</p>
          </div>
        </div>

        <!-- 统计信息浮层 -->
        <div v-if="nodes.length > 0" class="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-3">
          <div class="flex items-center gap-4 text-sm">
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 rounded-full bg-green-500"></div>
              <span class="text-gray-600">{{ nodes.filter(n => n.status === 'mastered').length }} 已掌握</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 rounded-full bg-blue-500"></div>
              <span class="text-gray-600">{{ nodes.filter(n => n.status === 'available').length }} 可学</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-2 h-2 rounded-full bg-slate-400"></div>
              <span class="text-gray-600">{{ nodes.filter(n => n.status === 'locked').length }} 锁定</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部说明 -->
      <div class="px-4 py-2 bg-white border-t border-gray-200">
        <p class="text-center text-xs text-gray-400">
          拖拽节点调整位置 · 滚轮缩放 · 点击查看详情
        </p>
      </div>

      <!-- 打开详情面板按钮 -->
      <button 
        v-if="selectedNode && !showDetailPanel"
        @click="showDetailPanel = true"
        class="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white border border-gray-200 rounded-l-lg shadow-sm hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft class="w-4 h-4 text-gray-600" />
      </button>
    </div>

    <!-- 节点详情面板 -->
    <div 
      v-if="selectedNode && showDetailPanel"
      class="w-[340px] border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0"
    >
      <!-- 面板头部 -->
      <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div class="flex items-center gap-2">
          <component 
            :is="statusIcons[selectedNode.status]" 
            class="w-4 h-4"
            :style="{ color: statusColors[selectedNode.status] }"
          />
          <span class="font-medium text-gray-900">节点详情</span>
        </div>
        <button 
          @click="closeDetailPanel"
          class="p-1 rounded hover:bg-gray-200 transition-colors"
        >
          <X class="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <!-- 面板内容 -->
      <div class="p-4 space-y-4">
        <!-- 节点基本信息 -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <h3 class="font-semibold text-gray-900">{{ selectedNode.title }}</h3>
            <span 
              class="px-2 py-0.5 rounded text-xs"
              :style="{ 
                backgroundColor: statusColors[selectedNode.status] + '20',
                color: statusColors[selectedNode.status]
              }"
            >
              {{ statusLabels[selectedNode.status] }}
            </span>
          </div>
          <span class="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
            {{ typeLabels[selectedNode.type] || selectedNode.type }}
          </span>
        </div>

        <!-- 描述 -->
        <div v-if="selectedNode.description" class="p-3 rounded-lg bg-gray-50 border border-gray-100">
          <p class="text-sm text-gray-700 leading-relaxed">{{ selectedNode.description }}</p>
        </div>

        <!-- 前置知识 -->
        <div v-if="nodeDependencies.length > 0">
          <div class="text-sm font-medium text-gray-700 mb-2">前置知识</div>
          <div class="space-y-2">
            <div 
              v-for="dep in nodeDependencies"
              :key="dep.id"
              class="flex items-center gap-2 p-2 rounded bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              @click="handleNodeClick(dep.id)"
            >
              <div 
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: statusColors[dep.status] }"
              ></div>
              <span class="text-sm text-gray-700">{{ dep.title }}</span>
              <CheckCircle v-if="dep.status === 'mastered'" class="w-3 h-3 text-green-500" />
            </div>
          </div>
        </div>

        <!-- 关联节点 -->
        <div v-if="nodeEdges.length > 0">
          <div class="text-sm font-medium text-gray-700 mb-2">关联节点</div>
          <div class="space-y-2">
            <div 
              v-for="edge in nodeEdges"
              :key="edge.id"
              class="flex items-center gap-2 p-2 rounded bg-gray-50"
            >
              <span class="text-xs text-gray-500">{{ edge.label || edge.type }}</span>
              <ChevronRight class="w-3 h-3 text-gray-400" />
              <span 
                v-if="edge.targetId !== selectedNode.id"
                class="text-sm text-gray-700 cursor-pointer hover:text-blue-600"
                @click="handleNodeClick(edge.targetId)"
              >
                {{ nodes.find(n => n.id === edge.targetId)?.title }}
              </span>
              <span 
                v-else
                class="text-sm text-gray-700 cursor-pointer hover:text-blue-600"
                @click="handleNodeClick(edge.sourceId)"
              >
                {{ nodes.find(n => n.id === edge.sourceId)?.title }}
              </span>
            </div>
          </div>
        </div>

        <!-- 验证结果 -->
        <div v-if="nodeVerificationResult" class="p-3 rounded-lg border border-gray-200">
          <div class="flex items-center gap-2 mb-3">
            <Award class="w-4 h-4 text-blue-500" />
            <span class="text-sm font-medium text-gray-700">验证结果</span>
          </div>
          
          <div class="grid grid-cols-3 gap-2 mb-3">
            <div class="text-center p-2 rounded bg-blue-50">
              <div class="text-lg font-bold text-blue-600">{{ nodeVerificationResult.scores.recall }}</div>
              <div class="text-xs text-gray-500">回忆</div>
            </div>
            <div class="text-center p-2 rounded bg-green-50">
              <div class="text-lg font-bold text-green-600">{{ nodeVerificationResult.scores.understanding }}</div>
              <div class="text-xs text-gray-500">理解</div>
            </div>
            <div class="text-center p-2 rounded bg-purple-50">
              <div class="text-lg font-bold text-purple-600">{{ nodeVerificationResult.scores.application }}</div>
              <div class="text-xs text-gray-500">应用</div>
            </div>
          </div>
          
          <div class="flex items-center gap-2 text-sm">
            <component 
              :is="nodeVerificationResult.level === 'understood' ? CheckCircle : nodeVerificationResult.level === 'partially_understood' ? HelpCircle : AlertTriangle"
              class="w-4 h-4"
              :style="{ color: nodeVerificationResult.level === 'understood' ? '#22c55e' : nodeVerificationResult.level === 'partially_understood' ? '#f59e0b' : '#ef4444' }"
            />
            <span 
              :style="{ color: nodeVerificationResult.level === 'understood' ? '#22c55e' : nodeVerificationResult.level === 'partially_understood' ? '#f59e0b' : '#ef4444' }"
            >
              {{ nodeVerificationResult.level === 'understood' ? '已理解' : nodeVerificationResult.level === 'partially_understood' ? '部分理解' : '未理解' }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="space-y-2">
          <button 
            v-if="selectedNode.status === 'available'"
            @click="startLearningNode"
            class="w-full py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Brain class="w-4 h-4" />
            <span>开始学习</span>
          </button>
          
          <button 
            v-if="selectedNode.status !== 'locked'"
            class="w-full py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Award class="w-4 h-4" />
            <span>开始验证</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>