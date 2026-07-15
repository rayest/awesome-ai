# 3 Levels of Loop Engineering from First Principles

![封面](./2026-07-09-3-levels-of-loop-engineering-from-first-principles-cover.png)

![核心洞察](./2026-07-09-3-levels-of-loop-engineering-from-first-principles-summary-01.png)

![结构框架](./2026-07-09-3-levels-of-loop-engineering-from-first-principles-summary-02.png)

![行动建议](./2026-07-09-3-levels-of-loop-engineering-from-first-principles-summary-03.png)

## 来源分类

视频字幕 / 观点解读 / AI 自动化方法论。文本主体来自 Alex 朗读并评论 Antonio Vijano 的《The Three Levels of Loop Engineering》，后半段加入了 Alex 对 Rico Magic framework、数据结构、decision variables 的个人延展。

## 一句话总结

Loop Engineering 的核心不是“写更好的 prompt”，而是把工作拆成可循环执行、可验证、可交接的系统：先定义输入和任务描述，再设计角色、步骤、检查点和结构化产物，最后让人、AI、工具围绕这些数据结构协同。

## 核心观点

1. Level 1 适合日常软件任务：把 Linear/Trello 式 ticket 作为输入，触发实现 agent、review agent、PR 和人工 gate，让产品、业务、工程团队围绕同一个任务流协作。
2. Level 2 适合你理解领域但任务较复杂的情况：不要期待一个 agent 从头到尾扛住上下文，而是拆成专门角色，例如 investigator、patch validator、adjudicator。
3. Level 3 适合你不知道正确工作流是什么的情况：让 frontier models 先设计 workflow，再让实现 agent 执行，并用独立 verifier 检查。
4. 这三个 level 不是递进等级，而是任务适配方式：简单明确的事用 Level 1，有领域判断的复杂事用 Level 2，不知道路径的探索任务用 Level 3。
5. 真正值得人类把关的不是每一行实现，而是 taste、架构决策、测试覆盖、decision variables 和结构化产物。

## 内容结构

### Level 1：路线图推进型 Loop

基本流程是：

1. 创建 ticket。
2. 把 ticket 从 backlog 移到 to-do。
3. agent 自动开始实现，并把状态改为 in progress。
4. 完成后自动进入 review。
5. 独立 review agent 用 fresh context 做代码审查。
6. 通过截图、录屏、PR 评论或状态变更保留人工审批点。

作者的重点是：任务说明比 prompt 技巧更重要。你不是在 engineering prompts，而是在 engineering task descriptions。

适用场景：

- 日常 bug fix。
- 规格清晰的小功能。
- 产品经理或非工程角色可以描述需求，但不直接写代码的任务。
- 已经有团队工程规范、CI、PR review 和 merge gate 的软件团队。

### Level 2：自定义工作流 Loop

当任务不是直线流程时，需要把任务拆成角色和阶段。

文中案例是检查历史 report 是否已经在生产中修复，并追踪修复 commit 和 release。最初方案是为每个 report 并行派 4 个 investigator，然后 3/4 同意就判定。但效果差，unknown 很多。

改进方案：

1. Git diff checker：从 report 日期开始沿 commit 时间线向前查，找出 bug 消失的候选 commit。
2. Patch validator：独立确认候选 commit 是否真的修复了 report，并映射到 release。

结果从约 35% decisive statuses 提升到 90%。关键不是更强模型或更花 prompt，而是角色分解 + 独立验证。

### Level 3：AI 生成工作流 Loop

当你不知道该怎么设计 workflow 时，可以让多个强模型提出方案、互相 critique，再交给 Codex 或其他执行 agent 实现。

文中正例是让模型设计并实现 Go 版本 blockchain client。成功的原因不只是 agent 会写代码，还因为目标领域有大量已有 spec 和测试，这些测试把前人的工程智慧沉淀成了可验证标准。

文中反例是 ultra research：让多个 researcher、auditor、follow-up agent 研究一篇大论文，编排很漂亮，但结果不如直接让强模型写报告。可能原因是输入过大、主题拆分不够细、每个 agent 自己也发生了 context rot。

## 关键概念

### Loop Engineering

不是单次“让 AI 做事”，而是设计一套重复执行的闭环：输入、执行者、状态变化、产物、验证、分支、人工 gate 和下一轮动作。

### Task Description > Prompt

