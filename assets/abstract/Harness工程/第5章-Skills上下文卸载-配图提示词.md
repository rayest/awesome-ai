# Skills · 配图提示词

> 用途：公众号 / 课程 / 视频封面 + 内文插图
> 图片总数：10 张
> 生成地址：`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt={URL编码}&image_size={尺寸}`
> 可用尺寸：`landscape_16_9`（封面/横幅）、`portrait_4_3`（章节插图）、`square_hd`（配图卡片）

---

## 图片 1：封面（USB Hub 比喻）

**尺寸**：landscape_16_9
**场景**：传统 100 驱动 vs USB Hub 渐进加载
**提示词**：

```
A cinematic wide-angle illustration showing two computer setup scenarios. Left half: a messy desk with 100 scattered USB devices each with its own bulky driver installation box labeled "驱动 1" through "驱动 100" (Driver 1 to Driver 100), a system monitor showing "33% 内存已占用" (33% memory used) in red warning, the user looks stressed. Right half: a clean single USB Hub labeled "SKILLS Hub" in the center, with devices plugged in only as needed (a USB drive labeled "ops-inspection" / a keyboard labeled "sql-query" / a mouse labeled "code-review"), a system monitor showing "2% 内存已占用" (2% memory used) in green. Color palette: left in chaotic red-orange (#E53E3E and #ED8936), right in clean tech blue (#2C5282) and emerald green (#48BB78). Editorial flat design with isometric elements. 16:9 wide composition.
```

## 图片 2：Skills 4 大组件结构

**尺寸**：landscape_16_9
**场景**：商品类比的 4 大组件拆解
**提示词**：

```
A horizontal infographic-style illustration showing a "product package" analogy for Skills 4 components. Center: a single folder labeled "ops-inspection" (the Skill) wrapped as a product box. Around it 4 sub-components radiating outward: 1. Top: "SKILL.md" as a product label + instruction manual with checkmark "必选" (required) badge in red. 2. Right: "scripts/" as tools box labeled "可执行代码 Python 等" (executable code Python etc). 3. Bottom: "references/" as a thick reference book labeled "领域参考资料" (domain reference materials). 4. Left: "assets/" as a stack of templates labeled "静态资源 模板" (static resources templates). Color palette: warm beige (#F7FAF) background with gold product box (#D69E2E) and 4 accent colors per component (red, blue, green, purple). Flat design with clear labels. 16:9 composition.
```

## 图片 3：3 级渐进式加载

**尺寸**：landscape_16_9
**场景**：3 级加载的洋葱层叠图
**提示词**：

```
A horizontal layered onion-style infographic showing 3 levels of Skills loading. Center circle "Agent" surrounded by 3 concentric layers. Innermost layer (cyan #00D9FF): "L1 标签" (L1 Tags) - small icons with names and descriptions, labeled "启动时加载" (loaded at startup). Middle layer (gold #F6E05E): "L2 文档" (L2 Document) - a SKILL.md document icon, labeled "判断适用时加载" (loaded when needed). Outermost layer (purple #7C3AED): "L3 资源" (L3 Resources) - a folder with scripts/ references/ assets/ icons, labeled "执行时按需" (on-demand at execution). Right side annotations: "节省 67 000 Token" (save 67K tokens) and "上下文开销下降 99%" (context overhead reduced 99%). Color palette: dark navy background with bright concentric layer colors. Modern editorial infographic style. 16:9 composition.
```

## 图片 4：Skills vs MCP 痛点对比

**尺寸**：landscape_16_9
**场景**：左 MCP 痛点 / 右 Skills 解决
**提示词**：

```
A split-screen comparison illustration. Left panel "传统 MCP 痛点" shows: a server room with 7 overflowing server racks labeled "MCP Server 1" through "MCP Server 7", each rack has 15+ tool icons sticking out, a giant red counter showing "67 000 Token" with subtitle "占上下文 33%". A small user asking "1+1=?" gets a "2" reply with a giant multiplication symbol "× 13 400" indicating context overhead. Right panel "Skills 解决方案" shows: a clean single rack labeled "Skills Hub" with 4 small folder icons representing different skills, a small green counter showing "~200 Token" with subtitle "L1 标签". A user asking the same "1+1=?" gets a "2" reply with "× 1" indicating minimal overhead. Color palette: left in alarming red (#E53E3E) and gray (#718096), right in clean green (#48BB78) and blue (#2C5282). Editorial style with bold typography. 16:9 composition.
```

