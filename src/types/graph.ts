// 知识图谱类型定义

export type NodeStatus = 'locked' | 'available' | 'learning' | 'mastered' | 'forgotten'
export type NodeType = 'concept' | 'principle' | 'example' | 'application'

export interface KnowledgeNode {
  id: string
  title: string
  description?: string
  status: NodeStatus
  type: NodeType
  parentId?: string
  children: string[]
  position?: {
    x: number
    y: number
  }
  verificationHistory?: string[]
  masteryLevel?: number // 0-100
}

export interface KnowledgeEdge {
  id: string
  sourceId: string
  targetId: string
  type: 'dependency' | 'related' | 'extends'
  label?: string
}

export interface GraphState {
  nodes: Record<string, KnowledgeNode>
  edges: KnowledgeEdge[]
  selectedNodeId?: string
  focusedNodeId?: string
}