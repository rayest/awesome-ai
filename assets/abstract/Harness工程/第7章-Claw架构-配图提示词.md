# Claw 架构 · 配图提示词

> 用途：公众号 / 课程 / 视频封面 + 内文插图
> 图片总数：10 张
> 生成地址：`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt={URL编码}&image_size={尺寸}`
> 可用尺寸：`landscape_16_9`（封面/横幅）、`portrait_4_3`（章节插图）、`square_hd`（配图卡片）

---

## 图片 1：封面（数字虾）

**尺寸**：landscape_16_9
**场景**：永远在线的数字虾
**提示词**：

```
A cinematic wide-angle illustration of a digital lobster robot mascot in a futuristic server room. The lobster (labeled "数字虾 / NanoClaw") is glowing cyan, sitting at a desk with a 24/7 sign, multiple monitors showing chat interfaces (Telegram / Feishu), a Cron clock icon for scheduled tasks, and a transparent Docker container dome labeled "沙箱 / Sandbox" around it for safety. Behind it: a wall of 8 server modules labeled "编排器 / Channels / IPC / Router / Container-Runner / Task-Scheduler / SQLite / Group-Queue". The scene is calm, the lobster looks alert and ready. Color palette: deep navy (#0A1929) background with cyan lobster (#00D9FF), gold accents (#D69E2E), green status indicator (#48BB78). Cyberpunk editorial style. 16:9 wide composition.
```

## 图片 2：OpenClaw vs NanoClaw 对比

**尺寸**：landscape_16_9
**场景：左 OpenClaw 庞大 / 右 NanoClaw 精简
**提示词**：

```
A horizontal split-screen comparison illustration. Left half "OpenClaw 40 万行" shows: a giant mountain of code blocks stacked 10 layers high, with a single developer looking overwhelmed, small "💀" icon showing confusion. Right half "NanoClaw 4 000 行" shows: a single slim code book on a clean desk, with the same developer now smiling, holding a glass of water, an AI brain icon beside the book labeled "GLM-5 一口气读完" (GLM-5 reads in one go). Comparison labels: "40 万行 vs 4 000 行" (400K vs 4K lines), "Token 不可估量 vs ~35 000 Token" (immeasurable vs ~35K tokens). Color palette: left in stressful red-gray (#E53E3E and #718096), right in clean tech blue-green (#3182CE and #48BB78). Editorial flat design. 16:9 composition.
```

## 图片 3：NanoClaw 一内一外架构

**尺寸**：landscape_16_9
**场景：太极图风格的内外架构
**提示词**：

```
A wide horizontal yin-yang style architecture diagram showing the inside-outside structure. Top half "容器内 (Execution Layer)" inside a blue Docker container dome, containing: "Agent Loop" (brain icon) + "Skills" (toolbox icon) + "Browser" (globe icon) + "Work Directory" (folder icon). Bottom half "容器外 (Management Layer)" outside the dome, containing 8 connected module icons arranged in a circle: "编排器" (Orchestrator) / "group-queue" (queue icon) / "Channels" (chat icons) / "IPC Watcher" (file icon) / "Router" (route icon) / "container-runner" (container icon) / "task-scheduler" (clock icon) / "SQLite" (database icon). Connecting arrows show "Docker Spawn" between layers. Center: a yin-yang dot showing "安全隔离" (Security Isolation). Color palette: blue (#3182CE) for inside, gold (#D69E2E) for outside, dark navy background. Architectural flat design. 16:9 composition.
```

## 图片 4：8 大模块八卦阵

**尺寸**：square_hd
**场景：8 模块环形布局
**提示词**：

```
A square infographic showing the 8 external modules arranged in a Bagua (八卦) style circle. Center: a glowing SQLite database icon labeled "SQLite 数据库 (消息/任务/会话/群组)". Around it 8 module icons connected to center: 1. "编排器 index.ts" (top, with brain + loop icon). 2. "group-queue" (top-right, with queue lines icon). 3. "Channels" (right, with chat bubbles icon). 4. "IPC Watcher" (bottom-right, with file folder icon). 5. "Router" (bottom, with route arrow icon). 6. "container-runner" (bottom-left, with container icon). 7. "task-scheduler" (left, with clock icon). 8. "Channels 通道注册" (top-left, with factory icon). Each module has a small Chinese label and a 2-character English abbreviation. Color palette: 8 different accent colors for variety, dark navy background, gold center. Editorial infographic style. 1:1 square composition.
```

