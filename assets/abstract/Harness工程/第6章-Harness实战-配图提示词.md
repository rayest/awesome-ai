# Harness 实战 · 配图提示词

> 用途：公众号 / 课程 / 视频封面 + 内文插图
> 图片总数：10 张
> 生成地址：`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt={URL编码}&image_size={尺寸}`
> 可用尺寸：`landscape_16_9`（封面/横幅）、`portrait_4_3`（章节插图）、`square_hd`（配图卡片）

---

## 图片 1：封面（学车 vs 造车）

**尺寸**：landscape_16_9
**场景**：左学生学车 / 右工程师造车
**提示词**：

```
A cinematic wide-angle split-screen illustration. Left half "学车 (Learning)" shows a student driver behind a steering wheel with floating holographic diagrams of car components labeled "引擎" (engine), "变速箱" (gearbox), "刹车" (brakes) - all theoretical and abstract. Right half "造车 (Building)" shows a senior engineer assembling the same components into a complete car labeled "Claude Code" on a clean factory floor with tools and blueprints. The student looks uncertain, the engineer focused. Color palette: left in dreamy blue-gray (#718096) for theory, right in vivid orange-gold (#ED8936 and #D69E2E) for engineering. Editorial style with strong contrast. 16:9 wide composition.
```

## 图片 2：Agent Loop 闭环图

**尺寸**：landscape_16_9
**场景**：while True 循环 + 工具调用路由
**提示词**：

```
A horizontal flowchart showing the Agent Loop while True cycle. Three main nodes connected in a loop: "LLM 推理" (LLM Reasoning) with brain icon → "工具调用" (Tool Calls) with code brackets icon → "观察结果" (Observe Result) with eye icon → back to "LLM 推理". Surrounding tool icons floating: "run_bash" with terminal, "Read" with file, "Write" with pen, "Edit" with pencil. A red exit arrow labeled "tool_calls is None → break" showing the loop exit. Color palette: dark navy background (#0A1929) with cyan arrows, gold decision nodes, green exit path. Technical dashboard style. 16:9 composition.
```

## 图片 3：run_bash 4 重安全保护

**尺寸**：square_hd
**场景**：盾牌包围的 4 重安全锁
**提示词**：

```
A square infographic showing 4 layers of run_bash security protection. Center: a green code editor icon labeled "run_bash" wrapped in a glowing red shield. Around it 4 protective layers: 1. "危险命令黑名单" (Dangerous Command Blacklist) with red X over "rm -rf /". 2. "shell=True" (Complex Syntax) with code brackets. 3. "timeout=120s" (Timeout Protection) with clock icon. 4. "输出截断 50000 字符" (Output Truncation 50K chars) with scissors icon. Each layer with a distinct accent color (red, blue, gold, purple). Color palette: dark background with bright safety icons. Security-themed editorial style. 1:1 square composition.
```

## 图片 4：上下文工程三件套

**尺寸**：landscape_16_9
**场景**：SubAgent + Skills + Compact 三件套
**提示词**：

```
A horizontal illustration showing the 3 components of context engineering. Left third "SubAgent (子任务委派)" - a hand delegating a small task card to a child worker labeled "子 Agent 独立上下文" (independent sub-agent context). Middle third "Skills (按需加载)" - a USB Hub icon with progressive loading layers L1 / L2 / L3. Right third "Compact (压缩)" - a long document being compressed into a smaller one with key facts preserved labeled "已完成" "待办" "决策" "结果". All three connected by an arrow labeled "上下文工程" (Context Engineering). Color palette: purple for SubAgent, gold for Skills, cyan for Compact. Modern flat infographic. 16:9 composition.
```

## 图片 5：TaskManager 任务依赖图

**尺寸**：landscape_16_9
**场景**：JSON 持久化的任务依赖图
**提示词**：

