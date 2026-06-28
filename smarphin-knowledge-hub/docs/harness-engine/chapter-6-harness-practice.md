---
title: 第六章 Harness 工程实践：复现 Claude Code 核心设计模式
---

# Harness 实战：从 0 到 1 复现 Claude Code

## 速查表

| 模式 | 一句话定义 | 核心机制 | 典型场景 |
|------|----------|----------|----------|
| Agent Loop | LLM + 工具的循环调用闭环 | while True + tool_calls 路由 | 所有 Agent 基座 |
| SubAgent | 任务委派给独立上下文的子 Agent | 任务描述 + 中间结果压缩 | 隔离复杂任务 |
| Skills | 按需加载的专家经验包 | L1 / L2 / L3 渐进式加载 | 跨场景复用 |
| Compact | 上下文压缩与摘要 | 触发式压缩 + 会话管理 | 长任务 |
| TaskManager | 持久化任务管理 | JSON 文件 + 状态机 | 跨会话工作流 |
| BackgroundManager | 后台异步任务 | 多线程 + 通知队列 | 慢操作不阻塞 |
| Agent Teams | 多 Agent 持久化协作 | Leader + Teammates + BUS | 复杂跨域任务 |

---

## 0. 全章比方：自己造一辆车

想象你在学车。

**第 1-5 章** = 学开车——你理解了引擎、变速箱、刹车的工作原理。

**第 6 章** = 从零造一辆车——亲手把引擎、变速箱、刹车组装成一台完整的 Claude Code。

核心：**从理论到工程化复现**——把"用 Claude Code"变成"自己造一个 Claude Code"。

---

## 6.1 Agent Loop：所有 Agent 的基座

### 6.1.1 Bash 工具实现

**类比**：Bash = Agent 的"双手"——可以执行任意系统命令。

### 关键代码：run_bash 工具

**用途**：执行 Shell 命令并返回结果，带安全 / 超时 / 截断 3 重保护。

```python
import os
import subprocess

DANGEROUS_PATTERNS = ["rm -rf /", "sudo", "mkfs", "dd if=/dev/zero"]

def run_bash(command: str) -> str:
    for pattern in DANGEROUS_PATTERNS:
        if pattern in command:
            return f"Error: Dangerous command '{pattern}' blocked"

    try:
        r = subprocess.run(
            command,
            shell=True,
            cwd=os.getcwd(),
            capture_output=True,
            text=True,
            timeout=120,
        )
        out = (r.stdout + r.stderr).strip()
        return out[:50000] if out else "(no output)"
    except subprocess.TimeoutExpired:
        return "Error: Timeout(120s)"
```

**4 大安全设计**：

| # | 设计 | 作用 |
|---|------|------|
| 1 | `DANGEROUS_PATTERNS` 黑名单 | 拦截 `rm -rf /` / `sudo` / `mkfs` / `dd if=/dev/zero` |
| 2 | `shell=True` | 支持复杂 Shell 语法 |
| 3 | `cwd=os.getcwd()` | 在工作目录执行 |
| 4 | `timeout=120` | 防止 sleep 200 / 死循环 |
| 5 | `[:50000]` 截断 | 防止超长输出撑爆上下文 |

### 6.1.2 Agent Loop 主循环

**类比**：Agent Loop = Agent 的"大脑回路"——循环推理 + 行动 + 观察。

### 关键代码：agent_loop

**用途**：LLM 与工具的循环调用闭环。

```python
def agent_loop(messages):
    while True:
        response = send_messages(messages)

        if response.choices[0].message.tool_calls is not None:
            messages.append(response.choices[0].message)

            for tool_call in response.choices[0].message.tool_calls:
                arguments_dict = json.loads(tool_call.function.arguments)

                if tool_call.function.name == "run_bash":
                    result = run_bash(arguments_dict["command"])

                messages.append({
                    "role": "tool",
                    "content": result,
                    "tool_call_id": tool_call.id,
                })
        else:
            break
```

**核心机制**：while True 循环直到 LLM 不再调用工具 → 自动终止。

### 6.1.3 终端交互界面

