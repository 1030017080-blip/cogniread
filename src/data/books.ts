// 书籍列表数据
// 包含《思考，快与慢》和《西方哲学史》的知识图谱节点

import type { KnowledgeNode, KnowledgeEdge } from '@/types/graph'

export interface BookData {
  id: string
  title: string
  author: string
  description: string
  cover?: string
  category: string
  progress?: number
  createdAt?: number
  nodes: KnowledgeNode[]
  edges: KnowledgeEdge[]
}

// 《思考，快与慢》知识图谱
export const thinkingFastAndSlow: BookData = {
  id: 'thinking-fast-slow',
  title: '思考，快与慢',
  author: '丹尼尔·卡尼曼',
  description: '诺贝尔经济学奖得主的经典著作，揭示了人类思维的两个系统及其如何影响我们的判断和决策。',
  category: '心理学',
  progress: 0,
  createdAt: Date.now(),
  nodes: [
    // 第一层：核心概念
    {
      id: 'two-systems',
      title: '双系统理论',
      description: '人类思维由两个系统组成：快速直觉的系统1和慢速理性的系统2。这两个系统协同工作，但也容易产生各种认知偏差。',
      status: 'available',
      type: 'concept',
      children: ['system1', 'system2'],
      position: { x: 400, y: 100 }
    },
    // 第二层：两个系统
    {
      id: 'system1',
      title: '系统1',
      description: '快速、直觉、自动的思维模式。在我们清醒时持续运行，负责处理日常的大部分认知任务。特点是快速、无意识、难以控制。',
      status: 'locked',
      type: 'concept',
      parentId: 'two-systems',
      children: ['intuition', 'priming'],
      position: { x: 200, y: 220 }
    },
    {
      id: 'system2',
      title: '系统2',
      description: '慢速、理性、可控的思维模式。需要主动集中注意力才能运作，负责处理复杂的认知任务。特点是慢速、有意识、可控制。',
      status: 'locked',
      type: 'concept',
      parentId: 'two-systems',
      children: ['self-control', 'complex-calculation'],
      position: { x: 600, y: 220 }
    },
    // 第三层：系统1特性
    {
      id: 'intuition',
      title: '直觉判断',
      description: '系统1的快速判断能力，能在瞬间做出决策，但容易受到各种偏见的影响。',
      status: 'locked',
      type: 'principle',
      parentId: 'system1',
      children: [],
      position: { x: 100, y: 340 }
    },
    {
      id: 'priming',
      title: '启动效应',
      description: '先前的刺激会影响后续的行为和判断，这是一种无意识的关联激活。',
      status: 'locked',
      type: 'principle',
      parentId: 'system1',
      children: [],
      position: { x: 300, y: 340 }
    },
    // 第三层：系统2特性
    {
      id: 'self-control',
      title: '自我控制',
      description: '系统2负责抑制冲动和诱惑，但这种控制是有限的资源，会因使用而耗竭。',
      status: 'locked',
      type: 'principle',
      parentId: 'system2',
      children: [],
      position: { x: 500, y: 340 }
    },
    {
      id: 'complex-calculation',
      title: '复杂计算',
      description: '系统2能够进行复杂的逻辑推理和数学计算，但需要集中注意力。',
      status: 'locked',
      type: 'principle',
      parentId: 'system2',
      children: [],
      position: { x: 700, y: 340 }
    },
    // 认知偏差层
    {
      id: 'cognitive-bias',
      title: '认知偏差',
      description: '系统1的快速直觉特性容易产生的判断错误，包括锚定效应、可得性启发等。',
      status: 'locked',
      type: 'concept',
      children: ['anchoring', 'availability', 'representativeness'],
      position: { x: 400, y: 460 }
    },
    {
      id: 'anchoring',
      title: '锚定效应',
      description: '人们在做出估计时，会过度依赖最先获得的信息（锚点），即使这个锚点与问题无关。',
      status: 'locked',
      type: 'principle',
      parentId: 'cognitive-bias',
      children: [],
      position: { x: 200, y: 580 }
    },
    {
      id: 'availability',
      title: '可得性启发',
      description: '人们根据记忆中事例的容易程度来评估概率，容易被想起来的事件被认为更常见。',
      status: 'locked',
      type: 'principle',
      parentId: 'cognitive-bias',
      children: [],
      position: { x: 400, y: 580 }
    },
    {
      id: 'representativeness',
      title: '代表性启发',
      description: '人们根据事物与典型范例的相似程度进行分类和判断，容易忽略基础概率。',
      status: 'locked',
      type: 'principle',
      parentId: 'cognitive-bias',
      children: [],
      position: { x: 600, y: 580 }
    },
    // 前景理论
    {
      id: 'prospect-theory',
      title: '前景理论',
      description: '描述人们在风险决策中的行为模式：对收益风险厌恶，对损失风险寻求。损失的痛苦感大于同等收益的快乐感。',
      status: 'locked',
      type: 'concept',
      children: ['loss-aversion', 'framing-effect'],
      position: { x: 400, y: 700 }
    },
    {
      id: 'loss-aversion',
      title: '损失厌恶',
      description: '人们对损失的敏感度约是收益的2倍，这使得我们更倾向于避免损失而非获得收益。',
      status: 'locked',
      type: 'principle',
      parentId: 'prospect-theory',
      children: [],
      position: { x: 300, y: 820 }
    },
    {
      id: 'framing-effect',
      title: '框架效应',
      description: '同一问题的不同表述方式会导致不同的决策偏好，这揭示了理性决策的局限性。',
      status: 'locked',
      type: 'principle',
      parentId: 'prospect-theory',
      children: [],
      position: { x: 500, y: 820 }
    }
  ],
  edges: [
    { id: 'e1', sourceId: 'two-systems', targetId: 'system1', type: 'extends', label: '包含' },
    { id: 'e2', sourceId: 'two-systems', targetId: 'system2', type: 'extends', label: '包含' },
    { id: 'e3', sourceId: 'system1', targetId: 'intuition', type: 'extends', label: '特性' },
    { id: 'e4', sourceId: 'system1', targetId: 'priming', type: 'extends', label: '特性' },
    { id: 'e5', sourceId: 'system2', targetId: 'self-control', type: 'extends', label: '能力' },
    { id: 'e6', sourceId: 'system2', targetId: 'complex-calculation', type: 'extends', label: '能力' },
    { id: 'e7', sourceId: 'system1', targetId: 'cognitive-bias', type: 'related', label: '导致' },
    { id: 'e8', sourceId: 'cognitive-bias', targetId: 'anchoring', type: 'extends', label: '类型' },
    { id: 'e9', sourceId: 'cognitive-bias', targetId: 'availability', type: 'extends', label: '类型' },
    { id: 'e10', sourceId: 'cognitive-bias', targetId: 'representativeness', type: 'extends', label: '类型' },
    { id: 'e11', sourceId: 'prospect-theory', targetId: 'loss-aversion', type: 'extends', label: '核心' },
    { id: 'e12', sourceId: 'prospect-theory', targetId: 'framing-effect', type: 'extends', label: '应用' },
    { id: 'e13', sourceId: 'two-systems', targetId: 'prospect-theory', type: 'dependency', label: '基础' }
  ]
}

