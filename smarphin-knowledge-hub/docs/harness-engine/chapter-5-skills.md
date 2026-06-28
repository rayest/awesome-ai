---
title: 第五章 Skills：上下文卸载的艺术
---

# Skills：让 Agent 按需加载专家经验

## 速查表

| 概念 | 一句话定义 | 加载时机 | 典型规模 | 典型场景 |
|------|----------|----------|----------|----------|
| Skill | 标准化结构化文档封装专家经验包 | 按需加载 | 数百个工具定义 | 运维巡检 / 数据分析 / 内容生成 |
| SKILL.md | Skill 的核心标签 + 说明书 | 必选 / L1 必加载 | 500~800 Token | 所有 Skill |
| scripts/ | 可执行代码脚本（Python 等） | L3 按需执行 | 数千行 | 运维脚本 / 数据处理 |
| references/ | 参考资料文档 | L3 按需加载 | 数万字 | 健康阈值 / 食谱 / 业务规范 |
| assets/ | 静态资源与模板 | L3 按需加载 | 图片 / 模板 | 输出格式样例 |
| 渐进式加载 | L1 标签 → L2 文档 → L3 资源 | 3 级按需 | — | 节省 67% 上下文 |

---

## 0. 全章比方：USB 协议 vs 工具堆砌

想象两个场景：

**场景 A（传统 MCP）**：你给电脑接了 100 个外设——每个都要预装驱动，**全部描述信息常驻内存**。结果系统还没启动，光驱动列表就吃掉了 33% 的内存。

**场景 B（Skills 渐进式加载）**：你接了一个**标准 USB Hub**——只告诉系统"我有个 Hub"（L1）；用户插入什么设备（U 盘 / 键盘 / 鼠标），才加载对应驱动（L2 / L3）。

核心区别：**Skills 让 LLM 知道"有什么"但不强制加载"是什么"**——需要时再加载。

---

## 5.1 Skills 概述

### 5.1.1 Skills 是什么

**核心定义**：Skills 是**标准化结构化格式的专家经验包**，将"解决问题的完整上下文（思考路径 / 执行流程 / 依赖工具 / 数据来源 / 输出规范）"封装为独立单元。

**两个关键比喻**：

| 视角 | 类比 |
|------|------|
| 知识管理 | 项目复盘文档（任务完成后按模板整理） |
| 技术架构 | 本地化 RAG（动态检索 + 结构化内容） |

**Skills vs 普通文档 / RAG 的区别**：

| 维度 | 普通文档 | RAG 检索 | Skills |
|------|----------|----------|--------|
| 内容组织 | 自由格式 | 半结构化 | **强结构化** |
| 调用精准度 | 低（依赖搜索关键词） | 中（语义匹配） | **高（标签 + 描述引导）** |
| 资源协同 | 文本为主 | 文本为主 | **支持代码 + 资源协同执行** |
| 触发方式 | 人工查找 | LLM 自动检索 | **LLM 主动判断 + 工具调用** |

### 5.1.2 Skills 的结构定义

**类比 MCP 之于工具集成**——只要 Agent 能解析该结构，即可加载并使用任意 Skills。

**4 大组件**：