```python
import os

if __name__ == "__main__":
    history = [{
        "role": "system",
        "content": f"你是在 {os.getcwd()} 目录下的编程代理。使用 bash 来完成任务，直接行动，不要解释。"
    }]

    while True:
        try:
            query = input("\033[36mmy-coder> \033[0m")
        except (EOFError, KeyboardInterrupt):
            break

        if query.strip().lower() in ("exit", "quit"):
            break

        history.append({"role": "user", "content": query})
        agent_loop(history)

        response_content = history[-1].content if hasattr(history[-1], "content") else history[-1]["content"]
        print(response_content)
```

**关键设计**：
- `\033[36m` ANSI 转义码：青色高亮提示符
- `os.getcwd()` 动态注入：让 LLM 知道工作目录
- 异常处理：Ctrl+C / Ctrl+D 安全退出

---

## 6.2 上下文工程：SubAgent + Skills + Compact

### 6.2.1 SubAgent：子任务委派

**核心思想**：把复杂任务**委派给独立的子 Agent**，避免污染主 Agent 上下文。

### 关键代码：SubAgent 工具

**用途**：在主 Agent 中调用子 Agent 执行子任务。

```python
SUB_AGENT_PROMPT = """
你是 coder 子 Agent。
接收主 Agent 的任务描述，独立完成代码编写与测试。
最终输出：完成的代码 + 简要说明。
"""

def call_sub_agent(task_description: str) -> str:
    sub_messages = [
        {"role": "system", "content": SUB_AGENT_PROMPT},
        {"role": "user", "content": task_description},
    ]

    return agent_loop(sub_messages)
```

**SubAgent 核心优势**：
- **上下文隔离**：主 Agent 不被中间过程污染
- **聚焦**：子 Agent 只关心当前任务
- **可复用**：相同 SubAgent 可被多个主 Agent 调用

### 6.2.2 Skills：按需加载

**核心思想**：第 5 章的 Skills 实现 —— L1 标签 / L2 文档 / L3 资源。

### 关键代码：SkillLoader 集成到 Agent Loop

**用途**：让主 Agent 在需要时调用 load_skills 工具加载 Skill。

```python
SKILL_LOADER = SkillLoader(Path("./skills"))

if __name__ == "__main__":
    history = [{
        "role": "system",
        "content": f"""
你是在 {os.getcwd()} 目录下的编程代理。
在处理不熟悉的话题之前，先使用 load_skills 获取相关的专业知识。
可用 Skills：
{SKILL_LOADER.get_descriptions()}
"""
    }]

    while True:
        query = input("\033[36mmy-coder> \033[0m")
        if query.strip().lower() in ("exit", "quit"):
            break

        history.append({"role": "user", "content": query})
        agent_loop(history)
```

**关键设计**：`get_descriptions()` 把 L1 标签注入系统提示词，触发 LLM 主动加载。

### 6.2.3 Compact：上下文压缩

**核心思想**：当对话历史变长，**主动压缩**为关键事实，避免 Token 爆表。

### 关键代码：Compact 工具实现

**用途**：把当前 messages 压缩为关键事实摘要。

```python
COMPACT_PROMPT = """
请将以下对话历史压缩为关键事实摘要，保留：
1. 已完成的工作
2. 待完成的任务
3. 关键决策点
4. 重要的中间结果

对话历史：
{messages_text}
"""

def compact(messages: list) -> str:
    messages_text = "\n".join([
        f"[{m.get('role', m.get('name', '?'))}] {m.get('content', '')}"
        for m in messages
    ])

    prompt = COMPACT_PROMPT.format(messages_text=messages_text)
    response = send_messages([{"role": "user", "content": prompt}])
    return response.choices[0].message.content

def should_compact(messages: list, max_tokens: int = 100000) -> bool:
    total_tokens = sum(
        len(m.get("content", "")) for m in messages
    ) // 4
    return total_tokens > max_tokens
```

**3 个核心设计**：

| # | 设计 | 作用 |
|---|------|------|
| 1 | `COMPACT_PROMPT` 4 维度 | 显式引导 LLM 保留关键信息 |
| 2 | `compact()` 函数 | 一键压缩当前对话历史 |
| 3 | `should_compact()` 阈值检测 | Token 超过 100 000 自动触发 |

**集成到 Agent Loop**：

