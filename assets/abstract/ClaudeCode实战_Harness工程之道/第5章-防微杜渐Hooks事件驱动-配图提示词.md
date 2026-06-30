# 防微杜渐：Hooks 事件驱动自动化 · 配图提示词

> 用途：配套第 5 章深度解读的配图素材
> 图片总数：12 张
> 生成地址：`https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt={URL编码}&image_size={尺寸}`
> 可用尺寸：landscape_16_9 / portrait_4_3 / square_hd / landscape_4_3

---

## 图片 1：策略 vs 机制（封面）

**尺寸**：landscape_16_9
**提示词**：
```
A cinematic split-screen editorial illustration. Left side labeled "策略 Policy 软约束 Soft Constraint" (Policy / Soft Constraint): a road with traffic signs showing speed limit 60 and warning signs, but cars (labeled "CLAUDE.md", "Skills", "子智能体") are visibly ignoring the signs and zooming past, illustrating reliance on voluntary compliance. Right side labeled "机制 Mechanism 硬约束 Hard Constraint" (Mechanism / Hard Constraint): the same road with a concrete barrier and speed bumps physically blocking fast-moving cars labeled "Hooks 物理拦截". A central dividing line shows the two approaches. Color palette: left side warm yellows (#FCD34D) and grays for the ignored signs, right side cool blues (#1E3A8A) and reds (#DC2626) for the imposing barrier. Cinematic lighting, photorealistic style, sharp typography overlay in Chinese and English, 4K detail, aspect ratio 16:9.
```

---

## 图片 2：17 个事件全景图

**尺寸**：landscape_16_9
**提示词**：
```
A clean infographic showing 17 Claude Code event nodes organized into 5 categories, arranged in a circular layout. Category 1 "会话级 Session Level" (3 events): SessionStart, SessionEnd, PreCompact. Category 2 "工具调用 Tool Call" (5 events): PreToolUse, PostToolUse, PostToolUseFailure, PermissionRequest, UserPromptSubmit. Category 3 "子智能体 Subagent" (2 events): SubagentStart, SubagentStop. Category 4 "完成 Completion" (2 events): Stop, Notification. Category 5 "较新 Newer" (5 events): TeammateIdle, TaskCompleted, ConfigChange, WorktreeCreate, WorktreeRemove. Each event node has a small icon: red shield for blocking events, green eye for read-only events. Background: dark navy (#0D1B2A). Color coding by category: blue/teal/green/amber/coral. Flat design, clean modern infographic, bilingual Chinese-English labels, 4K detail, aspect ratio 16:9.
```

---

## 图片 3：3 种处理器类型 - 确定性阶梯

**尺寸**：landscape_16_9
**提示词**：
```
A clean editorial infographic showing a 3-step staircase ascending from left to right, representing the "确定性递减 灵活性递增 Determinism Decreasing, Flexibility Increasing" ladder. Step 1 "command 类型" (Command Type): small, solid, gray concrete block labeled with a gear icon and "≈ 0.1s". Step 2 "prompt 类型" (Prompt Type): medium block with a brain/lightning icon and "≈ 2s". Step 3 "agent 类型" (Agent Type): large block with a multi-armed robot icon and "≈ 30s". Each step has a vertical bar showing the trade-off. Below the staircase, a quote: "能用 command 不用 prompt，能用 prompt 不用 agent". Color palette: cool grays at the base, transitioning to warm oranges and reds at the top to indicate increasing risk. White background, modern flat design, technical illustration aesthetic, sharp Chinese typography, 4K detail, aspect ratio 16:9.
```

---

## 图片 4：6 层配置位置 - 优先级金字塔

**尺寸**：landscape_16_9
**提示词**：
```
A 6-tier pyramid infographic showing the Hook configuration hierarchy. From top (highest priority) to bottom (lowest): Tier 1 "企业策略 managed-settings.json" with crown icon. Tier 2 "项目配置 .claude/settings.json" with team icon. Tier 3 "项目本地 .claude/settings.local.json" with personal computer icon. Tier 4 "用户全局 ~/.claude/settings.json" with house icon. Tier 5 "插件内 hooks/hooks.json" with plug icon. Tier 6 "智能体 Frontmatter" with robot icon. Each tier has a distinct color from a gradient: deep red at the top transitioning through orange, yellow, green, blue, to purple at the bottom. Background: clean white. Sharp typography labels, modern flat design, bilingual Chinese-English, 4K detail, aspect ratio 16:9.
```

---

## 图片 5：安全防护 3 道防线 - 机场安检

**尺寸**：landscape_16_9
**提示词**：
```
A cinematic top-down view of a high-tech airport security checkpoint with three sequential gates. Gate 1 "PreToolUse 危险命令拦截" (Dangerous Command Blocking): a robotic X-ray scanner inspecting luggage labeled with "rm -rf", "git push --force", "DROP DATABASE" — flagged items glow red and are stopped. Gate 2 "PreToolUse 敏感文件保护" (Sensitive File Protection): a second scanner with laser beams protecting files labeled ".env", "credentials.json", "id_rsa" — these glow gold and are blocked. Gate 3 "PostToolUse 全量操作审计" (Full Operation Audit): a final logging station writing everything to a digital audit log with timestamp "2024-01-15 09:23:45". A person labeled "Claude 决策" walks through the gates, but dangerous items are systematically stopped. Color palette: cool steel blue (#1E3A5F) base, warning amber (#F59E0B), success green (#10B981), alert red (#DC2626). High-tech aesthetic, 4K detail, aspect ratio 16:9.
```