```
A horizontal task dependency graph showing the TaskManager workflow. Center: a JSON file icon labeled "config.json" with persistent storage symbol. Around it 4 connected task nodes: "task_create" (add new) / "task_update" (modify status) / "task_list" (view all) / "task_get" (fetch one). Arrows between tasks show dependencies with labels "blockedBy" and "blocks" - one task labeled "pending" with a red blocked icon, another labeled "in_progress" with green check. Right side: status badges "pending" / "in_progress" / "completed" with different colors. Color palette: navy structure with gold task nodes and green/red status badges. Technical flow style. 16:9 composition.
```

## 图片 6：BackgroundManager 后台线程

**尺寸**：portrait_4_3
**场景**：主线程 + 后台线程并行时序图
**提示词**：

```
A vertical sequence diagram showing main thread and background thread running in parallel. Three lifelines: "主线程" (Main Thread) on left in blue, "后台线程" (Background Thread) in middle in purple, "通知队列" (Notification Queue) on right in red. Time axis going down. Main thread: "0s query" → "0.1s 启动后台 sleep 5" → "0.2s 创建文件" → "0.3s 立即响应" (no block). Background thread: "0.1s start" → "5.1s sleep done" → "5.2s put notification" → "5.3s exit". Notification queue: empty until 5.2s, then "[bg:abc123] completed: done". Highlight the parallelism: main thread never waits. Color palette: dark background with colored lifelines and arrows. Technical sequence diagram style. 4:3 portrait composition.
```

## 图片 7：SubAgent vs Agent Teams 对比

**尺寸**：landscape_16_9
**场景**：左 SubAgent 单向 / 右 Agent Teams 双向
**提示词**：

```
A split-screen comparison illustration. Left panel "SubAgent" shows: a Main Agent (gold cylinder) connected by single down arrow to a Sub Agent (silver cylinder) with label "单轮任务, 委派后销毁" (one-shot task, destroyed after delegation). No return path. Right panel "Agent Teams" shows: a Lead Agent (gold cylinder) connected by bidirectional arrows to multiple Teammate Agents (silver cylinders labeled "Worker 1" "Worker 2" "Worker 3"), all inside a "config.json 持久化" (persistent storage) boundary. Arrows between teammates labeled "双向通信" (bidirectional communication). Color palette: left in muted gray (#718096) for short-lived, right in vibrant gold (#D69E2E) for persistent team. Editorial style with bold typography. 16:9 composition.
```

## 图片 8：Bus 邮箱通信系统

**尺寸**：landscape_16_9
**场景**：多个 Agent + 多个邮箱 + JSONL 消息流
**提示词**：

```
A wide horizontal illustration showing the Bus communication system. Top row: 4 agent icons (Lead / Worker 1 / Worker 2 / Worker 3) as glowing orbs. Bottom row: 4 corresponding mailbox icons labeled "lead.jsonl" / "worker1.jsonl" / "worker2.jsonl" / "worker3.jsonl" - each is a small filing cabinet with JSONL messages inside. Arrows show messages flowing from one agent's outbox to another's inbox, with message types labeled "message" / "broadcast" / "result" / "shutdown" in different colors. A central Bus icon labeled "Bus" with the 4-mailbox design. Highlight: "消费即删除" (consume and delete) - the mailbox is empty after reading. Color palette: dark navy with neon connections, gold agent orbs, cyan messages. Network diagram style. 16:9 composition.
```

## 图片 9：Harness 三层架构

**尺寸**：portrait_4_3
**场景**：执行 / 协作 / 系统 三层堆叠
**提示词**：

```
A vertical 3-tier architecture diagram showing Harness layers. Top tier "执行层 Execution" (cyan) - contains "Agent Loop" + "run_bash" + "Read/Write/Edit" with a single brain icon. Middle tier "协作层 Collaboration" (gold) - contains "SubAgent" + "Skills" + "Compact" with interconnected nodes. Bottom tier "系统层 System" (purple) - contains "TaskManager" + "BackgroundManager" + "TeammateManager" with file icons and thread icons. Arrows show data flow upward. Top label: "基座 → 协作 → 系统" (Base → Collaboration → System). Bottom slogan: "LLM 能力差距在缩小, Harness 差距在拉大" (LLM capability gap shrinking, Harness gap widening). Color palette: cyan / gold / purple layered design. Technical architectural style. 4:3 portrait composition.
```

