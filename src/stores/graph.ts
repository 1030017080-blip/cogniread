// 知识图谱状态管理

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { KnowledgeNode, KnowledgeEdge, NodeStatus } from '@/types/graph'

export const useGraphStore = defineStore('graph', () => {
  // 状态
  const nodes = ref<Record<string, KnowledgeNode>>({})
  const edges = ref<KnowledgeEdge[]>([])
  const selectedNodeId = ref<string | null>(null)
  const focusedNodeId = ref<string | null>(null)

  // 所有节点列表
  const nodeList = computed(() => Object.values(nodes.value))

  // 所有边列表
  const edgeList = computed(() => edges.value)

  // 当前选中的节点
  const selectedNode = computed(() => {
    if (!selectedNodeId.value) return null
    return nodes.value[selectedNodeId.value]
  })

  // 当前聚焦的节点
  const focusedNode = computed(() => {
    if (!focusedNodeId.value) return null
    return nodes.value[focusedNodeId.value]
  })

  // 可学习的节点（未被锁定）
  const availableNodes = computed(() => {
    return nodeList.value.filter(n => n.status !== 'locked')
  })

  // 已掌握的节点
  const masteredNodes = computed(() => {
    return nodeList.value.filter(n => n.status === 'mastered')
  })

  // 正在学习的节点
  const learningNodes = computed(() => {
    return nodeList.value.filter(n => n.status === 'learning')
  })

  // 设置图谱数据
  function setGraphData(newNodes: KnowledgeNode[], newEdges: KnowledgeEdge[]) {
    nodes.value = {}
    newNodes.forEach(node => {
      nodes.value[node.id] = node
    })
    edges.value = newEdges
  }

  // 添加节点
  function addNode(node: KnowledgeNode) {
    nodes.value[node.id] = node
  }

  // 更新节点
  function updateNode(nodeId: string, updates: Partial<KnowledgeNode>) {
    if (nodes.value[nodeId]) {
      nodes.value[nodeId] = { ...nodes.value[nodeId], ...updates }
    }
  }

  // 更新节点状态
  function updateNodeStatus(nodeId: string, status: NodeStatus) {
    updateNode(nodeId, { status })
  }

  // 添加边
  function addEdge(edge: KnowledgeEdge) {
    edges.value.push(edge)
  }

  // 选择节点
  function selectNode(nodeId: string | null) {
    selectedNodeId.value = nodeId
  }

  // 聚焦节点
  function focusNode(nodeId: string | null) {
    focusedNodeId.value = nodeId
  }

  // 获取节点的子节点
  function getChildren(nodeId: string): KnowledgeNode[] {
    const node = nodes.value[nodeId]
    if (!node) return []
    return node.children.map(id => nodes.value[id]).filter(Boolean)
  }

  // 获取节点的父节点
  function getParent(nodeId: string): KnowledgeNode | null {
    const node = nodes.value[nodeId]
    if (!node || !node.parentId) return null
    return nodes.value[node.parentId]
  }

  // 获取节点的相关边
  function getNodeEdges(nodeId: string): KnowledgeEdge[] {
    return edges.value.filter(e => e.sourceId === nodeId || e.targetId === nodeId)
  }

  // 获取依赖的节点（前置条件）
  function getDependencies(nodeId: string): KnowledgeNode[] {
    const dependencyEdges = edges.value.filter(e => e.targetId === nodeId && e.type === 'dependency')
    return dependencyEdges.map(e => nodes.value[e.sourceId]).filter(Boolean)
  }

  // 检查节点是否可以学习（前置节点都已掌握）
  function canLearn(nodeId: string): boolean {
    const node = nodes.value[nodeId]
    if (!node) return false
    if (node.status !== 'locked' && node.status !== 'available') return false
    
    const dependencies = getDependencies(nodeId)
    return dependencies.every(d => d.status === 'mastered')
  }

  // 解锁节点（当前置节点都掌握后）
  function unlockNode(nodeId: string) {
    if (canLearn(nodeId)) {
      updateNodeStatus(nodeId, 'available')
    }
  }

  // 开始学习节点
  function startLearning(nodeId: string) {
    const node = nodes.value[nodeId]
    if (node && node.status === 'available') {
      updateNodeStatus(nodeId, 'learning')
    }
  }

  // 标记节点已掌握
  function markMastered(nodeId: string) {
    updateNodeStatus(nodeId, 'mastered')
    // 解锁依赖此节点的子节点
    const dependentEdges = edges.value.filter(e => e.sourceId === nodeId && e.type === 'dependency')
    dependentEdges.forEach(e => unlockNode(e.targetId))
  }

  // 标记节点遗忘
  function markForgotten(nodeId: string) {
    updateNodeStatus(nodeId, 'forgotten')
  }

  // 清除选择
  function clearSelection() {
    selectedNodeId.value = null
  }

  // 清除聚焦
  function clearFocus() {
    focusedNodeId.value = null
  }

  return {
    nodes,
    edges,
    selectedNodeId,
    focusedNodeId,
    nodeList,
    edgeList,
    selectedNode,
    focusedNode,
    availableNodes,
    masteredNodes,
    learningNodes,
    setGraphData,
    addNode,
    updateNode,
    updateNodeStatus,
    addEdge,
    selectNode,
    focusNode,
    getChildren,
    getParent,
    getNodeEdges,
    getDependencies,
    canLearn,
    unlockNode,
    startLearning,
    markMastered,
    markForgotten,
    clearSelection,
    clearFocus
  }
})