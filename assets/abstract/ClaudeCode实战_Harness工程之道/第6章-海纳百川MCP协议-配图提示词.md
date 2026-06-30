# 海纳百川：MCP 协议 · 配图提示词

> 用途：配套第 6 章深度解读的配图素材
> 图片总数：12 张
> 生成地址：`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt={URL编码}&image_size={尺寸}`
> 可用尺寸：landscape_16_9 / portrait_4_3 / square_hd / landscape_4_3

---

## 图片 1：USB-C 充电线类比（封面）

**尺寸**：landscape_16_9
**提示词**：
```
A cinematic split-screen editorial illustration depicting the USB-C adoption metaphor. Left side "MCP 出现前 Before MCP" (Before MCP): a chaotic desk drawer overflowing with tangled charging cables, each cable labeled with a different connector type (USB-A, Micro-USB, Lightning, Mini-USB, 30-pin). A frustrated person is trying to plug multiple devices into mismatched cables, with cables labeled "GitHub Adapter", "Jira Adapter", "Database Adapter", "Notion Adapter" forming a tangled web. Right side "MCP 出现后 After MCP" (After MCP): the same desk now clean and minimalist, with a single USB-C cable connecting to all devices (labeled "AI Client"). A peaceful person works with a single elegant connection. Color palette: left side warm reds (#DC2626) and chaotic grays for the cable mess, right side cool blues (#3B82F6) and greens (#10B981) for the clean modern setup. Cinematic lighting, photorealistic, sharp typography overlay in Chinese and English, 4K detail, aspect ratio 16:9.
```

---

## 图片 2：M×N 复杂度 vs M+N 标准化

**尺寸**：landscape_16_9
**提示词**：
```
A clean comparison infographic showing two architectural diagrams side by side. Left diagram "M×N 复杂度" (M×N Complexity): a grid of 3 AI clients (rows) × 5 data sources (columns) all connected by crisscrossing red lines, total 15 unique adapter connections needed, with chaos annotations and red warning colors. Right diagram "M+N 标准化" (M+N Standardization): the same 3 clients and 5 data sources all connected through a central hub labeled "MCP 统一协议 MCP Protocol USB-C" (MCP Protocol / USB-C), with 3+5=8 simple connections, with a clean green color palette. The transformation is annotated as "15 → 8 connections, 节省 47% 复杂度节省" (47% Complexity Reduction). Color palette: left side alarming red (#DC2626) and orange (#F59E0B), right side calming green (#10B981) and blue (#3B82F6). White background, modern flat design, infographic style, bilingual Chinese-English labels, 4K detail, aspect ratio 16:9.
```

---

## 图片 3：MCP 三大角色架构图

**尺寸**：landscape_16_9
**提示词**：
```
A technical architecture diagram showing the MCP three-tier role system. Top layer "Host 宿主" (Host): an icon of a desktop computer and CLI terminal labeled "Claude Code 桌面版 / CLI". Middle layer "MCP Client 客户端" (MCP Client): a hexagonal hub labeled with "JSON-RPC 2.0 Protocol" annotations, showing internal protocol handling. Bottom layer "MCP Server 服务器" (MCP Server): three server icons connected to different data sources - "filesystem" (folder icon), "GitHub API" (GitHub logo), "Jira API" (Jira logo), and "Database" (cylinder icon). Each connection is labeled with the protocol used (stdio or HTTP). The whole diagram is annotated with "关注点分离 Separation of Concerns" (Host 关心对话体验, Client 关心协议通信, Server 关心数据封装). Color palette: dark navy background (#0D1B2A), teal (#3FB8AF) for Client, mint green (#10B981) for Servers, gold (#F59E0B) for Host, white text. Modern technical diagram aesthetic, 4K detail, aspect ratio 16:9.
```

---

## 图片 4：3 种通信协议对比图

