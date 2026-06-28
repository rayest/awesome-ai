export type LearningNodeTone = 'teal' | 'amber' | 'coral' | 'blue' | 'green' | 'slate'

export interface LearningTask {
  prompt: string
  options: string[]
  answer: number
  explanation: string
}

export interface LearningNode {
  id: string
  order: string
  title: string
  subtitle: string
  description: string
  slug?: string[]
  tone: LearningNodeTone
  x: number
  y: number
  concepts: string[]
  cards: string[]
  task: LearningTask
}

export const learningNodes: LearningNode[] = [
  {
    id: 'prompt-village',
    order: '01',
    title: 'Prompt Village',
    subtitle: '提示词工程',
    description: '从一次性提问开始，理解为什么只改措辞很快会遇到天花板。',
    slug: ['harness-engine', 'chapter-1-prompt-to-context'],
    tone: 'teal',
    x: 16,
    y: 28,
    concepts: ['单轮输入', '明确目标', '输出格式', '提示边界'],
    cards: ['目标', '格式', '语气'],
    task: {
      prompt: '提示词工程最适合解决哪类问题？',
      options: ['单次问答的表达优化', '跨会话长期记忆', '多 Agent 调度'],
      answer: 0,
      explanation: '提示词工程主要优化一次输入的表达；复杂任务通常需要上下文工程继续接力。',
    },
  },
  {
    id: 'context-workshop',
    order: '02',
    title: 'Context Workshop',
    subtitle: '上下文工坊',
    description: '把用户画像、约束、外部知识和历史记忆放到合适位置，让回答质量稳定变好。',
    slug: ['harness-engine', 'chapter-1-prompt-to-context'],
    tone: 'green',
    x: 44,
    y: 22,
    concepts: ['用户画像', '约束条件', '外部知识', '上下文卸载'],
    cards: ['用户画像', '约束条件', '外部知识'],
    task: {
      prompt: '上下文工程的关键不是把输入写得更漂亮，而是？',
      options: ['系统化采集、过滤和组合信息', '把所有资料塞进窗口', '只使用更长的提示词'],
      answer: 0,
      explanation: '核心是信息采集、过滤、组合与持续演化；越多不等于越好。',
    },
  },
  {
    id: 'react-loop',
    order: '03',
    title: 'ReAct Loop',
    subtitle: 'ReAct 模式',
    description: '把思考、行动和观察连成循环，让 Agent 能边做边修正。',
    slug: ['harness-engine', 'chapter-1-prompt-to-context'],
    tone: 'amber',
    x: 72,
    y: 28,
    concepts: ['Thought', 'Action', 'Observation', '迭代决策'],
    cards: ['思考', '行动', '观察'],
    task: {
      prompt: 'ReAct 的典型节奏是什么？',
      options: ['推理、行动、观察，再更新上下文', '先写完整报告再搜索', '直接调用固定函数结束'],
      answer: 0,
      explanation: 'ReAct 的价值在于不断把行动结果反馈进上下文。',
    },
  },
  {
    id: 'code-agent-lab',
    order: '04',
    title: 'Code Agent Lab',
    subtitle: '代码代理',
    description: '用代码作为行动方式，把重复工具调用变成一次可执行程序。',
    slug: ['harness-engine', 'chapter-2-context-driver'],
    tone: 'coral',
    x: 24,
    y: 70,
    concepts: ['CodeAct', '沙箱', '执行效率', '安全边界'],
    cards: ['循环代码', '沙箱', '反思检查'],
    task: {
      prompt: 'Code Agent 相比逐步 ReAct 的优势通常是？',
      options: ['把重复动作合并成一次代码执行', '完全不需要安全边界', '只适合写 Markdown'],
      answer: 0,
      explanation: 'Code Agent 通过生成和执行代码提升效率，但仍需要沙箱和审查。',
    },
  },
  {
    id: 'deep-research',
    order: '05',
    title: 'Deep Research Observatory',
    subtitle: '深度研究',
    description: '从单次搜索升级为多轮探索、评估、反思和报告整合。',
    slug: ['harness-engine', 'chapter-3-deep-research'],
    tone: 'blue',
    x: 54,
    y: 74,
    concepts: ['探索', '评估', '追加搜索', '报告整合'],
    cards: ['搜索线索', '质量评估', '研究报告'],
    task: {
      prompt: 'DeepResearch 与 DeepSearch 的核心差别是？',
      options: ['会多轮评估并调整研究策略', '只检索内部向量库', '不会输出报告'],
      answer: 0,
      explanation: 'DeepResearch 不止搜索一次，而是持续探索、反思和整合。',
    },
  },
  {
    id: 'multi-agent-command',
    order: '06',
    title: 'Multi-Agent Command',
    subtitle: '多智能体系统',
    description: '用角色隔离上下文，让专家 Agent 分工协作，降低认知噪声。',
    slug: ['harness-engine', 'chapter-1-prompt-to-context'],
    tone: 'slate',
    x: 82,
    y: 70,
    concepts: ['Manager Agent', 'SubAgent', '上下文隔离', '任务仲裁'],
    cards: ['研究员', '执行者', '评审者'],
    task: {
      prompt: 'Multi-Agent 最直接解决的问题是？',
      options: ['上下文污染和分工复杂度', '让页面动画更多', '取消所有人工审核'],
      answer: 0,
      explanation: '多 Agent 的本质收益是上下文隔离与专家分工。',
    },
  },
]

export function getLearningNodeById(id: string) {
  return learningNodes.find((node) => node.id === id)
}

export function getLearningNodeBySlug(slug: string[]) {
  const slugKey = slug.join('/')
  return learningNodes.find((node) => node.slug?.join('/') === slugKey) ?? learningNodes[0]
}