## 图片 5：Agent 控制流程

**尺寸**：portrait_4_3
**场景**：竖版流程图，Skills 调用路径
**提示词**：

```
A vertical flowchart showing the Skills-based Agent control flow. From top to bottom: Step 1 "初始化阶段" (Initialization) - "遍历 Skills 目录" (scan Skills dir) with folder icons, "读取 SKILL.md L1 标签" (read L1 tags). Step 2 "任务处理" (Task Processing) - a chat bubble with user request. Step 3 "LLM 判断" (LLM Judgment) - brain icon with thought bubble "匹配某 Skill？". Step 4 "二级加载" (L2 Loading) - Read tool icon pointing to a SKILL.md document. Step 5 "资源协同" (Resource Coordination) - branching into 3 paths: Bash→scripts, Read→references, none→assets. Step 6 "生成响应" (Generate Response) - LLM brain with output text. Connecting arrows labeled "ReAct 循环" (ReAct loop) showing feedback. Color palette: navy background with cyan arrows, gold decision nodes, green terminal nodes. Technical flow diagram style. 4:3 portrait composition.
```

## 图片 6：SKILL.md 5 大要素

**尺寸**：square_hd
**场景**：5 大要素卡片网格
**提示词**：

```
A square 5-card grid showing SKILL.md 5 essential elements. Each card has a Chinese label and a short description. Card 1: clock icon "定时机" (Define Timing) - "明确触发条件与适用情境" (define trigger conditions). Card 2: target icon "立目标" (Set Goal) - "一句话说明核心问题" (one-sentence core problem). Card 3: gear icon "理规则" (Detail Rules) - "详细执行逻辑与操作步骤" (detailed execution logic). Card 4: book icon "给示例" (Provide Examples) - "典型输入输出对（正反例）" (typical I/O pairs - positive/negative). Card 5: shield icon "划边界" (Define Boundaries) - "能力边界与限制条件" (capability boundaries). Each card with a different accent color (orange, blue, green, purple, red). Color palette: pastel cards with vibrant icons, white background, modern flat design. 1:1 square composition.
```

## 图片 7：扣子编程生成 Skill 流程

**尺寸**：landscape_16_9
**场景**：左侧开发 / 右侧沙盒 / 中间对话框
**提示词**：

```
A wide horizontal screenshot-style illustration showing the Coze (扣子编程) Skills development interface. Left panel: "AI 开发过程" (AI Development Process) showing code being generated line by line with "scripts/collect_system_info.py" visible, similar to a Cursor IDE experience. Right panel: "沙盒环境" (Sandbox Environment) showing a test interface with "扣子通用 Agent" (Coze Universal Agent) testing the Skill. Center bottom: a chat input box with the prompt "帮我编写一个运维巡检 Skill, 可以自动进行服务器的巡检（检查 CPU、内存、磁盘、Docker 容器状态）" (Help me write an Operations Inspection Skill that can automatically inspect servers). Top right: a green checkmark "下载完成" (Download Complete) with folder structure shown. Color palette: dark IDE theme with cyan code text, white sandbox, gold accent on the prompt. Realistic UI mockup style. 16:9 composition.
```

## 图片 8：OpenClaw 飞书机器人测试

**尺寸**：landscape_16_9
**场景**：飞书对话窗口 + 巡检报告输出
**提示词**：

```
A horizontal chat interface illustration showing OpenClaw (龙虾) Feishu bot testing the ops-inspection Skill. Left: a Feishu chat interface with two messages. Message 1: user asking "你是否存在 ops-inspection 这个 Skill" (Do you have the ops-inspection Skill), bot reply: a green checkmark "✓ Skill 已加载" (Skill loaded) with Skill metadata. Message 2: user asking "使用该 Skill 执行一次巡检" (Use the Skill to perform an inspection), bot reply: a structured inspection report card with sections labeled "CPU 状态" (CPU Status) / "内存状态" (Memory Status) / "磁盘状态" (Disk Status) / "Docker 容器" (Docker Containers) each with green/yellow/red status badges. Right: a small sidebar showing the Skill folder structure at "/usr/lib/node_modules/openclaw-cn/skill" with ops-inspection folder. Color palette: white chat background with green/blue bot responses, red/yellow warning indicators, dark code sidebar. Modern UI mockup style. 16:9 composition.
```