---

## 图片 6：hookSpecificOutput 通信协议

**尺寸**：landscape_16_9
**提示词**：
```
A technical diagram showing the communication protocol between a Hook script and Claude Code, visualized as two computer terminals connected by a glowing data pipe. Left terminal labeled "Hook Script (Bash/Python)" outputs JSON to stdout with the structure: `{"hookSpecificOutput": {"hookEventName": "PreToolUse", "permissionDecision": "deny", "permissionDecisionReason": "...", "additionalContext": "..."}}`. Right terminal labeled "Claude Code" receives this JSON and parses it. The glowing data pipe shows the flow of structured data, with small annotations: "permissionDecision: allow/deny/ask" and "additionalContext: 反馈给 Claude". Color palette: dark navy background (#0D1B2A), syntax-highlighted JSON in yellow/cyan/pink (typical code editor), glowing cyan pipe (#00D4FF), white annotation text. Technical schematic style, code-editor aesthetic, 4K detail, aspect ratio 16:9.
```

---

## 图片 7：PreToolUse updatedInput 静默修改

**尺寸**：landscape_16_9
**提示词**：
```
A technical sequence diagram showing the PreToolUse "updatedInput" flow as a 3-step process. Step 1: A script labeled "Claude Decision" attempts to execute "rm -r /tmp/test" (a dangerous command). Step 2: An icon labeled "PreToolUse Hook" intercepts the command at the system layer, with arrows showing the interception mechanism. Step 3: The hook silently modifies the input to "rm -r /tmp/test --dry-run" (a safer version), and the safer version proceeds to execution. The original dangerous command is shown crossed out in red, while the modified safe version is highlighted in green. Background: clean white with subtle blueprint grid. Color palette: red (#DC2626) for blocked, green (#10B981) for allowed, blue (#3B82F6) for the hook. Technical sequence diagram aesthetic, modern flat design, 4K detail, aspect ratio 16:9.
```

---

## 图片 8：Stop Hook 质量门控

**尺寸**：landscape_16_9
**提示词**：
```
A factory quality control gate illustration. A conveyor belt labeled "Claude 任务输出" carries a glowing product box labeled "代码 + 测试" toward a checkpoint. The checkpoint has a large sign reading "Stop Hook 质量门控" with three colored lights: red (test failed), green (test passed), yellow (no test framework detected). On the failed path, the box is rejected and a red arrow loops back to "修复 Fix → 重新测试 Retest". On the success path, the box exits through a green gate labeled "放行 Approve → 任务结束". A small "stop_hook_active" safety sensor is highlighted near the loop, with an annotation: "防止死循环 Prevent Infinite Loop". Color palette: industrial steel gray (#374151) base, warning red (#DC2626), success green (#10B981), caution yellow (#F59E0B), conveyor belt orange (#EA580C). Industrial infographic style, 4K detail, aspect ratio 16:9.
```

---

## 图片 9：3 层子智能体 Hooks 防护

**尺寸**：landscape_16_9
**提示词**：
```
A vertical 3-layer concentric shield diagram showing the three-layer protection mechanism for subagent Hooks. Outer layer "Frontmatter Hook" (内部自检 Internal Self-check): asks "我的输出是否完整？ Is my output complete?". Middle layer "SubagentStart Hook" (外部注入 External Injection): asks "给你必要的背景信息 Background context". Inner layer "SubagentStop Hook" (外部验收 External Verification): asks "你的工作成果是否达标？ Does your work meet standards?". A central "子智能体 Subagent" (robot icon) is protected by all three layers. Around the shield, various threats are shown being blocked: "注入风险", "输出不完整", "质量不达标". Color palette: deep blue shield (#1E3A8A), gold center (#F59E0B), red threats (#DC2626), white annotation text. Heraldic shield aesthetic meets modern cybersecurity, 4K detail, aspect ratio 16:9.
```

---

## 图片 10：异步 vs 同步 Hook 时序图

**尺寸**：landscape_16_9
**提示词**：
```
A side-by-side comparison diagram showing two swim lanes for "Sync Hook" (left) and "Async Hook" (right). Left lane (Sync): A timeline shows "Claude 主流程 Main Flow" waiting (paused indicator) while "Hook Script" runs from 0s to 30s, then main flow resumes. Total elapsed: 30s. Right lane (Async): The same timeline shows "Claude 主流程 Main Flow" continuing immediately at 0s while "Hook Script" runs in the background from 0s to 30s. Main flow doesn't wait. Total elapsed for main flow: 0s. A key insight annotation: "异步 Hook 无法阻止当前操作 Async hooks CANNOT block current operations". Color palette: dark navy background, sync lane in warm red/orange (blocking), async lane in cool blue/green (non-blocking). Timeline visualization style, technical illustration, 4K detail, aspect ratio 16:9.
```