## 图片 5：6 大功能链路时序图

**尺寸**：portrait_4_3
**场景：6 链路纵列时序图
**提示词**：

```
A vertical sequence diagram showing 6 functional chains. Time axis going down with 6 horizontal swimlanes labeled: "链路 1: 消息接收与持久化" (IM → Channels → SQLite). "链路 2: 主循环与消息处理" (轮询 2s → 触发词检查 → 上下文代入). "链路 3: 定时任务调度" (Cron / Interval / 一次性 + 锚定计划时间). "链路 4: 并发控制与容器分配" (group-queue → pipe 传输或入队). "链路 5: IPC 通信" (input / messages / tasks 三目录). "链路 6: 结果路由" (容器 → 路由器 → Channel → IM). Each chain has its own key data items flowing: message envelope, agent call, container creation, IPC file, response. Color palette: 6 different pastel colors per chain, dark background with bright text. Technical sequence diagram style. 4:3 portrait composition.
```

## 图片 6：文件系统 IPC 三目录

**尺寸**：landscape_16_9
**场景：3 个邮箱 + 双向箭头
**提示词**：

```
A horizontal diagram showing the file-system IPC design with 3 directories. Top: "容器外 (主进程)" with 3 mailbox icons labeled "input/ 目录" (主→容器, message+close), "messages/ 目录" (容器→主, response), "tasks/ 目录" (容器→调度器, cron task CRUD). Bottom: "容器内 (Agent)" with a brain icon and 3 incoming arrows. Center: arrows flowing both ways showing bi-directional communication. Right side annotation: "目录路径天然充当权限边界" (directory path naturally serves as permission boundary) with a shield icon. Left side: "普通群组只能访问自己的 IPC 目录" (regular groups can only access their own IPC directory) with a lock icon. Color palette: 3 different colors for each directory (red, green, blue), dark navy background, gold arrows. Technical diagram style. 16:9 composition.
```

## 图片 7：飞书 Channel 开发流程

**尺寸**：landscape_16_9
**场景：4 步开发流程
**提示词**：

```
A horizontal 4-step process diagram showing the Feishu Channel development workflow. Step 1 "Plan 模式" with brain icon - "切换 OpenCode Plan 模式梳理流程". Step 2 "理解流程" with magnifying glass - "Telegram 客户端 → 服务器 → NanoClaw". Step 3 "OpenCode 自动开发" with code brackets - "在 src/channels/ 写飞书 Channel". Step 4 "人工审查" with checkmark - "审查 + 必要调整完成". Below: a "飞书开放平台" panel showing App creation flow with "创建自建应用 → 配置 webhook → 填入 .env". Bottom annotation: "利用 sdkEnv 参数 + .env 灵活切换国内大模型" (use sdkEnv + .env to flexibly switch domestic LLMs). Color palette: 4 progressive colors (blue, green, gold, orange), editorial infographic style. 16:9 composition.
```

## 图片 8：定时任务锚定策略

**尺寸**：landscape_16_9
**场景：错误 vs 正确策略对比
**提示词**：

```
A horizontal timeline comparison showing two scheduling strategies after a 2-hour system interruption. Top "❌ 错误策略: 从当前时间追赶" shows: timeline with green dots at 0min, 5min, 10min, 15min, 20min, then a red gap (interruption) from 20min to 140min, then immediately "现在 140min" with 5 dots bunched together at 140-145min (catch-up triggers). Bottom "✓ 正确策略: 锚定计划时间" shows: same timeline with 5 dots at 0-20min, red gap 20-140min, then continuing dots at 140, 145, 150... maintaining the original 5-minute interval, with text "时间不漂移 / 调度准确" (no time drift / accurate scheduling). Color palette: top in alarming red (#E53E3E), bottom in steady green (#48BB78), white background. Time series visualization style. 16:9 composition.
```

