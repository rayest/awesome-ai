# Harness 实战 · 口播文案稿

> 适用场景：AI 技术博主 / 公众号 / 课程
> 预计时长：约 10 分钟
> 建议语速：220~250 字/分钟
> 阅读对象：Agent 开发者、AI 工程师

---

## 【开场钩子 · 30 秒】

你有没有过这种经历？

第 1-5 章我们学了 AI Agent 的五大能力——但你**会用 Claude Code**，不等于**能造一个 Claude Code**。

第五章学的 Skills 是个抽象概念。怎么把它落到代码？怎么用 Agent Loop 串起来？

好，本章我们就**从零造一辆车**——亲手复现 Claude Code 的核心设计模式。

## 【核心比喻开场 · 60 秒】

我打一个比方。

**第 1-5 章** = 学开车——你理解了引擎、变速箱、刹车的工作原理。

**第 6 章** = 从零造一辆车——亲手把引擎、变速箱、刹车组装成一台完整的 Claude Code。

核心：**从理论到工程化复现**——把"用 Claude Code"变成"自己造一个 Claude Code"。

好，我们正式进入第六章。

## 【第一节 · Agent Loop 基座 · 90 秒】

所有 Agent 的基座是 **Agent Loop**——LLM + 工具的循环调用闭环。

来，我们看最核心的 **Bash 工具**：

```python
DANGEROUS_PATTERNS = ["rm -rf /", "sudo", "mkfs", "dd if=/dev/zero"]

def run_bash(command: str) -> str:
    for pattern in DANGEROUS_PATTERNS:
        if pattern in command:
            return f"Error: Dangerous command '{pattern}' blocked"
    ...
```

4 重安全保护：
1. **危险命令黑名单**——拦截 `rm -rf /` 等高危指令
2. **`shell=True`**——支持复杂 Shell 语法
3. **`timeout=120`**——防止 sleep 200 永久阻塞
4. **输出截断 50000 字符**——防止超长日志撑爆上下文

`Agent Loop` 主循环更简单：

```python
while True:
    response = send_messages(messages)
    if response.tool_calls:
        # 调用工具 + 追加到历史
    else:
        break
```

**关键机制**：while True 循环直到 LLM 不再调用工具 → 自动终止。

## 【第二节 · 上下文工程三件套 · 90 秒】

基座有了，要解决"上下文爆炸"问题——三件套：

**SubAgent（子任务委派）**——把复杂任务**委派给独立子 Agent**，避免污染主上下文。

**Skills（按需加载）**——第 5 章学的 Skills 落地——L1 标签 / L2 文档 / L3 资源。

**Compact（压缩）**——当对话历史变长，**主动压缩**为关键事实。

来，看 Compact 怎么实现：

```python
COMPACT_PROMPT = """
请将以下对话历史压缩为关键事实摘要，保留：
1. 已完成的工作
2. 待完成的任务
3. 关键决策点
4. 重要的中间结果
"""

def should_compact(messages, max_tokens=100000) -> bool:
    return total_tokens > max_tokens
```

**4 维度提示词**显式引导 LLM 保留关键信息；**阈值检测**自动触发压缩——Token 超过 100 000 就压缩。

集成到 Agent Loop：

```python
def agent_loop(messages):
    while True:
        if should_compact(messages):
            summary = compact(messages)
            messages = [{"role": "system", "content": f"对话历史摘要：{summary}"}]
        ...
```

## 【第三节 · 持久化与异步 · 90 秒】

接下来解决"性能问题"——持久化 + 异步两件套。

**TaskManager（持久化任务）**——JSON 文件保存任务状态，跨会话不丢失。

核心 4 工具：`task_create` / `task_update` / `task_list` / `task_get`——类似 TodoWrite 但持久化。

**BackgroundManager（后台任务）**——慢操作交给后台线程，不阻塞主线程。

来，看 `BackgroundManager.run()`：

```python
def run(self, command):
    task_id = str(uuid.uuid4())[:8]
    self.tasks[task_id] = {"status": "running", "result": None}

    thread = threading.Thread(
        target=self._execute,
        args=(task_id, command),
        daemon=True,   # 主进程退出自动终止
    )
    thread.start()
    return f"Background task {task_id} started"
```

**3 大核心机制**：
1. **守护线程** `daemon=True`——主进程退出时自动终止
2. **通知队列** + `Lock`——线程安全
3. **5 分钟超时**——防止后台任务永久挂起

**测试场景**："在后台运行 sleep 5，然后立即创建文件"——**主线程立即响应后台任务，5 秒后通过通知队列反馈**。