**尺寸**：landscape_16_9
**提示词**：
```
A clean horizontal infographic showing three communication protocol options. Card 1 "stdio" (highlighted green): a terminal icon, with text "本地进程通信 Local Process", "简单 Simple, 零网络配置 Zero Network Config, 启动快 Fast Startup", "适合: 文件系统、本地数据库" (Suitable for: Filesystem, Local Database). Card 2 "HTTP + SSE" (crossed out red): a network icon with red X overlay, text "已废弃 DEPRECATED", "不再推荐" (No longer recommended). Card 3 "streamable_http" (highlighted blue): a network icon with arrow, text "远程服务调用 Remote Service", "兼容 HTTP 生态 HTTP Ecosystem, 可跨网络 Cross-Network", "适合: GitHub / Jira / Notion 远程 API" (Suitable for: GitHub / Jira / Notion Remote APIs). A footer annotation: "JSON-RPC 2.0 跨语言、跨平台的统一消息格式" (JSON-RPC 2.0 Unified Cross-Language, Cross-Platform Message Format). Color palette: white background, green (#10B981), red (#DC2626), blue (#3B82F6) for the three states. Modern flat card design, sharp Chinese-English typography, 4K detail, aspect ratio 16:9.
```

---

## 图片 5：MCP .mcp.json 配置文件结构解剖

**尺寸**：landscape_16_9
**提示词**：
```
A detailed technical diagram showing the structure of a .mcp.json configuration file. Center: a JSON code block showing 4 server configurations: filesystem (stdio with npx command), fetch (stdio with npx command), github (http with type/url/headers), database (stdio with npx and DSN). Each server has annotated callout arrows pointing to the right showing: 1) "command + args 字段" for stdio servers, 2) "type: http + url + headers 字段" for HTTP servers, 3) "${ENV_VAR} 环境变量占位符" for all servers, 4) "headers.Authorization Bearer token" for HTTP auth. Background: dark mode code editor aesthetic with syntax highlighting in yellow/cyan/pink. Color palette: dark navy (#0D1B2A), yellow (#FCD34D) for strings, cyan (#67E8F9) for keys, pink (#F472B6) for variables, white annotation text. Technical documentation style, 4K detail, aspect ratio 16:9.
```

---

## 图片 6：MCP + Skills 厨房与菜谱协作

**尺寸**：landscape_16_9
**提示词**：
```
A cinematic side-by-side illustration of a professional kitchen and a recipe book. Left side "厨房 = MCP" (Kitchen = MCP): a fully equipped professional kitchen with industrial refrigerator (labeled "数据库 Database"), stove (labeled "API 调用 API Call"), ingredients (labeled "数据源 Data Source"), knives (labeled "工具 Tools"). A chef labeled "Claude" can access all equipment. Right side "菜谱 = Skills" (Recipe = Skills): a beautifully illustrated recipe book labeled "sprint-manager" showing "步骤 1: jira.get_sprint", "步骤 2: jira.list_issues", "步骤 3: jira.get_issue_details", "输出格式: Sprint 状态报告" with precise step-by-step instructions. A central arrow shows the integration: "菜谱指导厨师使用厨房设备 Recipe Guides Chef to Use Kitchen Equipment". Color palette: kitchen in warm yellows (#FCD34D) and stainless steel grays, recipe book in cream and warm browns, central arrow in vibrant green (#10B981). Cinematic restaurant aesthetic, 4K detail, aspect ratio 16:9.
```

---

## 图片 7：三层纵深安全机制

**尺寸**：landscape_16_9
**提示词**：
```
A high-tech security diagram showing three concentric security rings protecting a central "MCP 服务器" (MCP Server). Outer ring "第一层 首次连接交互式审批" (Layer 1: First Connection Interactive Approval): a gate icon requiring "显式授权 Explicit Authorization", labeled "强制流程，无法绕过 Mandatory, Cannot Bypass". Middle ring "第二层 工具级权限控制" (Layer 2: Tool-Level Permission Control): a security scanner icon with "二次确认 Secondary Confirmation" for "副作用操作 Side-Effect Operations" (file write, code exec, DB modify). Inner ring "第三层 OAuth 2.0 动态认证" (Layer 3: OAuth 2.0 Dynamic Auth): a rotating key icon with "令牌自动过期与刷新 Token Auto-Expire & Refresh". Three security risks are shown being blocked: "提示注入 Prompt Injection", "工具权限滥用 Tool Permission Abuse", "冒名顶替 Impersonation". Three security practices are listed: "数据库只读账号 Database Read-Only", "环境变量注入 API Key via Env Var", "官方命名空间优先 Official Namespace Priority". Color palette: dark navy (#0F172A), alarm red (#DC2626) for risks, success green (#10B981) for protections, gold (#F59E0B) for central server. Security shield aesthetic, 4K detail, aspect ratio 16:9.
```

---

## 图片 8：3 个实战场景示意

