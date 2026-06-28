# DeepResearch · 口播文案稿

> 适用场景：AI 技术博主 / 公众号 / 知识分享
> 预计时长：约 10 分钟
> 建议语速：220~250 字/分钟
> 阅读对象：AI 应用开发者、Agent 工程师、技术管理者

---

## 【开场钩子 · 30 秒】

你有没有这种经历？

问 AI："帮我调研一下 AI Agent 的最新进展。"
AI 给你的：3 个月前的内容，连 2025 年的 DeepResearch 都不知道。

换个问法："用 2025 年的最新资料，调研 AI Agent 进展，附上来源。"
AI 给你：30 分钟研究出来的深度报告，还有交叉验证的数据。

问题来了——AI 怎么突然从"问答机"变成"研究员"？

答案就一个词：**DeepResearch**。

## 【核心比喻开场 · 60 秒】

我打一个比方。

你让三个"学生"研究一个课题：

**第一个学生（RAG）**：带一本**已印好的参考书**进考场，只能抄里面的内容。问题表达模糊，就找不到。

**第二个学生（DeepSearch）**：能**联网搜资料**，但只搜一次就交差。复杂问题搜不深。

**第三个学生（DeepResearch）**：配了一个**真正的研究助理**——先拆问题、边搜边想、搜到不够再搜、反思之前结论、最后整合成深度报告。

核心区别：**RAG 是开卷抄书，DeepSearch 是查一次，DeepResearch 是真的研究**。

好，我们正式进入第三章。

## 【第一节 · RAG 为什么不灵了 · 90 秒】

先说 RAG。

RAG 是 2025 年之前的主流方案。它的原理是：把文档切分、用 Embedding 转成向量、存到向量库；用户提问时，搜相似文档塞给 LLM 当参考。

说白了，像**开卷考试**。

但 RAG 有三大局限：

第一，**召回率低**。库里有但搜不到，根因是用户语义模糊或向量空间偏移。

第二，**静态知识**。训练数据外的最新信息，向量库构建时已经固化。

第三，**被动检索**。无法根据已知信息调整策略，本质是单轮查询、没有反馈循环。

业界后来加了 Query Rewriting、Agentic RAG，本质还是"被动检索 + 多轮验证"。

治标不治本。

## 【第二节 · DeepSearch 的本质 · 90 秒】

好，那怎么办？

2025 年初，主流大模型开始普及**联网搜索**——RAG 升级为 WAG（Web Augmented Generation），也叫 DeepSearch。

DeepSearch 干了什么？把"查自己库"换成"查全网"。

具体流程：用户提问 → LLM 拆关键词 → 调搜索引擎 API → 抓多个网页 → 汇总 + 来源参考。

优势很明显：不用预建向量库、数据实时性强、召回范围广。

但是——**DeepSearch 等于搜索，不等于研究**。

为什么？单轮反馈、搜到什么算什么、没主动规划、缺信息质量评估。

所以 DeepSearch 解决的是"实时性"，解决不了"深度"。

## 【第三节 · DeepResearch 的核心架构 · 90 秒】

那 DeepResearch 到底是什么？

它是 2025 年 OpenAI 推出的技术范式，本质是**让 AI 像真正的研究员一样工作**。

核心架构有 3 个模块：

**思考与决策模块**——负责逻辑推理、任务拆解、结果反思。
**信息搜索模块**——负责联网检索、网页内容提取。
**报告输出模块**——负责多轮信息整合，输出结构化文档。

工作流程是 6 步：

第一步，初始探索，联网搜首轮信息。
第二步，状态评估，LLM 判断"够不够"。
第三步，策略制定，决定"再查什么"。
第四步，迭代执行，进入"探索-反思-再探索"循环。
第五步，循环终止，满足覆盖率就停。
第六步，整合报告，去重、校对、生成报告。

类比一下：
- DeepSearch = 助手**只搜一次就交差**。
- DeepResearch = 助手**有思考、有策略、有反思**，能自主研究 30 分钟。

## 【第四节 · 博查 vs SearXNG：DeepSearch 引擎选型 · 80 秒】

接下来讲实战。

DeepResearch 的基座是 DeepSearch。**先解决联网，再解决思考**。

国内推荐用**博查**——一个专门给 AI 设计的搜索引擎。

博查有 3 个 API：
- **Web Search API**：返回干净摘要 + 时间过滤，适合自定义 DeepResearch。
- **AI Search API**：即插即用，返回总结性答案 + 多模态卡片。
- **Agent Search API**：直接返回专业研究报告。

本书选用 Web Search API。

如果想免费 + 私有化，推荐 **SearXNG**——一个开源元搜索引擎，能并发请求 Google / Bing / DuckDuckGo 等几十个上游引擎。

SearXNG 的部署关键是 3 个安全参数：`--cap-drop ALL` 移除默认特权，`--cap-add` 精准补偿，`--log-opt max-size=1m` 限制日志。

最重要的是：**从博查迁移到 SearXNG，Agent 主体逻辑零改动**。这就是松耦合架构的好处。