## 图片 9：SkillLoader 类代码截图

**尺寸**：portrait_4_3
**场景**：代码块展示
**提示词**：

```
A vertical code editor mockup showing the SkillLoader Python class implementation. Dark IDE theme with syntax highlighting: import statements at top (re, pathlib.Path, Dict, Tuple), class SkillLoader with __init__ method, _load_all() method with rglob loop, _parse_frontmatter() with regex matching, get_descriptions() returning formatted strings. Side annotations point to key methods: "_load_all() 递归扫描" (recursive scan), "_parse_frontmatter() 解析 YAML" (parse YAML), "get_descriptions() 构建标签列表" (build tag list). Color palette: dark gray background (#1A202C) with cyan code text (#00D9FF), green strings (#48BB78), yellow keys (#F6E05E), and orange annotations (#ED8936). IDE-style mockup. 4:3 portrait composition.
```

## 图片 10：决策树卡片（结尾图）

**尺寸**：portrait_4_3
**场景**：3 维度选型决策树
**提示词**：

```
A vertical decision tree infographic card for Skills solution selection. Top question: "工具数量？" (How many tools?). Three branches: "< 10 个" → "MCP 工具集" (MCP tool set) with tool icons. "10-50 个" → "Skills + 渐进式加载" (Skills + progressive loading) with USB Hub icon. "> 50 个" → "Skills + 索引 + 分级权限" (Skills + index + tiered permissions) with multi-layer icon. Middle question: "Skill 来源？" (Skill source?). Three branches: "内部编写" → "SKILL.md 5 大要素" (5 essential elements). "AI 生成" → "扣子编程 / Cursor" (Coze/Cursor) with AI icon. "第三方" → "OpenClaw / Claude Code" with bot icon. Bottom question: "加载策略？" (Loading strategy?). Two branches: "粗粒度" → "L1 + L2" with simple icon. "细粒度" → "L1 + L2 + L3" with detailed icon. Bottom slogan: "Skills = 标准化 + 渐进式加载" (Skills = standardized + progressive loading). Color palette: navy structure with color-coded branches. Editorial infographic style. 4:3 portrait composition.
```

---

## 配套图片清单（汇总表格）

| # | 主题 | 对应章节 | 尺寸 | 信息密度重点 |
|---|------|----------|------|--------------|
| 1 | 封面：USB Hub 比喻 | 开场钩子 | landscape_16_9 | 痛点引入（33% vs 2%） |
| 2 | Skills 4 大组件 | 第二节 | landscape_16_9 | SKILL.md 必选 + 3 可选 |
| 3 | 3 级渐进式加载 | 第三节 | landscape_16_9 | L1 / L2 / L3 洋葱层叠 |
| 4 | Skills vs MCP 痛点 | 第三节 | landscape_16_9 | 67 000 vs 200 Token |
| 5 | Agent 控制流程 | 第四节 | portrait_4_3 | ReAct 循环 + Skills 加载路径 |
| 6 | SKILL.md 5 大要素 | 第五节 | square_hd | 定时机/立目标/理规则/给示例/划边界 |
| 7 | 扣子编程生成 Skill | 第五节 | landscape_16_9 | 左侧开发 + 右侧沙盒 + 中间对话框 |
| 8 | OpenClaw 飞书测试 | 第五节 | landscape_16_9 | 飞书对话 + 巡检报告输出 |
| 9 | SkillLoader 代码 | 第五节 | portrait_4_3 | 元数据加载实现 |
| 10 | 决策树卡片 | 决策树段 | portrait_4_3 | 3 维度选型指南 |

---

## 使用建议

### 1. 生成顺序

- **首批优先**：图片 1（封面）+ 图片 3（3 级加载）+ 图片 10（决策树）→ 公众号首图三件套
- **正文穿插**：图片 2、4-9 按章节顺序使用
- **结尾复用**：图片 10 决策树可作为单独推送

### 2. 风格统一原则

- **主色调**：深蓝（#1A202C）+ 青色（#00D9FF）+ 金色（#D69E2E）+ 紫色（#7C3AED）
- **辅助色**：警示红（#E53E3E）、绿色成功（#48BB78）、橙色（#ED8936）
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