**尺寸**：landscape_16_9
**提示词**：
```
A clean three-panel infographic showing 3 typical MCP usage scenarios. Panel 1 "数据查叙 Data Query": user query "统计最近7天订单总额" (Total orders last 7 days), arrow to a database icon with "database MCP", result showing "¥XXX,XXX". Panel 2 "任务管理 Task Management": user query "创建 GitHub Issue" (Create GitHub Issue), arrow to a GitHub icon with "GitHub MCP", result showing "Issue #1234 已创建" (Issue #1234 Created). Panel 3 "文档检索 Document Retrieval": user query "React 19 Server Components 文档" (React 19 Server Components docs), arrow to a web icon with "fetch MCP", result showing "最新 API 文档" (Latest API Documentation). Each panel has a small Claude Code icon orchestrating the call. Color palette: white background, panel 1 in blue (#3B82F6), panel 2 in dark gray (#1F2937) for GitHub, panel 3 in green (#10B981) for docs. Clean modern flat design, infographic style, bilingual labels, 4K detail, aspect ratio 16:9.
```

---

## 图片 9：MCP vs Hooks vs Skills 三大扩展机制定位

**尺寸**：landscape_16_9
**提示词**：
```
A Venn diagram or three-pillar comparison showing MCP, Hooks, and Skills positioning. Three large rounded rectangles arranged in a triangle. Top-left "MCP 海纳百川" (MCP All-Encompassing): icon of a connection plug, "拓展数据和服务触达边界" (Extend data and service reach), "厨房 = 原料+设备" (Kitchen = Materials + Equipment). Top-right "Skills 授人以渔" (Skills Teach Fishing): icon of an open book, "指导执行策略" (Guide execution strategy), "菜谱 = 流程+规范" (Recipe = Process + Standards). Bottom-center "Hooks 防微杜渐" (Hooks Prevent Micro-Issues): icon of a traffic light, "界定行为禁区" (Define behavior禁区), "红绿灯 = 强制约束" (Traffic Light = Mandatory Constraint). Center intersection labeled "Claude Code 扩展体系 Claude Code Extension System". A note below: "三者相辅相成：MCP 赋予连接能力, Skills 规范调用逻辑, Hooks 筑牢安全防线" (The three complement each other: MCP grants connection capability, Skills standardize invocation logic, Hooks build security defense). Color palette: MCP in teal (#3FB8AF), Skills in amber (#F59E0B), Hooks in red (#DC2626), all on dark navy background (#0D1B2A). Clean flat design, 4K detail, aspect ratio 16:9.
```

---

## 图片 10：Token 管理双阈值示意

**尺寸**：landscape_16_9
**提示词**：
```
A horizontal bar chart visualization showing MCP output token thresholds. The bar is divided into 3 zones from left to right. Zone 1 (green, 0-10000 tokens): "正常输出 Normal Output", icon of a smiling face. Zone 2 (yellow, 10000-25000 tokens): "警告阈值 Warning Threshold", icon of a warning triangle, with text "10000 Token 时显示警告" (Warning displayed at 10000 tokens). Zone 3 (red, 25000+ tokens): "自动截断 Auto Truncation", icon of a scissors cutting the bar, with text "25000 Token 时自动截断" (Auto truncated at 25000 tokens). A control panel at the bottom shows: "MAX_MCP_OUTPUT_TOKENS 环境变量可调整阈值" (MAX_MCP_OUTPUT_TOKENS env var can adjust thresholds), with a slider visualization. A small annotation: "防止上下文溢出 Prevent Context Overflow". Color palette: white background, green (#10B981) for safe, yellow (#F59E0B) for warning, red (#DC2626) for critical. Data visualization style, clean labels, 4K detail, aspect ratio 16:9.
```

---

## 图片 11：企业级部署 - managed-mcp.json

**尺寸**：landscape_16_9
**提示词**：
```
A corporate IT diagram showing centralized MCP deployment. Top center: an admin labeled "管理员 Admin" with a crown icon. From the admin, arrows go down to two paths: 1) "managed-mcp.json 配置文件" (managed-mcp.json Config File), 2) "Claude for Enterprise 管理后台" (Claude for Enterprise Admin Console). Both paths converge into a central "预配置 MCP 服务器池" (Pre-configured MCP Server Pool) showing icons for Jira, Linear, Notion, Database, GitHub. From this pool, multiple rays spread out to "团队成员" (Team Members) represented by 10+ worker silhouettes labeled with company badges, all annotated with "零配置开箱即用 Zero-Config Out-of-Box". A security shield surrounds the pool with text "集中式审计与管控 Centralized Audit and Control". A benefits split: "对开发者: 零配置开箱即用" (For Developers: Zero-Config) and "对安全: 集中式审计" (For Security: Centralized Audit). Color palette: corporate blue (#1E40AF) for admin, teal (#3FB8AF) for servers, green (#10B981) for team members. Modern enterprise IT diagram aesthetic, 4K detail, aspect ratio 16:9.
```