```python
def agent_loop(messages):
    while True:
        if should_compact(messages):
            summary = compact(messages)
            messages = [
                {"role": "system", "content": f"对话历史摘要：{summary}"}
            ]

        response = send_messages(messages)
        ...
```

---

## 6.3 持久化与异步：解决上下文与性能问题

### 6.3.1 Compact 机制深入

**触发式压缩 vs 自动压缩**：

| 策略 | 触发条件 | 优势 | 劣势 |
|------|----------|------|------|
| **触发式** | LLM 主动调用 `compact` 工具 | 灵活控制 | 依赖 LLM 决策 |
| **自动** | Token 超过阈值 | 自动化 | 可能丢失上下文 |

**Claude Code 实践**：两者结合——LLM 可主动调 `compact`，框架也提供自动阈值检测。

### 6.3.2 持久化任务管理

**核心痛点**：复杂任务跨越多次对话，需要**持久化任务状态**。

### 关键代码：TaskManager 类

**用途**：JSON 文件持久化 + 任务依赖图管理。

```python
import json
from pathlib import Path
from typing import Optional, List

class TaskManager:
    def __init__(self, dir: str = "./tasks"):
        self.dir = Path(dir)
        self.dir.mkdir(exist_ok=True)
        self.config = self.dir / "config.json"

        if self.config.exists():
            self.config_data = json.loads(self.config.read_text())
        else:
            self.config_data = {"tasks": []}
            self._save()

    def _save(self):
        self.config.write_text(json.dumps(self.config_data, indent=2, ensure_ascii=False))

    def create(self, subject: str, description: str = "", blocked_by: List[int] = None) -> str:
        task_id = len(self.config_data["tasks"]) + 1
        task = {
            "id": task_id,
            "subject": subject,
            "description": description,
            "status": "pending",
            "blockedBy": blocked_by or [],
            "blocks": [],
        }
        self.config_data["tasks"].append(task)
        self._save()
        return f"Created task #{task_id}: {subject}"

    def update(self, task_id: int, status: str = None) -> str:
        for task in self.config_data["tasks"]:
            if task["id"] == task_id:
                if status:
                    task["status"] = status
                self._save()
                return f"Updated task #{task_id} → {status}"
        return f"Error: Task #{task_id} not found"

    def list_all(self) -> str:
        return json.dumps(self.config_data["tasks"], indent=2, ensure_ascii=False)
```

**5 大核心方法**：

| 方法 | 作用 |
|------|------|
| `__init__` | 初始化 / 读取或创建 config.json |
| `_save` | 持久化到磁盘 |
| `create` | 创建任务 + 依赖关系（blockedBy） |
| `update` | 更新任务状态 |
| `list_all` | 列出所有任务（含依赖图） |

**集成到 Agent Loop**（4 个工具）：

```python
TASKS = TaskManager()

elif tool_call.function.name == "task_create":
    result = TASKS.create(
        arguments_dict["subject"],
        arguments_dict.get("description", ""),
        arguments_dict.get("blockedBy"),
    )
elif tool_call.function.name == "task_update":
    result = TASKS.update(
        arguments_dict["task_id"],
        arguments_dict.get("status"),
    )
elif tool_call.function.name == "task_list":
    result = TASKS.list_all()
elif tool_call.function.name == "task_get":
    result = TASKS.get(arguments_dict["task_id"])
```

**系统提示词触发**：

```text
你是在 {WORKDIR} 目录下的 Code Agent。
在执行任务的过程中，必须使用 task_create, task_update, task_list, task_get 工具来规划和跟踪工作。
首次执行任务必须使用 task_create 进行任务的创建。
```

### 6.3.3 后台任务：慢操作交给后台运行

**核心痛点**：耗时任务（如 `sleep 5` / `npm install`）阻塞主线程。

### 关键代码：BackgroundManager 类

**用途**：多线程 + 通知队列管理后台任务。