Level 1 的关键变化是：团队停止沉迷 prompt 花样，开始把任务描述写清楚。清楚的任务描述本身就是可复用的组织资产。

### Context Rot

任务太长、上下文太大、材料太多时，agent 的实现质量会漂移。解决方式不是把更多东西塞进上下文，而是拆角色、拆阶段、拆产物。

### Independent Verification

实现者和验证者要分离。验证 agent 应该带着 fresh context，从产物、测试、diff、release、验收标准出发独立判断，而不是延续实现者的思路。

### Decision Variables / Data Structures

Alex 的延展观点是：未来真正关键的是“决策变量”和“结构化产物”。你要思考的不是 AI 每一步怎么做，而是每一步应该留下什么数据结构，让后续步骤、人类和工具都能读取、验证、分支。

## 可照做操作步骤

1. 先定义输入：明确这个 loop 的入口是什么，例如 Linear ticket、bug report、论文、代码仓库、用户反馈、数据表格或文件夹。
2. 写任务描述模板：包含目标、上下文、约束、验收标准、禁止事项、输出格式和人工审批点。
3. 判断任务类型： routine work 用 Level 1，复杂已知领域任务用 Level 2，未知路径探索任务用 Level 3。
4. 设计结构化产物：每一步都要求 agent 输出文件或 JSON/Markdown 表格，例如 `candidate_commits.md`、`verification_report.md`、`decision.json`。
5. 拆角色：至少区分 implementer 和 verifier；复杂任务再拆 investigator、planner、validator、adjudicator、summarizer。
6. 设计状态流：例如 backlog -> to-do -> in progress -> review -> human approval -> merge/done。
7. 加入人工 taste gate：架构、产品体验、复杂度、维护成本、代码风格不要完全交给 AI 审批。
8. 强制独立验证：review agent 不复用实现上下文，只读取任务描述、diff、测试结果和产物。
9. 保留证据：要求 agent 上传截图、录屏、测试输出、候选列表、失败原因和未解决问题。
10. 复盘并固化：把成功的步骤沉淀成 skill、AGENTS.md、workflow file、issue template 或自动化脚本。

## 流程图

```text
输入 / Ticket / Report / Paper
        |
        v
任务描述规格化
        |
        v
选择 Loop Level
   |          |             |
   v          v             v
Level 1    Level 2       Level 3
直线流     角色分解       AI 设计 workflow
   |          |             |
   v          v             v
结构化产物 / Decision Variables
        |
        v
独立验证 + 人工 Gate
        |
        v
合并 / 发布 / 复盘 / 更新 workflow
```

## 常见误区

1. 把 loop engineering 理解成“多写几个 prompt”：真正的重点是任务结构、产物结构和验证结构。
2. 完全相信 AI review：AI 可以做初筛和重复检查，但 taste、架构和长期维护风险仍需要人类 gate。
3. 任务越大越适合多 agent：材料过大、拆分不清时，多 agent 只会把 context rot 扩散成更多噪声。
4. 没有测试就大规模自动实现：AI 写代码的成本下降后，验证和测试的价值反而上升。
5. 只看最终输出，不看中间决策：中间 decision variables 才是后续调试、复盘和自动化升级的抓手。

## 值得质疑的地方

1. 文中对 Level 3 的成功案例可能低估了既有测试和 spec 的价值。blockchain client 能成功，很大程度是因为原始系统的测试和协议已经沉淀了大量工程智慧。
2. “更多 agent review”并不必然等于更高质量。如果多个 agent 都共享同样盲点，投票只是在放大共识错误。
3. AI 生成 workflow 在未知领域很诱人，但如果人类完全看不懂 workflow 的关键假设，失败时也很难修正。

## 对我的启发

1. 设计 loop 时，先问“每一步要留下什么可读、可验证、可复用的数据结构”，而不是先问“我要让 agent 做什么”。
2. 好的 workflow 不是把人排除出去，而是把人放在最有价值的位置：定义变量、判断 taste、批准关键分支、复盘失败原因。
3. 当 intelligence 的成本下降，wisdom、tests、spec、decision variables、review standards 的价值会上升。
4. 对团队来说，最有复利的资产不是一次性 prompt，而是 issue template、skill、workflow file、验收标准和结构化输出协议。

## 一句话复盘

Loop Engineering 的本质是把 AI 工作从“聊天式委托”升级为“结构化生产系统”：让任务被清晰描述，让角色被拆开，让产物可验证，让决策以数据结构留下来。