---

## 图片 12：MCP 信任评估 + npm 包对比

**尺寸**：landscape_16_9
**提示词**：
```
A side-by-side comparison illustration showing MCP server trust evaluation equating to npm package trust evaluation. Left side "评估 MCP 服务器" (Evaluate MCP Server): a magnifying glass examining a server package labeled "@modelcontextprotocol/server-fetch", with checkmarks for: "✓ 官方命名空间 Official Namespace", "✓ 维护活跃度 Active Maintenance", "✓ 下载量 Download Count", "✓ 社区口碑 Community Reputation". Right side "评估 npm 包" (Evaluate npm Package): the same magnifying glass examining an npm package, with the same 4 checkmarks. Both sides converge to a central shield labeled "可信 Trusted". A footer annotation: "核心在于考察其来源 Source 维护活跃度 Activity 下载量 Volume 社区口碑 Reputation" (Core is to examine source, activity, downloads, reputation). Color palette: white background, magnifying glass in dark gray, checkmarks in green (#10B981), trusted shield in blue (#3B82F6), warning red (#DC2626) for unverified sources. Comparison infographic style, 4K detail, aspect ratio 16:9.
```

---

## 配套图片清单（汇总表格）

| # | 主题 | 对应章节 | 尺寸 | 信息密度重点 |
|---|------|---------|------|------------|
| 1 | USB-C 充电线类比（封面） | 6.1 起源 | landscape_16_9 | MCP 解决的核心问题视觉化 |
| 2 | M×N vs M+N 复杂度对比 | 6.1 起源 | landscape_16_9 | 15→8 连接数节省 |
| 3 | MCP 三大角色架构 | 6.2 核心架构 | landscape_16_9 | Host/Client/Server 关系 |
| 4 | 3 种通信协议对比 | 6.3 通信协议 | landscape_16_9 | stdio / HTTP+SSE 废弃 / streamable_http |
| 5 | .mcp.json 配置结构 | 6.4 配置文件 | landscape_16_9 | 4 大服务器配置示例 |
| 6 | MCP + Skills 厨房与菜谱 | 6.8 协作模式 | landscape_16_9 | sprint-manager 完整流程 |
| 7 | 三层纵深安全机制 | 6.7 安全机制 | landscape_16_9 | 首次审批 / 工具权限 / OAuth 2.0 |
| 8 | 3 个实战场景 | 6.5 实战配置 | landscape_16_9 | 数据查询 / Issue 创建 / 文档检索 |
| 9 | MCP vs Hooks vs Skills 三大扩展 | 6.11 定位对比 | landscape_16_9 | 三角定位图 |
| 10 | Token 管理双阈值 | 6.10 调试 | landscape_16_9 | 10000 / 25000 阈值 |
| 11 | 企业级 managed-mcp.json | 6.9 企业部署 | landscape_16_9 | 集中式管理 |
| 12 | MCP 信任评估 + npm 包对比 | 6.7 安全机制 | landscape_16_9 | 4 维评估标准 |

---

## 使用建议

1. **生成顺序**：先做封面（图片 1、2），再做架构（图片 3、4、5），最后做实战（图片 6-12）
2. **风格统一**：所有图片均采用深色背景 + 高对比度色彩块的现代编辑设计风格
3. **关键元素**：每张图必须包含 1~2 个视觉锚点（USB-C 充电线、MCP 协议节点、厨房与菜谱、安检门、机场等）
4. **URL 编码提醒**：生成前需将提示词进行 URL 编码
5. **配图优先级**：如时间有限，优先生成 **图片 1（封面）、2（M×N 对比）、4（协议对比）、6（厨房与菜谱）、7（安全机制）** 这 5 张，覆盖全章最核心概念
6. **避免堆砌**：每张图的文字标签不超过 8 个，复杂内容拆为多张图
