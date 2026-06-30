# 防微杜渐 · 口播文案稿

> 适用场景：技术学习者、AI Agent 开发者、关注 Claude Code 自动化能力的工程师
> 预计时长：10 分钟
> 建议语速：220~240 字/分钟
> 阅读对象：想让 Claude 不再依赖"自觉"而是系统级"强制"的工程师

---

## 【开场钩子 · 30 秒】

凌晨三点，小张疲惫中把 .env 文件推上去了——3 个环境的数据库连接串、API 密钥、支付网关测试账号全部泄露，整个团队耗费半天轮换密钥。CLAUDE.md 告诉 Claude「别提交密钥」——这是交通标志，靠自觉；Skills 教 Claude「提交前要检查」——这是驾驶手册，靠理解。**Hooks 则是物理路障**——当 Claude 试图执行 `rm -rf /` 时，PreToolUse Hook 在系统层直接阻断，决策被强制推翻。

## 【策略 vs 机制 · 60 秒】

这一章的核心是软件工程里特别重要的一对概念：**策略与机制的分离**。

策略是「应该怎么做」——靠 Prompt 引导、靠 Claude 自觉。CLAUDE.md、Skills、子智能体都在这一层，它们告诉 Claude 该做什么不该做什么。问题是，LLM 在理论上随时可以忽略这些建议。

机制是「一旦违反就被强制阻止」——靠系统层拦截。Hooks 是 Claude Code 扩展体系里**唯一**运行在系统执行层的机制。当 Claude 决定执行某个工具调用时，PreToolUse Hook 在工具实际执行之前触发，可以直接 deny 这个操作，让 Claude 的决策无法落地。

打个比方：交通标志说"限速 60"，这是策略；路障让你的车速上不了 120，这才是机制。**机制优于策略**——这正是 Hooks 的设计哲学。

## 【第一节 · 17 个事件全景 · 90 秒】

Claude Code 一共有 17 个事件，分成 5 大类。

第一类是**会话级事件**——3 个，SessionStart、SessionEnd、PreCompact，管理整个会话的生命周期。

第二类是**工具调用事件**——5 个，PreToolUse、PostToolUse、PostToolUseFailure、PermissionRequest、UserPromptSubmit。这是 Hooks 系统最核心的事件类别。

第三类是**子智能体事件**——2 个，SubagentStart 和 SubagentStop，配合上一章的子智能体使用。

第四类是**完成事件**——2 个，Stop 和 Notification。

第五类是**较新事件**——5 个，TeammateIdle、TaskCompleted、ConfigChange、WorktreeCreate、WorktreeRemove。

理解这 17 个事件的关键，不是死记硬背，而是抓住一个核心维度——**这个事件能不能阻止**。具备阻止能力的有 9 个：PreToolUse、PermissionRequest、UserPromptSubmit、Stop、SubagentStop、TeammateIdle、TaskCompleted、ConfigChange、WorktreeCreate。其余是只读模式，只能观察不能干预。

最常用的 3 个事件：PreToolUse 是工具执行前的"守门员"，PostToolUse 是工具执行后的"质量守卫"，Stop 是任务完成时的"质量门控"。先精通这 3 个，就能构建出健壮的自动化闭环。

## 【第二节 · 3 种处理器类型 · 90 秒】

Hook 处理器有 3 种类型，构成一个"确定性递减，灵活性递增"的阶梯。

第一种是 **command 类型**——执行 Shell 命令或脚本。最常用最可靠，0.1 秒就能返回结果。退出码 0 表示成功，系统解析 stdout 的 JSON 作为决策；退出码 2 表示"有意阻止"，stderr 内容会反馈给 Claude；其他退出码视为脚本异常，不阻断主流程。这套退出码设计很巧妙——它严格区分了"有意阻止"和"脚本故障"，正如烟雾报警器自身发生故障时，不应因此禁止人员进出大楼。

第二种是 **prompt 类型**——调用小模型（Haiku）做单次评估。当验证逻辑需要一定判断力但不需要执行多步操作时用，大约 2 秒。响应必须返回 `{ok: true/false, reason: "..."}` 这样的 JSON 格式。

第三种是 **agent 类型**——启动一个子智能体做多轮验证。当需要实际查看代码文件、执行搜索或多步操作时用，大约 30 秒。Agent 最多运行 50 轮对话后必须返回决策。

**选型原则**：能用 command 的不用 prompt，能用 prompt 的不用 agent。确定性规则在速度和可靠性上永远优于大模型判断。

## 【第三节 · 安全防护实战 · 90 秒】

本章用 3 道防线构建了一套完整的安全防护体系。

**第一道防线是 PreToolUse 危险命令拦截**。脚本会匹配 12 类危险模式：rm -rf、git push --force、DROP DATABASE、curl | sh、Fork bomb 等等。每一项拦截都附带清晰的原因说明。

**第二道防线是 PreToolUse 敏感文件保护**。匹配器配置为 Write|Edit，确保仅在文件写入时触发。三重检查：受保护目录（.git/、.ssh/、node_modules/）、受保护文件名（.env、credentials.json、id_rsa）、受保护扩展名（pem、key、p12、pfx）。任一命中即 deny。