## 【第四节 · 多 Agent 协作：Agent Teams · 90 秒】

最后是多 Agent 系统——**Agent Teams**。

**SubAgent vs Agent Teams 核心差异**：

| 维度 | SubAgent | Agent Teams |
|------|----------|-------------|
| 生命周期 | 单轮任务 | 长期驻留 |
| 通信 | 仅主 Agent 单向 | 队友之间**双向** |
| 持久化 | 不持久化 | config.json 持久化 |

**4 大核心组件**：

**1. TeammateManager**——管理团队成员的生命周期：

```python
def spawn(self, name, role, prompt):
    member = self._find_member(name)
    if member:
        # 复用 idle/shutdown 状态的成员
    else:
        # 新建
```

**2. Bus（通信总线）**——邮箱模式，每个 Agent 一个 `{name}.jsonl`：

```python
def send(self, sender, to, content, msg_type="message"):
    msg = {"type": msg_type, "from": sender, "content": content, "timestamp": time.time()}
    inbox_path = self.dir / f"{to}.jsonl"
    with open(inbox_path, "a") as f:
        f.write(json.dumps(msg) + "\n")
```

**3. 队友 Agent Loop**——增加 `send_message` / `read_inbox` 工具。

**4. 主 Agent Loop 升级**——每轮先检查收件箱：

```python
while True:
    msgs = BUS.read_inbox("lead")
    if msgs:
        for m in msgs:
            messages.append({
                "role": "user",
                "content": f"<inbox from={m['from']}>{m['content']}</inbox>"
            })
```

**4 大设计亮点**：
1. **JSONL 格式**——每条消息独立，追加写不覆盖
2. **消费即删除**——`write_text("")` 实现消息一次性消费
3. **4 种消息类型**——message / broadcast / shutdown / result
4. **广播排除自己**——防止发件人收到自己的消息

## 【决策树 · 60 秒】

来，给个选型决策树：

你需要什么能力？
- **基础工具调用** → Agent Loop + run_bash
- **复杂任务隔离** → + SubAgent
- **跨场景复用** → + Skills
- **长任务管理** → + Compact
- **跨会话工作流** → + TaskManager
- **慢操作并行** → + BackgroundManager
- **复杂跨域任务** → + Agent Teams

## 【踩坑提醒 · 60 秒】

最后几个工程坑：

1. **危险命令未拦截**——LLM 误执行 `rm -rf /`，DANGEROUS_PATTERNS 黑名单必须
2. **输出未截断**——1GB 日志撑爆上下文，强制 50000 字符截断
3. **超时未设置**——`sleep 200` 永久阻塞，必须 `timeout=120`
4. **SubAgent 上下文污染**——必须用独立 sub_messages
5. **Compact 信息丢失**——4 维度提示词（已完成 / 待办 / 决策 / 结果）
6. **TaskManager 文件未保存**——`_save()` 每次变更立即持久化
7. **BackgroundManager 僵尸线程**——`daemon=True`
8. **Agent Teams 通信死锁**——邮箱异步 + 消费即删除

## 【收尾 · 30 秒】

总结一句话：

**Harness 的本质 = 复现 Claude Code 的工程化能力**。

从 **Agent Loop**（基座）→ **SubAgent + Skills + Compact**（协作）→ **TaskManager + BackgroundManager + Teammates**（系统）。

**关键洞察**：**LLM 之间的能力差距在缩小，但 Harness 之间的差距在拉大**。

掌握了这三章，你已经具备了**从理论到工程化复现**的完整能力。

下一期，我们讲**结语**——AI Agent 的未来趋势与生态全景。

我们下期见。

## 【播报备注】

- **总字数**：约 2200 字
- **预计时长**：9~10 分钟（220~250 字/分钟）
- **停顿点**：
  - 开场钩子后停 1 秒
  - 4 重安全保护每条后停 0.5 秒
  - 4 维度提示词前后各停 1 秒
  - SubAgent vs Agent Teams 对比后停 1 秒
  - 决策树前后各停 1 秒
- **重音词**：Agent Loop / run_bash / SubAgent / Skills / Compact / TaskManager / BackgroundManager / Agent Teams
- **B-roll 建议**：
  - 学车 vs 造车：5 个零件 → 组装成完整汽车
  - Agent Loop 闭环：while True 流程图
  - 4 重安全保护：4 把锁包围 run_bash
  - 3 件套：SubAgent + Skills + Compact
  - 邮箱通信：每个 Agent 一个邮箱
- **章节标记**：4 节主体 + 决策树 + 踩坑 + 收尾