## 【第五节 · Sequential Thinking：元认知引导 · 90 秒】

联网能力有了，思考能力怎么加？

答案：**Sequential Thinking**——一个 MCP Server 组件，曾经连续数月占据 Smithery.ai 使用榜第一。

它的本质不是复杂程序，而是一套**元认知引导框架**。

什么意思？它通过**强约束的提示词**，强制 LLM 遵循"假设→验证→修正→下一步"的闭环。

它有 9 大核心特性：可上下调整步骤数、可质疑修订、可继续延伸、可表达不确定、可分支回溯、可生成假设、可验证假设、重复直到满意、提供正确答案。

3 大典型场景很关键：

**初始化思考链**：LLM 提交第 1 步 → Server 返回 historyLength = 1。
**动态路径调整**：LLM 提交第 6 步（超过初始估计 5 步）→ Server 自动把 totalThoughts 调为 6。
**自我纠错**：LLM 标 isRevision = true，修订第 2 步 → Server 记录新思考。

**自我纠错是 DeepResearch 的核心**——允许 LLM **推翻之前的结论**。

## 【第六节 · 私有化部署：Wrapper 架构 · 60 秒】

Sequential Thinking 官方 Docker 镜像是 stdio 通信，**无法远程访问**。

怎么办？自建一个 **Streamable-HTTP Wrapper**。

架构分 3 层：
- **外层**：自封装 HTTP MCP Server（监听 38001 端口）
- **桥接层**：自封装 sequentialthinking 工具（每次请求启动 Docker 容器）
- **内层**：Docker 容器（实际推理单元）

关键设计：每次用 `docker run -i --rm mcp/sequentialthinking`，容器任务完自动销毁，保证推理环境纯净。

这样，远程 Agent 就能通过 HTTP 调本地容器了。

## 【第七节 · 完整系统：LangGraph + Streamlit · 80 秒】

最后把所有组件串起来。

**异构工具的统一编排**：
- Sequential Thinking 是 MCP 工具
- SearXNG 是本地标准工具
- 用 `langchain_mcp_adapters` 库的 `MultiServerMCPClient` 把它们统一

核心代码就 3 行：
```python
mcp_client = MultiServerMCPClient(mcp_tools)   # 连多个 MCP Server
tools = await mcp_client.get_tools()           # MCP 转 LangChain
tools = tools + [widesearch_for_toolstr]       # 合并本地工具
```

**前端用 Streamlit 做透明化展示**：
- 实时呈现 Sequential Thinking 的思考步数
- 实时呈现联网搜索的工具调用过程
- 最终报告 Markdown 渲染

实测下来，DeepResearch 触发了连续 9 次工具调用，严格遵循"先思考后搜索"范式，最终生成的结构化报告，**比普通大模型直接回复强 10 倍**。

## 【决策树 · 60 秒】

来，给个选型决策树：

你的数据在哪？
- 私有库 → RAG
- 全网 + 简单问答 → DeepSearch
- 全网 + 深度调研 → DeepResearch

你的搜索方案选什么？
- 商业 API + 中文 → 博查
- 开源 + 私有化 → SearXNG

你的推理增强要不要？
- 不要 → 基础 Agent
- 要 → Sequential Thinking + LangGraph

## 【踩坑提醒 · 60 秒】

最后几个工程坑：

1. **tool_call_id 缺失**——工具返回结果无法关联到原始请求，必须带 ID。
2. **数据未序列化**——工具返回 dict 会导致 API 协议错误，记得 `json.dumps`。
3. **MCP stdIO 远程访问失败**——自建 Streamable-HTTP Wrapper。
4. **SearXNG 容器残留**——用 `docker run --rm` 自动销毁。
5. **国内搜索引擎配置**——SearXNG 默认只有 Google，要在 settings.yml 勾选百度 / 搜狗 / 360。

## 【收尾 · 30 秒】

总结一句话：

**DeepResearch 的本质 = DeepSearch（联网能力）+ Sequential Thinking（元认知引导）**。

让 LLM 从"被动查一次"升级为"主动规划-反思-再规划"的**类人研究员**。

下一期，我们讲**第四章：记忆工程**——让 Agent 真正"记得住"用户。

我们下期见。

## 【播报备注】

- **总字数**：约 2200 字
- **预计时长**：9~10 分钟（220~250 字/分钟）
- **停顿点**：
  - 开场钩子后停 1 秒（反问击中）
  - 三大局限每条后停 0.5 秒
  - 3 大典型场景之间停 1 秒
  - 决策树前后各停 1 秒
- **重音词**：DeepResearch / Sequential Thinking / 元认知 / 自我纠错
- **B-roll 建议**：
  - 三个学生比喻：RAG 学生带书 / DeepSearch 学生联网 / DeepResearch 学生配助理
  - 6 步流程图：探索 → 评估 → 策略 → 迭代 → 终止 → 报告
  - 博查 vs SearXNG：商业 API vs 开源 Docker
  - Sequential Thinking 3 场景：JSON 串
- **章节标记**：5 节主体 + 决策树 + 踩坑 + 收尾