```python
import threading
import subprocess
import uuid
import time
from pathlib import Path

class BackgroundManager:
    def __init__(self, dir: str = "./bg_tasks"):
        self.dir = Path(dir)
        self.dir.mkdir(exist_ok=True)
        self.tasks = {}
        self._notification_queue = []
        self._lock = threading.Lock()

    def run(self, command: str) -> str:
        task_id = str(uuid.uuid4())[:8]
        self.tasks[task_id] = {"status": "running", "result": None, "command": command}

        thread = threading.Thread(
            target=self._execute,
            args=(task_id, command),
            daemon=True,
        )
        thread.start()
        return f"Background task {task_id} started: {command[:80]}"

    def _execute(self, task_id: str, command: str):
        try:
            r = subprocess.run(
                command,
                shell=True,
                cwd=os.getcwd(),
                capture_output=True,
                text=True,
                timeout=300,
            )
            output = (r.stdout + r.stderr).strip()[:50000]
            status = "completed"
        except subprocess.TimeoutExpired:
            output = "Error: Timeout(300s)"
            status = "timeout"
        except Exception as e:
            output = f"Error: {e}"
            status = "error"

        self.tasks[task_id]["status"] = status
        self.tasks[task_id]["result"] = output or "(no output)"

        with self._lock:
            self._notification_queue.append({
                "task_id": task_id,
                "status": status,
                "command": command[:80],
                "result": (output or "(no output)")[:500],
            })

    def drain_notifications(self) -> list:
        with self._lock:
            notifs = list(self._notification_queue)
            self._notification_queue.clear()
            return notifs

    def check(self, task_id: str = None) -> str:
        if task_id:
            t = self.tasks.get(task_id)
            if not t:
                return f"Error: Unknown task {task_id}"
            return f"[{t['status']}] {t['command'][:60]}\n{t.get('result') or '(running)'}"

        lines = []
        for tid, t in self.tasks.items():
            lines.append(f"{tid}: [{t['status']}] {t['command'][:60]}")
        return "\n".join(lines) if lines else "No background tasks."
```

**5 个核心方法 + 4 个设计亮点**：

| 方法 | 作用 |
|------|------|
| `run()` | 启动后台线程（daemon=True 防止僵尸） |
| `_execute()` | 子进程执行 + 5 分钟超时 + 输出截断 |
| `drain_notifications()` | 线程安全地取出通知队列 |
| `check()` | 查询单个任务或列出所有 |
| `_lock` | 保护 `_notification_queue` 共享资源 |

**集成到 Agent Loop**：

```python
BG = BackgroundManager()

def agent_loop(messages):
    while True:
        notifs = BG.drain_notifications()
        if notifs and messages:
            notif_text = "\n".join(
                f"[bg:{n['task_id']}] {n['status']}: {n['result']}" for n in notifs
            )
            messages.append({
                "role": "user",
                "content": f"<background-results>\n{notif_text}\n</background-results>"
            })
            messages.append({"role": "assistant", "content": "Noted background results."})

        response = send_messages(messages)
        ...
```

**测试场景**：

```text
在后台运行 "sleep 5 && echo done"，然后在它运行时创建一个文件。
```

**测试结果**：
- 主线程**立即**响应后续指令（创建文件）
- 后台 `sleep 5` 完成后通过通知队列反馈
- 两者**并行运行且互不阻塞**

---

## 6.4 多 Agent 系统：Agent Teams

**核心思想**：多个**长期驻留**的 Agent 协作 —— **SubAgent 是短命任务委派，Agent Teams 是持久化团队**。

**SubAgent vs Agent Teams 核心差异**：

| 维度 | SubAgent | Agent Teams |
|------|----------|-------------|
| **生命周期** | 单轮任务，结束即销毁 | 长期驻留，跨会话存活 |
| **通信** | 仅与主 Agent 单向委派 | 队友之间**直接双向通信** |
| **持久化** | 不持久化 | config.json 持久化状态 |
| **适用** | 简单子任务 | 复杂跨域任务 |

### 6.4.1 团队管理类实现

**config.json 结构**：

```json
{
  "team_name": "default",
  "members": [
    {
      "name": "",
      "role": "",
      "status": "idle"
    }
  ]
}
```

**3 种状态**：`idle`（空闲）/ `shutdown`（已关闭）/ `working`（工作中）

### 关键代码：TeammateManager 类

**用途**：管理团队成员的生命周期 + 状态持久化 + 线程调度。