## 图片 9：NanoClaw 部署流程

**尺寸**：portrait_4_3
**场景：5 步部署流程
**提示词**：

```
A vertical 5-step deployment process diagram for NanoClaw. Step 1 "编译 Docker 镜像" with Docker whale icon - "./build.sh". Step 2 "安装依赖" with package icon - "npm install". Step 3 "编译 TypeScript" with code icon - "npm run build". Step 4 "启动服务" with play icon - "npm run dev". Step 5 "飞书测试" with chat icon - "你好 / 定时任务验证". Each step has a green checkmark on completion. Bottom: "部署成功" (Deployment Successful) with a NanoClaw lobster mascot waving. Right side: status indicators "Container pool: 5" / "Active groups: 1" / "⏰ Cron: enabled". Color palette: 5 sequential colors (cyan, blue, gold, orange, red) showing progression, dark background, white text. Mobile-friendly vertical flow style. 4:3 portrait composition.
```

## 图片 10：决策树卡片（结尾图）

**尺寸**：portrait_4_3
**场景：选型决策树
**提示词**：

```
A vertical decision tree infographic card for Claw class product selection. Top question: "你的需求？" (Your requirement?). 5 branches: "只用不开发" → "Claude Code / Cursor" with IDE icon. "学习 + 定制" → "NanoClaw (4 000 行)" with code book icon. "企业级自动化" → "OpenClaw (40 万行)" with office building icon. "IM 集成" → "NanoClaw + 自定义 Channel" with chat icon. "定时任务" → "NanoClaw task-scheduler" with clock icon. "多群组并发" → "OpenClaw 完整版" with multi-group icon. Bottom slogan: "数字虾 = 始终在线 + 自主调度 + IM 集成" (Digital Lobster = Always Online + Auto-Scheduling + IM Integration). Color palette: navy structure with color-coded branches. Editorial infographic style. 4:3 portrait composition.
```

---

## 配套图片清单（汇总表格）

| # | 主题 | 对应章节 | 尺寸 | 信息密度重点 |
|---|------|----------|------|--------------|
| 1 | 封面：数字虾 | 开场钩子 | landscape_16_9 | 24/7 在线 + 沙箱 + 8 模块 |
| 2 | OpenClaw vs NanoClaw | 第一节 | landscape_16_9 | 40 万行 vs 4 000 行 |
| 3 | 一内一外架构 | 第二节 | landscape_16_9 | 太极图风格 + 8 模块 + 沙箱 |
| 4 | 8 大模块八卦阵 | 第二节 | square_hd | 环形布局 + SQLite 中心 |
| 5 | 6 大功能链路 | 第三节 | portrait_4_3 | 时序图纵列 6 链路 |
| 6 | IPC 三目录 | 第三节 | landscape_16_9 | 邮箱 + 双向箭头 + 权限边界 |
| 7 | 飞书 Channel 流程 | 第四节 | landscape_16_9 | 4 步开发 + OpenCode 自动化 |
| 8 | 定时任务锚定策略 | 第三节 | landscape_16_9 | 错误 vs 正确策略对比 |
| 9 | 部署流程 | 第四节 | portrait_4_3 | 5 步从编译到测试 |
| 10 | 决策树卡片 | 决策树段 | portrait_4_3 | 5 维度选型 |

---

## 使用建议

### 1. 生成顺序

- **首批优先**：图片 1（封面）+ 图片 3（一内一外）+ 图片 10（决策树）→ 公众号首图三件套
- **正文穿插**：图片 2、4-9 按章节顺序使用
- **结尾复用**：图片 10 决策树可作为单独推送

### 2. 风格统一原则

- **主色调**：深蓝（#0A1929）+ 青色（#00D9FF）+ 金色（#D69E2E）+ 绿色（#48BB78）
- **辅助色**：警示红（#E53E3E）、Docker 蓝（#2496ED）、紫罗兰（#7C3AED）
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
- **定时任务锚定策略（图片 8）**：可作为深度解读的核心视觉锚点