// 《西方哲学史》知识图谱
export const westernPhilosophy: BookData = {
  id: 'western-philosophy',
  title: '西方哲学史',
  author: '伯特兰·罗素',
  description: '诺贝尔文学奖得主的经典著作，全面梳理了西方哲学的发展历程，从古希腊到现代哲学。',
  category: '哲学',
  progress: 0,
  createdAt: Date.now(),
  nodes: [
    // 古希腊哲学
    {
      id: 'ancient-greek',
      title: '古希腊哲学',
      description: '西方哲学的发源地，以苏格拉底、柏拉图、亚里士多德为代表，奠定了西方哲学的基础。',
      status: 'available',
      type: 'concept',
      children: ['socrates', 'plato', 'aristotle'],
      position: { x: 200, y: 100 }
    },
    {
      id: 'socrates',
      title: '苏格拉底',
      description: '通过对话和提问探索真理，发展出著名的苏格拉底方法（辩证法）。强调"认识你自己"。',
      status: 'locked',
      type: 'concept',
      parentId: 'ancient-greek',
      children: ['socratic-method'],
      position: { x: 100, y: 220 }
    },
    {
      id: 'socratic-method',
      title: '苏格拉底方法',
      description: '一种通过对话和提问来探索真理的方法，包括反讽、助产术、归纳和定义四个阶段。',
      status: 'locked',
      type: 'principle',
      parentId: 'socrates',
      children: [],
      position: { x: 50, y: 340 }
    },
    {
      id: 'plato',
      title: '柏拉图',
      description: '苏格拉底的学生，提出理念论。认为感知的物质世界只是真实世界的影子，哲学家应追求对理念的认识。',
      status: 'locked',
      type: 'concept',
      parentId: 'ancient-greek',
      children: ['platonic-forms', 'platonic-love'],
      position: { x: 200, y: 220 }
    },
    {
      id: 'platonic-forms',
      title: '理念论',
      description: '柏拉图的核心理论。真实世界由永恒不变的理念构成，物质世界只是理念的影子。',
      status: 'locked',
      type: 'principle',
      parentId: 'plato',
      children: [],
      position: { x: 150, y: 340 }
    },
    {
      id: 'platonic-love',
      title: '柏拉图式爱情',
      description: '一种超越肉体的精神之爱，追求灵魂的交流和对美的理念的沉思。',
      status: 'locked',
      type: 'example',
      parentId: 'plato',
      children: [],
      position: { x: 250, y: 340 }
    },
    {
      id: 'aristotle',
      title: '亚里士多德',
      description: '柏拉图的学生，创立形式逻辑。提出四因说，强调经验观察的重要性，开创了西方科学传统。',
      status: 'locked',
      type: 'concept',
      parentId: 'ancient-greek',
      children: ['four-causes', 'logic'],
      position: { x: 300, y: 220 }
    },
    {
      id: 'four-causes',
      title: '四因说',
      description: '亚里士多德对事物存在和变化的解释框架：质料因、形式因、动力因、目的因。',
      status: 'locked',
      type: 'principle',
      parentId: 'aristotle',
      children: [],
      position: { x: 300, y: 340 }
    },
    {
      id: 'logic',
      title: '形式逻辑',
      description: '亚里士多德创立的逻辑系统，包括三段论等推理规则，成为后世逻辑学的基础。',
      status: 'locked',
      type: 'principle',
      parentId: 'aristotle',
      children: [],
      position: { x: 400, y: 340 }
    },
    // 近代哲学
    {
      id: 'modern-philosophy',
      title: '近代哲学',
      description: '从笛卡尔开始，以理性主义和经验主义的对立为特征，最终在康德那里达到综合。',
      status: 'locked',
      type: 'concept',
      children: ['descartes', 'kant'],
      position: { x: 600, y: 100 }
    },
    {
      id: 'descartes',
      title: '笛卡尔',
      description: '现代哲学之父，提出"我思故我在"。通过普遍怀疑寻找确定的知识基础。',
      status: 'locked',
      type: 'concept',
      parentId: 'modern-philosophy',
      children: ['cogito', 'dualism'],
      position: { x: 500, y: 220 }
    },
    {
      id: 'cogito',
      title: '我思故我在',
      description: '笛卡尔通过怀疑一切发现唯一不能怀疑的是正在怀疑的自我，成为重建知识的基石。',
      status: 'locked',
      type: 'principle',
      parentId: 'descartes',
      children: [],
      position: { x: 500, y: 340 }
    },
    {
      id: 'dualism',
      title: '心身二元论',
      description: '笛卡尔认为心灵和身体是两种不同的实体，心灵的本质是思维，身体的本质是广延。',
      status: 'locked',
      type: 'principle',
      parentId: 'descartes',
      children: [],
      position: { x: 600, y: 340 }
    },
    {
      id: 'kant',
      title: '康德',
      description: '德国古典哲学的创始人，试图解决经验主义和理性主义的矛盾，提出先验哲学。',
      status: 'locked',
      type: 'concept',
      parentId: 'modern-philosophy',
      children: ['critique-of-reason', 'categorical-imperative'],
      position: { x: 700, y: 220 }
    },
    {
      id: 'critique-of-reason',
      title: '纯粹理性批判',
      description: '康德的核心著作，探讨人类理性的边界，区分了现象和物自体，提出先天综合判断。',
      status: 'locked',
      type: 'principle',
      parentId: 'kant',
      children: [],
      position: { x: 700, y: 340 }
    },
    {
      id: 'categorical-imperative',
      title: '绝对命令',
      description: '康德的道德哲学核心：你应该只按照你希望成为普遍规律的准则行动。',
      status: 'locked',
      type: 'principle',
      parentId: 'kant',
      children: [],
      position: { x: 800, y: 340 }
    },
    // 现代哲学
    {
      id: 'contemporary-philosophy',
      title: '现代哲学',
      description: '20世纪以来的哲学发展，包括存在主义、分析哲学、现象学等多个流派。',
      status: 'locked',
      type: 'concept',
      children: ['existentialism', 'analytic-philosophy'],
      position: { x: 400, y: 460 }
    },
    {
      id: 'existentialism',
      title: '存在主义',
      description: '强调个人存在的独特性和自由选择的责任。代表人物有萨特、加缪、海德格尔等。',
      status: 'locked',
      type: 'concept',
      parentId: 'contemporary-philosophy',
      children: ['existence-precedes-essence'],
      position: { x: 300, y: 580 }
    },
    {
      id: 'existence-precedes-essence',
      title: '存在先于本质',
      description: '萨特的核心命题：人首先存在，然后通过自己的选择来定义自己是什么样的人。',
      status: 'locked',
      type: 'principle',
      parentId: 'existentialism',
      children: [],
      position: { x: 300, y: 700 }
    },
    {
      id: 'analytic-philosophy',
      title: '分析哲学',
      description: '强调逻辑分析和语言分析，注重清晰和严谨。代表人物有罗素、维特根斯坦等。',
      status: 'locked',
      type: 'concept',
      parentId: 'contemporary-philosophy',
      children: ['logical-analysis'],
      position: { x: 500, y: 580 }
    },
    {
      id: 'logical-analysis',
      title: '逻辑分析',
      description: '通过形式逻辑分析哲学问题，澄清概念，消除语言混淆。',
      status: 'locked',
      type: 'principle',
      parentId: 'analytic-philosophy',
      children: [],
      position: { x: 500, y: 700 }
    }
  ],
  edges: [
    { id: 'ep1', sourceId: 'ancient-greek', targetId: 'socrates', type: 'extends', label: '代表' },
    { id: 'ep2', sourceId: 'ancient-greek', targetId: 'plato', type: 'extends', label: '代表' },
    { id: 'ep3', sourceId: 'ancient-greek', targetId: 'aristotle', type: 'extends', label: '代表' },
    { id: 'ep4', sourceId: 'socrates', targetId: 'socratic-method', type: 'extends', label: '方法' },
    { id: 'ep5', sourceId: 'plato', targetId: 'platonic-forms', type: 'extends', label: '理论' },
    { id: 'ep6', sourceId: 'plato', targetId: 'platonic-love', type: 'extends', label: '概念' },
    { id: 'ep7', sourceId: 'aristotle', targetId: 'four-causes', type: 'extends', label: '理论' },
    { id: 'ep8', sourceId: 'aristotle', targetId: 'logic', type: 'extends', label: '创立' },
    { id: 'ep9', sourceId: 'socrates', targetId: 'plato', type: 'dependency', label: '师承' },
    { id: 'ep10', sourceId: 'plato', targetId: 'aristotle', type: 'dependency', label: '师承' },
    { id: 'ep11', sourceId: 'modern-philosophy', targetId: 'descartes', type: 'extends', label: '开创' },
    { id: 'ep12', sourceId: 'modern-philosophy', targetId: 'kant', type: 'extends', label: '综合' },
    { id: 'ep13', sourceId: 'descartes', targetId: 'cogito', type: 'extends', label: '核心' },
    { id: 'ep14', sourceId: 'descartes', targetId: 'dualism', type: 'extends', label: '理论' },
    { id: 'ep15', sourceId: 'kant', targetId: 'critique-of-reason', type: 'extends', label: '著作' },
    { id: 'ep16', sourceId: 'kant', targetId: 'categorical-imperative', type: 'extends', label: '伦理' },
    { id: 'ep17', sourceId: 'ancient-greek', targetId: 'modern-philosophy', type: 'dependency', label: '影响' },
    { id: 'ep18', sourceId: 'contemporary-philosophy', targetId: 'existentialism', type: 'extends', label: '流派' },
    { id: 'ep19', sourceId: 'contemporary-philosophy', targetId: 'analytic-philosophy', type: 'extends', label: '流派' },
    { id: 'ep20', sourceId: 'existentialism', targetId: 'existence-precedes-essence', type: 'extends', label: '核心' },
    { id: 'ep21', sourceId: 'analytic-philosophy', targetId: 'logical-analysis', type: 'extends', label: '方法' },
    { id: 'ep22', sourceId: 'modern-philosophy', targetId: 'contemporary-philosophy', type: 'dependency', label: '发展' }
  ]
}

// 所有书籍列表
export const books: BookData[] = [
  thinkingFastAndSlow,
  westernPhilosophy
]

// 根据 ID 获取书籍
export function getBookById(bookId: string): BookData | undefined {
  return books.find(book => book.id === bookId)
}

// 获取书籍的知识图谱
export function getBookGraph(bookId: string): { nodes: KnowledgeNode[]; edges: KnowledgeEdge[] } {
  const book = getBookById(bookId)
  if (!book) {
    return { nodes: [], edges: [] }
  }
  return { nodes: book.nodes, edges: book.edges }
}

// 导出所有数据
export default {
  books,
  thinkingFastAndSlow,
  westernPhilosophy,
  getBookById,
  getBookGraph
}