```python
import json
import threading
from pathlib import Path

class TeammateManager:
    def __init__(self, dir: str = "./team"):
        self.dir = Path(dir)
        self.dir.mkdir(exist_ok=True)
        self.config_path = self.dir / "config.json"
        self.threads = {}

        if self.config_path.exists():
            self.config = json.loads(self.config_path.read_text())
        else:
            self.config = {"team_name": "default", "members": []}
            self._save_config()

    def _save_config(self):
        self.config_path.write_text(
            json.dumps(self.config, indent=2, ensure_ascii=False)
        )

    def _find_member(self, name: str):
        for m in self.config["members"]:
            if m["name"] == name:
                return m
        return None

    def spawn(self, name: str, role: str, prompt: str) -> str:
        member = self._find_member(name)

        if member:
            if member["status"] not in ("idle", "shutdown"):
                return f"Error: {name} is currently {member['status']}"
            member["status"] = "working"
            member["role"] = role
        else:
            member = {"name": name, "role": role, "status": "working"}
            self.config["members"].append(member)

        self._save_config()

        thread = threading.Thread(
            target=self._teammate_loop,
            args=(name, role, prompt),
            daemon=True,
        )
        self.threads[name] = thread
        thread.start()

        if prompt:
            BUS.send("lead", name, f"Your initial task: {prompt}", "message")
        return f"Spawned {name} (role: {role})"
```

**3 大核心逻辑**：

| # | 逻辑 | 作用 |
|---|------|------|
| 1 | 复用 vs 新建 | 找到同名成员则复用，否则新建 |
| 2 | 状态判断 | 仅 `idle` / `shutdown` 状态可被重新激活 |
| 3 | 守护线程 | `daemon=True` 主进程退出时自动终止 |

### 6.4.2 通信总线实现

**邮箱模式**：每个 Agent 一个 `{name}.jsonl` 收件箱文件。

### 关键代码：Bus 类

**用途**：实现 Agent 间的点对点通信 + 广播。

```python
import json
import time
from pathlib import Path

VALID_MSG_TYPES = {"message", "broadcast", "shutdown", "result"}

class Bus:
    def __init__(self, dir: str = "./inbox"):
        self.dir = Path(dir)
        self.dir.mkdir(exist_ok=True)

    def send(self, sender: str, to: str, content: str,
             msg_type: str = "message", extra: dict = None) -> str:
        if msg_type not in VALID_MSG_TYPES:
            return f"Error: Invalid type '{msg_type}'. Valid: {VALID_MSG_TYPES}"

        msg = {
            "type": msg_type,
            "from": sender,
            "content": content,
            "timestamp": time.time(),
        }
        if extra:
            msg.update(extra)

        inbox_path = self.dir / f"{to}.jsonl"
        with open(inbox_path, "a") as f:
            f.write(json.dumps(msg) + "\n")

        return f"Sent {msg_type} to {to}"

    def read_inbox(self, name: str) -> list:
        inbox_path = self.dir / f"{name}.jsonl"
        if not inbox_path.exists():
            return []

        messages = []
        for line in inbox_path.read_text().strip().splitlines():
            if line:
                messages.append(json.loads(line))

        inbox_path.write_text("")
        return messages

    def broadcast(self, sender: str, content: str, teammates: list) -> str:
        count = 0
        for name in teammates:
            if name != sender:
                self.send(sender, name, content, "broadcast")
                count += 1
        return f"Broadcast to {count} teammates"
```

**4 大设计亮点**：

| # | 设计 | 作用 |
|---|------|------|
| 1 | JSONL 格式 | 每条消息独立，追加写不覆盖 |
| 2 | 消费即删除 | `write_text("")` 实现消息一次性消费 |
| 3 | 4 种消息类型 | message / broadcast / shutdown / result |
| 4 | 广播排除自己 | 防止发件人收到自己的消息 |

### 6.4.3 为队友的 Agent Loop 增加工具调用

```python
if tool_name == "send_message":
    return BUS.send(sender, args["to"], args["content"], args.get("msg_type", "message"))
elif tool_name == "read_inbox":
    return json.dumps(BUS.read_inbox(sender), indent=2)
```

### 6.4.4 修改主 Agent 的 Agent Loop 逻辑