---

## 图片 11：调试三板斧

**尺寸**：landscape_16_9
**提示词**：
```
A clean three-panel infographic showing the "三板斧 Three Debugging Axes" for Claude Hooks. Panel 1 "板斧 1 stderr 调试" (Axe 1: stderr Debugging): a terminal showing "echo 'DEBUG: ...' >&2" with the debugging output highlighted in yellow and the JSON output highlighted in green, clearly separated into two streams. Panel 2 "板斧 2 手动测试" (Axe 2: Manual Testing): a hand pressing a test button with code "echo '{...}' | ./.claude/hooks/test.sh", showing the simulated input being piped into the script. Panel 3 "板斧 3 --debug 模式" (Axe 3: --debug Mode): a Claude Code terminal showing the `--debug` flag and a detailed execution log with matched hooks, execution time, and return values. Color palette: dark mode terminal aesthetic with neon green (#10B981) for success, amber (#F59E0B) for warnings, white background for the infographic style. Three-panel layout, 4K detail, aspect ratio 16:9.
```

---

## 图片 12：工程方法论 - 三步走策略

**尺寸**：landscape_16_9
**提示词**：
```
A horizontal three-step journey map showing the engineering methodology "先观测后管控 Observe First, Control Later". Step 1 "第 1 步 PostToolUse 审计日志" (Step 1: Audit Log): a magnifying glass icon over a data stream, accumulating 1-2 weeks of real usage data. Step 2 "第 2 步 识别高风险模式" (Step 2: Identify High-Risk Patterns): a brain icon analyzing the data, with patterns emerging: "rm -rf", "DROP TABLE", "force push" highlighted in red. Step 3 "第 3 步 PreToolUse 拦截规则" (Step 3: Interception Rules): a shield icon blocking the identified patterns, with a "始终保留日志记录 Always Keep Logging" annotation as a permanent background layer. Each step has a duration label: "1-2 周" → "数日" → "持续". Color palette: light blue (#3B82F6) at the start, transitioning to amber (#F59E0B) at the middle, to confident green (#10B981) at the end. Journey map style with checkpoints, modern flat design, 4K detail, aspect ratio 16:9.
```

---

## 配套图片清单（汇总表格）

| # | 主题 | 对应章节 | 尺寸 | 信息密度重点 |
|---|------|---------|------|------------|
| 1 | 策略 vs 机制（封面） | 5.1 定位 | landscape_16_9 | 软约束 vs 硬约束的核心对比 |
| 2 | 17 个事件全景图 | 5.2 事件生命周期 | landscape_16_9 | 5 大类事件分类 + 阻止能力标注 |
| 3 | 3 种处理器 - 确定性阶梯 | 5.4 处理器类型 | landscape_16_9 | command/prompt/agent 速度与灵活性 |
| 4 | 6 层配置位置金字塔 | 5.3 配置体系 | landscape_16_9 | 优先级与作用域 |
| 5 | 安全防护 3 道防线 | 5.6 工程实战一 | landscape_16_9 | 危险命令拦截 / 敏感文件 / 全量审计 |
| 6 | hookSpecificOutput 通信协议 | 5.5 通信协议 | landscape_16_9 | JSON 协议结构 |
| 7 | PreToolUse updatedInput 静默修改 | 5.5.1 关键事件 | landscape_16_9 | dry-run 注入示例 |
| 8 | Stop Hook 质量门控 | 5.7.3 质量门控 | landscape_16_9 | 防止死循环 + 测试验收 |
| 9 | 3 层子智能体 Hooks 防护 | 5.8 子智能体 Hooks | landscape_16_9 | 自检/注入/验收三合一 |
| 10 | 异步 vs 同步 Hook 时序 | 5.9 异步 Hooks | landscape_16_9 | 阻止能力限制 |
| 11 | 调试三板斧 | 5.10 调试 | landscape_16_9 | stderr / 手动测试 / --debug |
| 12 | 工程方法论 - 三步走 | 5.11 设计方法论 | landscape_16_9 | 观察 → 识别 → 拦截 |

---

## 使用建议

1. **生成顺序**：先做封面（图片 1），再做核心架构（图片 2、3、4），最后做实战案例（图片 5-12）
2. **风格统一**：所有图片均采用深色背景 + 高对比度色彩块的现代编辑设计风格
3. **关键元素**：每张图必须包含 1~2 个视觉锚点（路障、安检门、3 道闸机、工厂质检、盾形徽章），让读者一眼能记住核心概念
4. **URL 编码提醒**：生成前需将提示词进行 URL 编码
5. **配图优先级**：如时间有限，优先生成 **图片 1（封面）、3（处理器阶梯）、5（3 道防线）、8（Stop 门控）、9（3 层防护）** 这 5 张，覆盖全章最核心概念
6. **避免堆砌**：每张图的文字标签不超过 8 个，复杂内容拆为多张图（如 17 事件全景图拆为 5 大类，每类一张）