**第三道防线是 PostToolUse 全量操作审计**。匹配器配置为 *，捕获所有工具调用，写入按日期归档的审计日志。在合规性要求严格的企业环境中，这是不可或缺的机制——它清晰回答了"Claude 在什么时间对什么目标执行了什么操作"。

3 道防线组合，构建了"**事前拦截 → 事中防护 → 事后审计**"的完整安全闭环，将原本依赖"人工谨慎"的脆弱流程，升级为"代码即法律"的自动化安全体系。

## 【第四节 · 代码质量自动化 · 80 秒】

第二组实战是用 Hooks 做代码质量自动化。

**PostToolUse 自动格式化**——每次 Claude 写入文件后，自动用 Prettier、Black、gofmt 格式化对应语言。脚本中引入了 command 进行环境检查，未安装就静默跳过，体现"优雅降级"的设计原则——Hook 自身的异常不应阻塞核心工作流。Claude 不需要感知项目用什么格式化规范，只需要专注于代码逻辑。

**PostToolUse Lint 反馈**——通过 additionalContext 把 Lint 结果反馈给 Claude，构建起"修改 → 检查 → 反馈 → 修复"的自动化闭环。

**Stop Hook 质量门控**——任务完成时自动跑测试，失败就阻止停止，强制 Claude 修复。**关键细节**：必须检查 `stop_hook_active` 字段防止死循环。如果不检查，Claude 会陷入"修复+测试失败+再修复"的死循环——这正是递归函数必须设定终止条件的同一道理。

## 【第五节 · 子智能体 Hooks · 90 秒】

Hooks 还有一种更精准的部署方式——直接在子智能体的 Frontmatter 里定义。

比如你有一个 db-reader 子智能体专门跑 SQL 查询，需要防范 SQL 注入风险。如果在全局 settings.json 配置 Hook，会无差别拦截所有 Bash 命令——编译代码、运行测试、安装依赖都会被牵连，不仅浪费性能还极易误拦截。

更优方案是在 db-reader 的 Frontmatter 里写 hooks 字段，配置 PreToolUse 拦截器。这样 Hook 随子智能体启动而激活，任务完成后自动清理，配置与子智能体定义集成于同一文件，可随 .md 文件一同分发。

3 层防护机制各有职责：Frontmatter Hook 负责内部自检——"我的输出是否完整"；SubagentStart Hook 负责外部注入——"给你必要的背景信息"；SubagentStop Hook 负责外部验收——"你的工作成果是否达标"。

## 【决策树 · 60 秒】

什么时候用哪种事件？

- 操作前要拦截 → `PreToolUse` / `UserPromptSubmit`
- 操作后要反馈 → `PostToolUse`
- 完成时要检查 → `Stop` / `SubagentStop`
- 生命周期管理 → `SessionStart` / `SessionEnd`

选哪种处理器？规则明确的用 command，需要语义判断的用 prompt，需要看代码多轮操作的用 agent。

在哪个层级配置？团队通用规范配置在 .claude/settings.json，个人偏好配置在 ~/.claude/settings.json，子智能体专属检查配置在 Frontmatter。

**工程方法论**：先配置 PostToolUse + matcher: * 的审计日志 Hook，观察 1~2 周真实运行数据；然后基于审计数据识别高风险模式，设计 PreToolUse 拦截规则；最后逐步收紧拦截规则，同时**始终保留日志记录功能**，确保发生误拦截时能快速定位问题。

## 【踩坑提醒 · 60 秒】

四个常见陷阱必须避开：

第一，**调试信息必须输出到 stderr**，stdout 严格保留给 JSON 决策结果。一旦调试 echo 污染了 stdout，JSON 解析会立即失败。

第二，**Shell 配置文件的 echo 也会污染 stdout**。如果你 ~/.zshrc 里有欢迎语输出，需要用 `[[ $- == *i* ]]` 条件判断包裹，确保仅在交互式 Shell 中执行。

第三，**直接编辑 settings.json 后 Hook 不会立即生效**，因为 Claude Code 仅在启动时捕获配置快照。必须在 /hooks 菜单确认变更或重启会话。

第四，**异步 Hook 不能用于安全检查**。async: true 让 Hook 后台运行，失去了在操作发生前进行干预的时机。SQL 注入防御这类必须用同步 Hook。

## 【收尾 · 30 秒】

Hooks 的核心价值不在于"扩展能力边界"——让 Claude 做更多，而在于"**夯实执行底座**"——让 Claude 做的每一件事都更可靠。它把那些"理应发生却常被遗忘"的关键检查，从依赖自觉的软约束升级为不可绕过的系统级硬约束。

下一章，我们将跳出交互式使用场景，深入探讨 Claude Code 如何在无人值守的环境下运行——Headless 模式与 CI/CD 集成。

---

## 【播报备注】

- **总字数**：约 2400 字
- **总时长**：约 10 分钟
- **停顿点**：每个「【...】」标题处停顿 1 秒
- **重音词**：「机制优于策略」「事前拦截、事中防护、事后审计」「优雅降级」「停止钩子」「火循环」
- **B-roll 建议**：在讲 17 事件分类时，配合 5 大类分布图；在讲 3 种处理器时，配合"确定性阶梯"图
- **章节标记**：每节开头用一句过渡引出，避免"我们来看下一节"这种生硬衔接