| 组件 | 必选 | 作用 | 类比 |
|------|------|------|------|
| **SKILL.md** | ✅ 必选 | 核心标签 + 说明书 | 商品标签 + 说明书 |
| **scripts/** | 可选 | 可执行代码（Python 等） | 内置工具 |
| **references/** | 可选 | 领域参考资料 | 技术手册 / 字典 |
| **assets/** | 可选 | 静态资源 + 模板 | 包装盒 + 配件 |

**典型目录结构**：

```
ops-inspection/                    # 运维巡检 Skill
├── SKILL.md                       # 核心说明（必选）
├── scripts/
│   └── collect_system_info.py    # CPU/内存/磁盘采集脚本
├── references/
│   └── inspection-standards.md   # 健康阈值标准
└── assets/
    └── report_template.md        # 巡检报告模板
```

### 关键代码：collect_system_info.py（CPU 信息采集）

**用途**：Skill 内部 scripts/ 目录下的可执行脚本示例。

```python
from typing import Dict, Any
import psutil

def get_cpu_info() -> Dict[str, Any]:
    """获取 CPU 信息"""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count(logical=True)
        cpu_count_physical = psutil.cpu_count(logical=False)
        load_avg = psutil.getloadavg() if hasattr(psutil, "getloadavg") else None

        return {
            "cpu_percent": cpu_percent,
            "cpu_count_logical": cpu_count,
            "cpu_count_physical": cpu_count_physical,
            "load_avg": load_avg,
            "status": "ok",
        }
    except Exception as e:
        return {
            "error": str(e),
            "status": "error",
        }
```

**关键设计点**：
- `interval=1`：采样 1 秒内的 CPU 使用率
- `logical=True/False`：分别获取逻辑核心与物理核心数
- `hasattr` 容错：`getloadavg` 在 Windows 上不存在
- 异常捕获：返回错误结构而非抛出异常（避免 Skill 中断）

### 5.1.3 Skills 的渐进式加载机制

**传统 MCP 的痛点**（真实数据）：

> 7 个 MCP Server + 100 多个工具 → 工具描述占 **67 000 Token** ≈ LLM 上下文窗口的 **33%**
> 用户仅问"1+1=?"（5 Token）→ 上下文开销 **13 400 倍**

**Skills 的 3 级渐进式加载**：

| 加载级别 | 加载内容 | 加载时机 | 类比 |
|----------|----------|----------|------|
| **L1 标签** | SKILL.md 元数据（名称 + 描述 + 标签） | Agent 启动时（一次性） | 商品标签 |
| **L2 文档** | SKILL.md 完整正文（任务目标 / 规则 / 示例 / 边界） | 判断某 Skill 可能适用时 | 商品说明书 |
| **L3 资源** | scripts/ + references/ + assets/ | 实际执行过程中按需 | 商品配件 / 工具 |

**核心洞察 1**：scripts/ 中的代码**不会送入 LLM 上下文**——由 Agent 内置的 Bash 工具直接执行，仅返回运行结果。这是 **CodeAct 模式的典型延伸**——代码视为动作而非文本。

**核心洞察 2**：即便一个 Skill 内部打包了数百个工具定义、完整数据字典或上百页参考手册，只要当前任务无须使用，**这些内容就不会进入 LLM 的上下文**。

### 5.1.4 如何设计支持 Skills 的 Agent

#### 1. 基础工具设计

Skills 本质是一组结构化文件，因此 Agent 至少需要 **Read（读取）+ Act（执行）** 两类基础能力。

| 工具 | 作用 | 扩展性 |
|------|------|--------|
| **Read** | 读取任意文件内容（SKILL.md / 参考文档） | — |
| **Bash** | 执行系统命令（遍历目录 / 运行脚本 / 创建文件） | — |
| Write | 写入文件 | 可选 |
| Edit | 修改文件内容 | 可选 |

**关键原则**：所有工具都应**保持通用性**，避免为特定 Skills 定制专用接口。

#### 2. Agent 控制流程

```
[初始化阶段]
   ↓
遍历 Skills 目录 → 读取每个 SKILL.md 的 L1 标签
   ↓
将标签注入系统提示词 → LLM 获知可用 Skills 集合

[任务处理阶段]
   ↓
LLM 判断某任务可能匹配某 Skill
   ↓
触发 Read 工具读取完整 SKILL.md（L2 文档）
   ↓
若文档指示需执行脚本/查阅资料 → Bash 执行 scripts/ + Read 获取 references/
   ↓
结合加载内容 + 执行结果 → LLM 生成最终响应
```

**与 ReAct 架构天然适配**：LLM 负责推理与决策，工具负责感知与行动。

### 关键代码：SkillLoader 类（一级加载元数据）

**用途**：在 Agent 启动时扫描 Skills 目录，提取元数据（不加载完整正文）。

```python
import re
from pathlib import Path
from typing import Dict, Tuple

class SkillLoader:
    def __init__(self, skills_dir: Path):
        self.skills_dir = skills_dir
        self.skills = {}
        self._load_all()

    def _load_all(self):
        if not self.skills_dir.exists():
            return

        for f in sorted(self.skills_dir.rglob("SKILL.md")):
            text = f.read_text(encoding="utf-8")
            meta, body = self._parse_frontmatter(text)

            name = meta.get("name", f.parent.name)
            self.skills[name] = {
                "meta": meta,
                "body": body,
                "path": str(f),
            }

    def _parse_frontmatter(self, text: str) -> Tuple[Dict, str]:
        match = re.match(r"^---\n(.*?)\n---\n(.*)", text, re.DOTALL)
        if not match:
            return {}, text

        meta = {}
        for line in match.group(1).strip().splitlines():
            if ":" in line:
                key, val = line.split(":", 1)
                meta[key.strip()] = val.strip()

        return meta, match.group(2).strip()

    def get_descriptions(self) -> str:
        if not self.skills:
            return "(no skills available)"

        lines = []
        for name, skill in self.skills.items():
            desc = skill["meta"].get("description", "No description")
            tags = skill["meta"].get("tags", "")
            line = f"- {name}: {desc}"
            if tags:
                line += f" [{tags}]"
            lines.append(line)

        return "\n".join(lines)
```

**3 个核心设计点**：

| # | 设计点 | 作用 |
|---|--------|------|
| 1 | `_load_all()` 递归扫描 | 一次性加载所有 Skills 索引，避免后续重复 IO |
| 2 | `rglob("SKILL.md")` | 递归查找任意层级的 SKILL.md 文件 |
| 3 | `_parse_frontmatter()` 解析 YAML | 提取 L1 标签（name + description + tags） |

### 关键代码：get_content（二级加载完整内容）

**用途**：当 Agent 判断需要某个 Skill 时，调用此方法读取完整 SKILL.md。

```python
def get_content(self, name: str) -> str:
    skill = self.skills.get(name)
    if not skill:
        return f"Error: Unknown skill '{name}'. Available: {', '.join(self.skills.keys())}"

    return f"<skill name=\"{name}\">\n{skill['body']}\n</skill>"
```

**关键设计**：使用 `<skill>` 标签包裹内容，便于 LLM 识别"这是 Skill 内容"。

### 关键代码：集成 load_skills 到 Agent Loop

**用途**：在 Agent 主循环中路由 load_skills 工具调用。

```python
def agent_loop(messages):
    while True:
        response = send_messages(messages)

        if response.choices[0].message.tool_calls is not None:
            messages.append(response.choices[0].message)

            for tool_call in response.choices[0].message.tool_calls:
                arguments_dict = json.loads(tool_call.function.arguments)

                if tool_call.function.name == "load_skills":
                    result = SKILL_LOADER.get_content(arguments_dict["name"])
                    messages.append({
                        "role": "tool",
                        "content": result,
                        "tool_call_id": tool_call.id,
                    })
                elif tool_call.function.name == "run_bash":
                    result = run_bash(arguments_dict["command"])
                    messages.append({
                        "role": "tool",
                        "content": result,
                        "tool_call_id": tool_call.id,
                    })
        else:
            break
```

**关键设计**：通过工具路由将 Skills 加载无缝集成到现有 Agent Loop 中。

### 关键代码：系统提示词（一级加载触发）

**用途**：在系统提示词中注入 Skills 标签列表，触发一级加载。

```python
SYSTEM_PROMPT = f"""
你是在 {WORKDIR} 目录下的编程代理。
在处理不熟悉的话题之前，先使用 load_skills 获取相关的专业知识。
可用 Skills：
{SKILL_LOADER.get_descriptions()}
"""
```

**3 个关键点**：
1. 动态注入 `WORKDIR`：限定 Agent 工作目录
2. **行为指引**："先使用 load_skills"——训练 LLM 主动加载
3. **标签列表**：`get_descriptions()` 返回所有可用 Skills 的 L1 标签

---

## 5.2 实战：零代码开发"运维巡检 Skill"

### 5.2.1 使用扣子编程开发

**SKILL.md 写作 5 大要素**：

| # | 要素 | 作用 | 示例 |
|---|------|------|------|
| 1 | **定时机** | 明确触发条件与适用情境 | "当用户询问服务器运行状态时" |
| 2 | **立目标** | 一句话说明核心问题（聚焦可衡量） | "将自然语言查询转换为结构化 SQL" |
| 3 | **理规则** | 详细执行逻辑（输入解析 / 中间处理 / 输出格式） | "读取 CSV → 解析列名 → 生成 SQL" |
| 4 | **给示例** | 典型输入输出对（正反例） | "输入：'查询北京销售额' → 输出：SELECT..." |
| 5 | **划边界** | 能力边界与限制条件（兜底策略） | "信息不足时返回'信息不足，无法生成答案'" |

**扣子编程生成流程**：

```
主页面 → 技能标签 → 对话框输入需求提示词
   ↓
AI 自动生成 Skill 文件夹
   ↓
左侧：开发过程（类似 Cursor 体验）
右侧：沙盒环境（可调用通用 Agent 测试）
   ↓
完成开发 → 点击文件夹图标 → 文件目录视图
   ↓
点击"下载" → 获取完整 Skill 文件夹
```

**生成示例**："帮我编写一个'运维巡检 Skill'，可以自动进行服务器的巡检（检查 CPU、内存、磁盘、Docker 容器状态），并输出一份巡检报告。"

**扣子编程的 4 大设计**：

| 设计 | 作用 |
|------|------|
| `psutil` 库采集系统指标 | 跨平台获取 CPU / 内存 / 磁盘信息 |
| 采集逻辑封装 `scripts/collect_system_info.py` | 关注点分离 |
| 阈值标准 `references/inspection-standards.md` | 评估依据可溯源 |
| 整合结果生成标准化报告 | 输出一致性 |

### 5.2.2 基于 OpenClaw 测试

**环境准备**：

| 步骤 | 命令 / 路径 |
|------|------------|
| Python 版本 | ≥ 3.7 |
| 安装依赖 | `pip install psutil>=5.9.0` |
| Skill 上传路径 | `/usr/lib/node_modules/openclaw-cn/skill` |
| IM 渠道 | 飞书机器人（命名为"龙虾"） |

**测试流程**：

```
[步骤 1] 检测 Skill 是否被加载
用户：你是否存在 ops-inspection 这个 Skill
系统：返回 Skill 元数据

[步骤 2] 测试 Skill 执行效果
用户：使用该 Skill 执行一次巡检
系统：生成完整巡检报告（CPU/内存/磁盘/Docker 状态）
```

**关键成果**：**整个过程无须编写任何运维脚本、无须配置告警推送逻辑、无须手动调度任务**——仅通过几轮自然语言对话，便完成了传统运维中通常需要数小时编码、测试与部署的工作。

---

## 横向对比：Skills vs MCP vs 传统文档

| 维度 | 传统文档 | MCP 工具集 | Skills |
|------|----------|------------|--------|
| **触发方式** | 人工查找 | Agent 启动全量加载 | LLM 主动判断按需加载 |
| **上下文开销** | 0（不入上下文） | **67 000 Token / 100 工具** | L1 标签 ≈ 100~200 Token |
| **结构化程度** | 自由格式 | 工具描述 | **强结构化 + YAML Frontmatter** |
| **资源协同** | 文本 | 工具调用 | **代码 + 文档 + 资源** |
| **可复用性** | 跨人 / 难跨 Agent | 跨 Agent | **跨 Agent + 跨平台** |

---

## 工程踩坑清单

| 坑 | 表现 | 解法 |
|----|------|------|
| **元数据未提取** | LLM 不知道有哪些 Skills 可用 | 启动时调 `_load_all()` |
| **正文过早加载** | 浪费上下文窗口 | L1 仅加载标签，L2 触发 `get_content()` |
| **scripts 进 LLM** | scripts/ 代码塞进上下文 | 由 Bash 直接执行，**仅返回结果** |
| **元数据格式错误** | `_parse_frontmatter` 解析失败 | 函数返回空 dict + 全文，保证健壮性 |
| **Skill 名称冲突** | 同名 Skill 互相覆盖 | 优先取 frontmatter 的 `name`，否则取文件夹名 |
| **Skill 内容过长** | 单个 Skill 吃满上下文 | L2 / L3 拆分 + 按需加载 |
| **平台不兼容** | 在 OpenClaw 写的 Skill 在 Claude Code 跑不了 | 遵循 SKILL.md 标准结构（跨平台规范） |
| **description 写得太泛** | LLM 不知何时调 | 定时机 / 立目标 / 划边界 5 大要素齐全 |

---

## 全章知识地图

```
第5章 Skills：上下文卸载的艺术
│
├── 5.1 Skills 概述
│   ├── 5.1.1 Skills 是什么（专家经验包 + 本地化 RAG）
│   ├── 5.1.2 结构定义（SKILL.md + scripts/ + references/ + assets/）
│   ├── 5.1.3 渐进式加载机制（L1 标签 → L2 文档 → L3 资源）
│   └── 5.1.4 设计支持 Skills 的 Agent
│       ├── 基础工具（Read + Bash）
│       ├── Agent 控制流程
│       ├── SkillLoader 类（一级加载）
│       └── get_content 方法（二级加载）
│
└── 5.2 实战：零代码开发"运维巡检 Skill"
    ├── 5.2.1 使用扣子编程
    │   ├── SKILL.md 5 大要素
    │   ├── 自然语言编程
    │   └── collect_system_info.py
    └── 5.2.2 基于 OpenClaw 测试
        ├── 环境准备（psutil 依赖）
        ├── Skill 上传（标准路径）
        └── 飞书机器人对话测试
```

---

## 贯穿主线

> **Skills 的本质 = 标准化结构化文档 + 渐进式按需加载**
>
> 让 LLM **知道有什么**（L1 标签），但**不强制加载是什么**（L2 / L3 按需）
>
> **关键数据**：7 个 MCP Server + 100 工具 → 67 000 Token 浪费 → 改成 Skills 后仅 ~200 Token 标签

---

## 学习路径建议

| 阶段 | 必学 | 推荐时长 |
|------|------|----------|
| 入门 | SKILL.md 结构 + 4 大组件 | 1 天 |
| 进阶 | 渐进式加载机制 + L1 / L2 / L3 | 2-3 天 |
| 实战 | SkillLoader + get_content 实现 | 3-5 天 |
| 高级 | 编写高质量 SKILL.md（5 大要素） | 1 周 |
| 专家 | 跨平台 Skills 设计（Claude Code / OpenClaw / 扣子） | 1-2 周 |

---

## 生产化 3 维度增强

1. **检索深度**：在 Skills 之上叠加 Skills 索引（按业务 / 角色 / 任务分类）
2. **版本管理**：为每个 Skill 引入 Git 版本控制，支持回滚与 A/B 测试
3. **权限分级**：不同用户角色加载不同 Skills（管理员 / 开发者 / 普通用户）
