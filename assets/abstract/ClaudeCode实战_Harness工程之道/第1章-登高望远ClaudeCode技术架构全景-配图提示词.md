# 登高望远：Claude Code 技术架构全景 · 配图提示词

> 用途：技术分享 / 公众号封面 / 内文插图
> 图片总数：10 张
> 生成地址：`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt={URL编码}&image_size={尺寸}`
> 可用尺寸：landscape_16_9 / portrait_4_3 / square_hd

---

## 图片 1：冰山全景（封面）

**尺寸**：landscape_16_9
**提示词**：
```
A cinematic wide-angle illustration of a massive AI agent iceberg floating in calm deep-blue ocean. Above the waterline, only a tiny tip showing a chat terminal window labeled "对话窗口" and code snippets. Below the waterline, the iceberg's vast hidden base contains labeled glowing compartments: "记忆系统 CLAUDE.md", "Skills", "SubAgents", "Hooks", "MCP", "Agent SDK". Soft volumetric light rays piercing the water, deep teal and indigo palette, ultra-detailed, isometric 3D style, atmospheric fog, 8k render, professional tech illustration.
```

---

## 图片 2：摩天大楼四层架构（核心架构图）

**尺寸**：portrait_4_3
**提示词**：
```
A vertical cross-section illustration of a futuristic skyscraper with four clearly labeled floors. Top floor labeled "编程层 Agent SDK", third floor labeled "集成层 Headless + MCP", second floor labeled "扩展层 Skills/SubAgents/Hooks/Commands", ground floor labeled "记忆层 CLAUDE.md". Each floor glows in a different color: top in purple-blue, third in cyan, second in amber, ground in emerald. Foundation shows underground root system labeled "项目上下文". Editorial architectural style, clean linework, soft pastel lighting, magazine-quality render.
```

---

## 图片 3：CLAUDE.md 5 级记忆体系（层叠优先级）

**尺寸**：square_hd
**提示词**：
```
A flat-design infographic showing a 5-tier pyramid of priority levels, top-down. Tier 1 (top, smallest): "企业级 全组织" in red. Tier 2: "用户级 个人偏好" in orange. Tier 3: "项目级 团队共享" in yellow. Tier 4: "规则级 模块化" in green. Tier 5 (bottom, largest): "本地级 私人笔记" in blue. Cascading arrows showing override direction. Each tier labeled with corresponding file path. Minimalist editorial style, muted warm palette, clean sans-serif typography, white background, infographic poster.
```

---

## 图片 4：马具比喻（Harness = Model + 马具）

**尺寸**：landscape_16_9
**提示词**：
```
A side-by-side conceptual illustration. Left side: a powerful horse alone in a wild field, looking confused, labeled "Raw Model 只会说话". Right side: the same horse equipped with elegant leather harness and reins, pulling a sophisticated carriage on a paved road, labeled "Model + Harness 可做事". A subtle equation in the middle: "Agent = Model + Harness". Warm golden hour lighting, painterly editorial style, cinematic composition, soft focus background.
```

---

## 图片 5：四大组件触发机制对比

**尺寸**：landscape_16_9
**提示词**：
```
A 2x2 grid infographic showing four AI component cards, each with an icon, trigger mechanism, and engineering analogy. Top-left card "Commands" with terminal cursor icon, labeled "你叫它做" and "CLI 命令". Top-right card "Skills" with magic wand icon, labeled "它自己知道该做" and "策略模式". Bottom-left card "SubAgents" with branching nodes icon, labeled "它安排别人做" and "线程池隔离". Bottom-right card "Hooks" with chain link icon, labeled "到这一步就执行检查" and "中间件/Git Hooks". Muted blue-gray editorial palette, flat design with subtle 3D depth, magazine spread layout.
```

---

## 图片 6：代码审查请求的完整数据流（时序图风格）

**尺寸**：landscape_16_9
**提示词**：
```
A cinematic horizontal data flow diagram showing a code review request journey. Left side: a developer at terminal labeled "用户输入 审查代码". Middle sequence of glowing data nodes connected by light beams: "记忆层 加载 CLAUDE.md" → "Skills 语义匹配 security-review" → "子智能体 隔离执行审查" → "Hooks 自动格式化结果". Right side: a polished report card labeled "返回标准报告". Each node rendered as a translucent holographic panel. Dark navy background with cyan and amber accent lights, sci-fi UI style, cinematic depth of field.
```

---

## 图片 7：Agentic Loop 五步循环