**关键升级**：

```python
while True:
    msgs = BUS.read_inbox("lead")
    if msgs:
        for m in msgs:
            messages.append({
                "role": "user",
                "content": f"<inbox from={m['from']}>{m['content']}</inbox>"
            })
            messages.append({"role": "assistant", "content": "Noted."})
    ...
```

**核心机制**：每轮先检查主 Agent 收件箱，确保**及时响应队友消息**。

---

## 横向对比：Harness 三层架构

| 层级 | 核心组件 | 解决问题 | 性能影响 |
|------|----------|----------|----------|
| **执行层** | Agent Loop + Bash + Read/Write/Edit | 工具调用闭环 | 同步阻塞 |
| **协作层** | SubAgent + Skills + Compact | 任务隔离 + 知识按需 | 内存 + 线程 |
| **系统层** | TaskManager + BackgroundManager + TeammateManager | 持久化 + 异步 + 多 Agent | 文件 + 进程 |

---

## 工程踩坑清单

| 坑 | 表现 | 解法 |
|----|------|------|
| **危险命令未拦截** | LLM 误执行 `rm -rf /` | `DANGEROUS_PATTERNS` 黑名单 |
| **输出未截断** | 1GB 日志撑爆上下文 | `[:50000]` 强制截断 |
| **超时未设置** | `sleep 200` 永久阻塞 | `timeout=120` |
| **SubAgent 上下文污染** | 主 Agent 被中间过程淹没 | 独立 sub_messages |
| **Skills scripts 进 LLM** | 代码塞进上下文 | 由 Bash 执行，**仅返回结果** |
| **Compact 信息丢失** | 关键事实被压缩掉 | 4 维度提示词（已完成 / 待办 / 决策 / 结果） |
| **TaskManager 文件未保存** | 跨会话任务丢失 | `_save()` 每次变更立即持久化 |
| **BackgroundManager 僵尸线程** | 主进程退出后线程残留 | `daemon=True` |
| **Agent Teams 通信死锁** | 队友互相等待 | 邮箱异步 + 消费即删除 |

---

## 全章知识地图

```
第6章 Harness 工程实践
│
├── 6.1 Agent Loop
│   ├── run_bash 工具（4 重安全保护）
│   ├── agent_loop 主循环
│   └── 终端交互界面（ANSI 高亮）
│
├── 6.2 上下文工程
│   ├── 6.2.1 SubAgent（子任务委派）
│   ├── 6.2.2 Skills（按需加载）
│   └── 6.2.3 Compact（上下文压缩）
│
├── 6.3 持久化与异步
│   ├── 6.3.1 Compact 机制深入
│   ├── 6.3.2 TaskManager（持久化任务）
│   └── 6.3.3 BackgroundManager（后台任务）
│
└── 6.4 多 Agent 系统
    ├── 6.4.1 TeammateManager（团队管理）
    ├── 6.4.2 Bus（通信总线）
    ├── 6.4.3 队友 Agent Loop
    └── 6.4.4 主 Agent Loop 升级
```

---

## 贯穿主线

> **Harness 的本质 = 复现 Claude Code 的工程化能力**
>
> 从 **Agent Loop**（基座）→ **SubAgent + Skills + Compact**（协作）→ **TaskManager + BackgroundManager + Teammates**（系统）
>
> **关键洞察**：**LLM 之间的能力差距在缩小，但 Harness 之间的差距在拉大**

---

## 学习路径建议

| 阶段 | 必学 | 推荐时长 |
|------|------|----------|
| 入门 | Agent Loop + run_bash | 1-2 天 |
| 进阶 | SubAgent + Skills + Compact | 3-5 天 |
| 高级 | TaskManager + BackgroundManager | 1 周 |
| 实战 | Agent Teams 完整系统 | 2 周 |
| 专家 | 与 LangGraph / AutoGen 框架融合 | 1-2 月 |

---

## 生产化 3 维度增强

1. **执行层**：集成 LangGraph 实现可视化 + Checkpoint 机制
2. **协作层**：SubAgent + Skills 加上权限隔离（按角色加载）
3. **系统层**：迁移到 Kubernetes，实现 Agent 弹性扩缩容