## 图片 10：决策树卡片（结尾图）

**尺寸**：portrait_4_3
**场景**：7 维度选型决策树
**提示词**：

```
A vertical decision tree infographic card for Harness capability selection. Top question: "你需要什么能力？" (What capability do you need?). 7 branches leading to solutions: "基础工具调用" → "Agent Loop + run_bash" with loop icon. "复杂任务隔离" → "+ SubAgent" with delegation icon. "跨场景复用" → "+ Skills" with USB Hub icon. "长任务管理" → "+ Compact" with compress icon. "跨会话工作流" → "+ TaskManager" with checklist icon. "慢操作并行" → "+ BackgroundManager" with parallel icon. "复杂跨域任务" → "+ Agent Teams" with team icon. Bottom slogan: "Harness = Agent Loop + SubAgent + Skills + Compact + TaskManager + BackgroundManager + Teammates" (the full stack). Color palette: navy structure with color-coded branches. Editorial infographic style. 4:3 portrait composition.
```

---

## 配套图片清单（汇总表格）

| # | 主题 | 对应章节 | 尺寸 | 信息密度重点 |
|---|------|----------|------|--------------|
| 1 | 封面：学车 vs 造车 | 开场钩子 | landscape_16_9 | 5 章理论 → 第 6 章工程化 |
| 2 | Agent Loop 闭环 | 第一节 | landscape_16_9 | while True + tool_calls 路由 |
| 3 | run_bash 4 重安全 | 第一节 | square_hd | 黑名单/超时/截断/语法 |
| 4 | 上下文工程三件套 | 第二节 | landscape_16_9 | SubAgent + Skills + Compact |
| 5 | TaskManager 依赖图 | 第三节 | landscape_16_9 | 4 工具 + JSON 持久化 |
| 6 | BackgroundManager 并行 | 第三节 | portrait_4_3 | 主线程 + 后台线程 + 通知队列 |
| 7 | SubAgent vs Agent Teams | 第四节 | landscape_16_9 | 单向 vs 双向通信对比 |
| 8 | Bus 邮箱通信 | 第四节 | landscape_16_9 | JSONL + 消费即删除 |
| 9 | Harness 三层架构 | 全章总结 | portrait_4_3 | 执行 / 协作 / 系统 |
| 10 | 决策树卡片 | 决策树段 | portrait_4_3 | 7 维度选型指南 |

---

## 使用建议

### 1. 生成顺序

- **首批优先**：图片 1（封面）+ 图片 9（三层架构）+ 图片 10（决策树）→ 公众号首图三件套
- **正文穿插**：图片 2-8 按章节顺序使用
- **结尾复用**：图片 10 决策树可作为单独推送

### 2. 风格统一原则

- **主色调**：深蓝（#0A1929）+ 青色（#00D9FF）+ 金色（#D69E2E）+ 紫色（#7C3AED）
- **辅助色**：警示红（#E53E3E）、绿色成功（#48BB78）、Docker 蓝（#2496ED）
- **字体建议**：标题用思源黑体 / Inter，正文用思源宋体
- **图标风格**：保持线性 + 实心填充的混合，避免纯扁平

### 3. URL 编码提醒

生成图片时需对 prompt 进行 URL 编码：

```bash
python3 -c "import urllib.parse; print(urllib.parse.quote('你的 prompt'))"
```

完整调用模板：

```
https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt={URL编码}&image_size=landscape_16_9
```

### 4. 公众号发布建议

- **封面图（图片 1）**：1200×675 像素，标题压在左下
- **正文图**：保持 16:9 比例，宽度撑满
- **决策树（图片 10）**：可单独做竖版海报
- **三层架构（图片 9）**：可作为整章总结的视觉锚点