**尺寸**：square_hd
**提示词**：
```
A circular flow diagram with five connected nodes arranged in a clockwise loop. Node 1: "接收输入" with document icon. Node 2: "模型推理" with brain icon. Node 3: "执行工具" with wrench icon. Node 4: "结果回流" with refresh arrow icon. Node 5: "返回结果" with checkmark icon. Center of the loop shows a large "Agentic Loop" label. Edges glow in gradient orange-to-purple. Clean flat editorial illustration, white background, subtle drop shadows, infographic quality.
```

---

## 图片 8：组件选型决策树

**尺寸**：portrait_4_3
**提示词**：
```
A vertical decision tree infographic for component selection. Root node "需求" branches into "触发方式" (left) and "运行环境" (right). Left path: "需要人触发" splits into "步骤固定 → Commands" and "需要判断 → Skills". "Claude 自动触发" splits into "事件节点 → Hooks" and "CI/CD → Headless". Right path: "任务量大 → 叠加子智能体", "需要外部系统 → 叠加 MCP", "需要代码控制 → Agent SDK". Tree branches glow in gradient teal-to-amber. Clean editorial style, white background, sans-serif labels, professional consulting-deck aesthetic.
```

---

## 图片 9：Plugins 打包机制（集装箱比喻）

**尺寸**：square_hd
**提示词**：
```
An isometric 3D illustration of a shipping container labeled "Plugin" containing visible glowing items inside: a code icon (Skills), a terminal icon (Commands), a robot icon (SubAgents), a chain icon (Hooks), a plug icon (MCP). The container sits on a dock with shipping crane in background. Around it: small icons showing "团队分发", "一键安装", "新人复用". Cool steel-blue and orange industrial palette, cinematic soft lighting, isometric editorial illustration, magazine-quality render.
```

---

## 图片 10：学习路径阶梯（5 步递进）

**尺寸**：landscape_16_9
**提示词**：
```
A horizontal ascending staircase illustration with five steps, each labeled with a component. Step 1 (lowest): "CLAUDE.md 地基" in emerald green. Step 2: "Commands 最直观" in blue. Step 3: "Skills 语义触发" in cyan. Step 4: "Hooks 安全守护" in amber. Step 5 (highest): "子智能体 高阶挑战" in purple. At the top of the staircase, a glowing trophy or summit labeled "框架化能力". A small character figure climbing the steps. Warm gradient background, editorial illustration style, motivational poster aesthetic, soft cinematic lighting.
```

---

## 配套图片清单（汇总表格）

| # | 主题 | 对应章节 | 尺寸 | 信息密度重点 |
|---|------|---------|------|------------|
| 1 | 冰山全景 | 开场 / 封面 | landscape_16_9 | 水面上下对比，引出框架定位 |
| 2 | 摩天大楼四层架构 | §1.2 | portrait_4_3 | 四层关系总览 |
| 3 | CLAUDE.md 5 级记忆体系 | §1.2.1 | square_hd | 层叠优先级规则 |
| 4 | 马具比喻 Harness | §1.1 / §1.2.5 | landscape_16_9 | 核心公式 Agent = Model + Harness |
| 5 | 四大组件触发对比 | §1.2.2 | landscape_16_9 | Commands/Skills/SubAgents/Hooks 区分 |
| 6 | 数据流实例 | §1.3.2 | landscape_16_9 | 端到端协作流程 |
| 7 | Agentic Loop 五步循环 | §1.2.5 | square_hd | Harness 心脏机制 |
| 8 | 选型决策树 | §1.4 | portrait_4_3 | 实操选型路径 |
| 9 | Plugins 打包机制 | §1.3.3 | square_hd | 分发与复用 |
| 10 | 学习路径阶梯 | §1.4 / 收尾 | landscape_16_9 | 5 步递进学习法 |

---

## 使用建议

1. **生成顺序**：封面（#1 冰山全景）→ 核心架构（#2 四层）→ 收尾（#10 阶梯）
2. **风格统一原则**：全部使用 cinematic editorial illustration 风格；主色调统一为深蓝 + 琥珀点缀；保留 "labeled 中文标签" 提示，确保每张图都有可读锚点
3. **URL 编码提醒**：调用生成地址时，prompt 中的空格、中文括号、换行符必须 URL-encode（建议使用 `encodeURIComponent`）
4. **尺寸选择**：封面与开篇用 16:9；分层架构类用 4:3 竖版；触发对比 / 数据流类用 16:9 横版；单点概念用 1:1 方版
5. **OCR 风险规避**：所有图中的中文标签建议用 AI 生成时直接嵌入，避免后期排版偏差
6. **配图密度**：本套图覆盖 10 个核心知识点，符合 8~15 张范围，信息密度递增排列