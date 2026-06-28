# DeepResearch：从 RAG 到自主研究的范式跃迁

## 速查表

| 范式 | 一句话定义 | 核心机制 | 局限 | 典型场景 |
|------|----------|----------|------|----------|
| RAG | 静态知识库检索增强生成 | 文档切分 + 向量化 + 相似度搜索 | 召回率低、被动检索 | 企业知识库问答 |
| WAG / DeepSearch | 动态联网搜索增强 | LLM 调搜索引擎 API + 抓取 + 汇总 | 单轮反馈、非研究 | 实时信息查询 |
| DeepResearch | 深度思考型自主研究 | 思考→搜索→评估→再搜索→反思→输出 | 实现复杂、成本高 | 深度调研、长链研究 |

---

## 0. 全章比方：从"开卷考试"到"研究助理"

想象三种学习方式：

- **RAG** = 学生带一本**已印好的参考书**进考场，只能抄里面的内容；问题表达模糊就找不到
- **DeepSearch** = 学生能**联网搜资料**，但只搜一次就写答案；复杂问题搜不深
- **DeepResearch** = 学生配了一个**研究助理**：先拆问题 → 边搜边想 → 搜到不够就再搜 → 反思之前结论 → 整合成深度报告

核心区别：**RAG 是开卷抄书，DeepSearch 是查一次，DeepResearch 是真的研究**。

---

## 3.1 深度解析 DeepResearch 核心演进

### 3.1.1 RAG：静态检索的天花板

**核心流程**：
```
数据索引：原始文档 → 切分（Chunking）→ Embedding → 向量库
检索生成：用户提问 → 向量化 → 相似度搜索 → TopK 文档 → LLM 回答
```

**RAG 三大局限**：

| 局限 | 表现 | 根因 |
|------|------|------|
| 召回率低 | 库里有但搜不到 | 用户语义模糊 / 向量空间偏移 |
| 静态知识 | 训练数据外的最新信息缺失 | 向量库构建时已固化 |
| 被动检索 | 无法根据已知信息调整策略 | 单轮查询，无反馈循环 |

**业界优化**（治标不治本）：Query Rewriting、Agentic RAG → 本质仍是"被动检索 + 多轮验证"。

### 3.1.2 DeepSearch：从静态到动态

**核心升级**：把"查自己库"换成"查全网"。

```
用户提问 → LLM 拆关键词 → 调搜索引擎 API → 抓多网页 → 汇总 + 来源参考
```

**优势**：
- 无须预建私有向量库
- 数据实时性强
- 召回范围广

**核心缺陷**：**DeepSearch = 搜索 ≠ 研究**
- 单轮反馈，无法处理复杂长链任务
- 搜到什么算什么，无主动规划
- 缺乏信息质量评估

### 3.1.3 DeepResearch：从搜索到研究的范式跃迁

**核心架构**（3 大模块）：

```
┌─────────────────────────────────────────────────┐
│           DeepResearch 核心架构                  │
├─────────────────────────────────────────────────┤
│  思考与决策模块：逻辑推理、任务拆解、结果反思     │
│  信息搜索模块：联网检索、网页内容提取             │
│  报告输出模块：多轮信息整合 + 结构化文档          │
└─────────────────────────────────────────────────┘
```

**6 步细化流程**：

| 步骤 | 动作 | 比喻 |
|------|------|------|
| 1. 初始探索 | 联网搜索首轮信息 | 助手打开电脑开始查 |
| 2. 状态评估 | LLM 分析信息完整性与准确性 | 助手评估"够不够" |
| 3. 策略制定 | 决策是否追加搜索，生成针对性长尾查询 | 助手决定"再查什么" |
| 4. 迭代执行 | "探索-反思-再探索"循环 | 助手进入深度研究模式 |
| 5. 循环终止 | 满足覆盖率 / 达迭代阈值 | 助手喊"够了我开始写" |
| 6. 整合报告 | 去重、校对、生成最终报告 | 助手交付成果 |

**类比**：
- DeepSearch = 助手**只搜一次就交差**
- DeepResearch = 助手**有思考、有策略、有反思**，能自主研究 30 分钟

---

## 3.2 实战 1：构建 DeepSearch 核心引擎

DeepResearch 的基座 = DeepSearch。**先解决联网，再解决思考**。

### 3.2.1 博查（Bocha）：商业化 AI 搜索 API

**博查三大原子 API 对比**：

| API | 功能定位 | 核心特点 | 适用场景 |
|-----|----------|----------|----------|
| **Web Search API** | 全网信息检索 | 输出干净长文本摘要 + 时间范围过滤 | **自定义 RAG / DeepResearch（本章选用）** |
| AI Search API | 即插即用搜索助手 | 自动识别意图，返回总结性答案 + 参考源 + 多模态卡片 | 快速集成对话助手（DeepSearch 级） |
| Agent Search API | 深度研究 Agent | 返回专业长篇研究报告，具备初步自主推理 | 直接调用成品 DeepResearch |

**目录结构**（4 个文件）：

```
websearch1/
├── agent.py         # 主程序（Agent 逻辑）
├── llm.py           # LLM 客户端配置
├── tools.py         # 工具函数（bochasearch）
└── .env             # API KEY 配置
```

### 关键代码：博查搜索工具封装

**用途**：将博查 Web Search API 封装为可被 LLM 调用的函数。

```python
import os
import json
import requests
from langchain_core.tools import tool

@tool
async def bochasearch(query: str):
    """使用博查 AI 进行网络搜索，返回网页摘要结果。"""
    bochakey = os.getenv("BOCHA_API_KEY")
    ep = "https://api.bochaai.com/v1/web-search"

    headers = {
        "Authorization": f"Bearer {bochakey}",
        "Content-Type": "application/json",
    }
    data = {
        "query": query,
        "summary": True,
        "count": 10,
    }

    response = requests.post(ep, data=json.dumps(data), headers=headers)

    try:
        return response.json()
    except Exception as e:
        return {"error": str(e)}

tools = [
    {
        "type": "function",
        "function": {
            "name": "bochasearch",
            "description": "使用该工具进行网络搜索",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "搜索关键词",
                    }
                },
                "required": ["query"],
            },
        },
    },
]
```

### 关键代码：LLM 客户端与对话循环

**用途**：构建 Agent 主循环（推理-行动-观察闭环）。

```python
import asyncio
import json
from openai import AsyncOpenAI

client = AsyncOpenAI(
    api_key=os.getenv("TONGYI_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

async def send_messages(messages):
    response = await client.chat.completions.create(
        model="qwen3-max",
        messages=messages,
        tools=tools,
        tool_choice="auto",
    )
    return response

async def main(query: str) -> str:
    messages = [{"role": "user", "content": query}]

    while True:
        response = await send_messages(messages)

        print("回复：", response.choices[0].message.content)
        print("工具选择：", response.choices[0].message.tool_calls)

        if response.choices[0].message.tool_calls is not None:
            messages.append(response.choices[0].message)

            for tool_call in response.choices[0].message.tool_calls:
                if tool_call.function.name == "bochasearch":
                    arguments_dict = json.loads(tool_call.function.arguments)
                    search_result = await bochasearch(arguments_dict["query"])

                    if isinstance(search_result, dict):
                        content = json.dumps(search_result, ensure_ascii=False)
                    else:
                        content = str(search_result)

                    messages.append({
                        "role": "tool",
                        "content": content,
                        "tool_call_id": tool_call.id,
                    })
        else:
            break

    return response.choices[0].message.content

if __name__ == "__main__":
    ret = asyncio.run(main("中国在 2026 年米兰冬奥会获得了多少枚金牌"))
    print(ret)
```

**4 个关键工程细节**：

| 细节 | 作用 |
|------|------|
| 状态维护 | 循环中追加 `tool_calls` + `tool` 消息，保持上下文完整 |
| `tool_call_id` | 模型识别"哪个结果对应哪个请求"的唯一凭证 |
| 数据序列化 | `bochasearch` 返回 dict → 序列化为字符串（API 协议要求） |
| 退出机制 | `tool_calls is None` 时退出循环，返回最终答案 |

### 3.2.2 SearXNG：开源聚合搜索

**SearXNG 核心优势**：
- **元搜索**：并发请求 Google / Bing / DuckDuckGo 等数十个引擎
- **隐私可控**：私有化部署，数据自主
- **高可定制**：自定义上游引擎、结果过滤规则

**Docker 部署**（安全加固）：

```bash
mkdir -p data
chmod 777 data

docker run -d \
  --name searxng \
  --cap-drop ALL \
  --cap-add CHOWN \
  --cap-add SETGID \
  --cap-add SETUID \
  --log-driver json-file \
  --log-opt max-size=1m \
  --log-opt max-file=1 \
  -p 18080:8080 \
  -v $(pwd)/data:/etc/searxng:rw \
  searxng/searxng:latest
```

**3 个关键安全参数**：
- `--cap-drop ALL`：移除所有默认特权
- `--cap-add`：精准补偿必要权限（CHOWN / SETGID / SETUID）
- `--log-opt max-size=1m`：限制日志总大小，防爆盘

**配置 JSON 输出**（`data/settings.yml`）：

```yaml
search:
  formats:
    - html
    - json
```

```bash
docker restart searxng
```

### 关键代码：SearXNG 搜索封装

**用途**：替换博查为私有化 SearXNG，Agent 主体逻辑零改动。

```python
import requests
import json

async def searxngsearch(query: str):
    """使用 SearXNG 进行网络搜索。"""
    ep = "http://121.41.120.130:18080/search"
    params = {
        "q": query,
        "format": "json",
        "language": "cn",
        "pageno": 1,
        "safesearch": 0,
        "engines": "360search,baidu,quark,sogou",
    }

    try:
        response = requests.get(ep, params=params)
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": f"网络请求失败: {str(e)}"}
    except json.JSONDecodeError as e:
        return {"error": f"JSON 解析失败: {str(e)}"}
    except Exception as e:
        return {"error": f"未知错误: {str(e)}"}
```

**Agent 设计哲学**：
> **松耦合架构**：底层搜索方案从博查 → SearXNG 迁移时，**核心逻辑零改动**，仅替换工具层实现函数。

---

## 3.3 实战 2：Sequential Thinking 方案的 DeepResearch 代码实现

### 3.3.1 MCP 广场：Smithery.ai

**Smithery.ai 价值**：
- 汇聚数千个经过社区验证的 MCP Server
- 提供云端托管能力（API Keys 即接即用）
- 适合项目初期可行性验证

**生产环境**通常转向私有化部署：
- **数据安全**：研究型项目涉及核心敏感数据
- **链路稳定性**：共享资源在高峰期易延迟
- **低延迟需求**：DeepResearch 涉及频繁推理迭代

### 3.3.2 Sequential Thinking 原理

**Sequential Thinking** = **元认知引导框架**（不是复杂程序），代码轻量但描述强大。

**核心思想**：强制 LLM 遵循"**假设→验证→修正→下一步**"闭环。

**9 大核心特性**（摘录原文）：

| # | 特性 |
|---|------|
| 1 | 思考过程中可上下调整总步骤数 |
| 2 | 可质疑或修订之前的思考 |
| 3 | 即使看似结尾也可继续添加 |
| 4 | 可表达不确定性并探索替代方案 |
| 5 | 非线性思考：可分支或回溯 |
| 6 | 生成解决方案假设 |
| 7 | 基于思维链步骤验证假设 |
| 8 | 重复该过程直到满意 |
| 9 | 提供正确答案 |

**8 个核心参数**：

| 参数 | 含义 |
|------|------|
| `thought` | 当前思考步骤内容 |
| `next_thought_needed` | 是否需要下一步思考 |
| `thought_number` | 当前思考编号（可超出初始总数） |
| `total_thoughts` | 当前估计所需步骤数（可调） |
| `is_revision` | 是否修订之前的思考 |
| `revises_thought` | 修订哪一步 |
| `branch_from_thought` | 分支起点 |
| `branch_id` | 分支标识符 |
| `needs_more_thoughts` | 到达结尾但需要更多思考 |

**3 大典型交互场景**：

#### 场景 1：初始化思考链

```json
{
  "thought": "分析问题的第一步：需要理解用户需求...",
  "thoughtNumber": 1,
  "totalThoughts": 5,
  "nextThoughtNeeded": true
}
```

**Server 返回**：`thoughtHistoryLength: 1`（已成功保存第一步）

#### 场景 2：动态路径调整（扩展阶段）

```json
{
  "thought": "发现需要更多分析，这是第6步...",
  "thoughtNumber": 6,
  "totalThoughts": 5,
  "nextThoughtNeeded": true
}
```

**Server 自动调整**：`totalThoughts: 5 → 6`（LLM 自主扩展能力）

#### 场景 3：自我纠错（反思阶段）

```json
{
  "thought": "重新考虑第2步，之前的分析有误...",
  "thoughtNumber": 4,
  "totalThoughts": 5,
  "nextThoughtNeeded": true,
  "isRevision": true,
  "revisesThought": 2
}
```

**这是 DeepResearch 的核心**：允许 LLM **推翻之前的结论**。

### 3.3.3 私有化部署 Sequential Thinking

**挑战**：官方 Docker 镜像基于 stdio 通信，无法远程访问。

**解决：Wrapper 架构**（3 层）：

```
┌──────────────────────────────────────┐
│  自封装 Streamable-HTTP MCP Server   │  ← 对外接口（远程）
│  （FastMCP，监听 38001 端口）         │
├──────────────────────────────────────┤
│  自封装 sequentialthinking 工具      │  ← 桥接层（stdIO 调用）
│  （每次请求启动 Docker 容器）         │
├──────────────────────────────────────┤
│  Docker 容器（mcp/sequentialthinking）│  ← 实际执行单元
└──────────────────────────────────────┘
```

### 关键代码：Streamable-HTTP 包装器

**用途**：将 Docker stdIO 容器包装为远程 HTTP MCP Server。

```python
from mcp.server.fastmcp import FastMCP
from mcp import StdioServerParameters, stdio_client, ClientSession
from typing import Annotated, Optional

common_server_host = "0.0.0.0"
common_server_port = 38001
app = FastMCP("mcp common server", host=common_server_host, port=common_server_port)

@app.tool()
async def sequentialthinking(
    thought: Annotated[str, "Your current thinking step"],
    nextThoughtNeeded: Annotated[bool, "Whether another thought step is needed"],
    thoughtNumber: Annotated[int, "Current thought number (minimum 1)"],
    totalThoughts: Annotated[int, "Estimated total thoughts needed (minimum 1)"],
    isRevision: Annotated[Optional[bool], "Whether this revises previous thinking"] = False,
    revisesThought: Annotated[Optional[int], "Which thought is being reconsidered (minimum 1)"] = None,
    branchFromThought: Annotated[Optional[int], "Branching point thought number (minimum 1)"] = None,
    branchId: Annotated[Optional[str], "Branch identifier"] = None,
    needsMoreThoughts: Annotated[Optional[bool], "If more thoughts are needed"] = False,
):
    """
    This tool helps analyze problems through a flexible thinking process
    that can adapt and evolve. Each thought can build on, question, or
    revise previous insights as understanding deepens.
    """
    server_params = StdioServerParameters(
        command="docker",
        args=["run", "-i", "--rm", "mcp/sequentialthinking"],
        env=None,
    )

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            result = await session.call_tool(
                "sequentialthinking",
                {
                    "thought": thought,
                    "nextThoughtNeeded": nextThoughtNeeded,
                    "thoughtNumber": thoughtNumber,
                    "totalThoughts": totalThoughts,
                    "isRevision": isRevision,
                    "revisesThought": revisesThought,
                    "branchFromThought": branchFromThought,
                    "branchId": branchId,
                    "needsMoreThoughts": needsMoreThoughts,
                },
            )
            return result

if __name__ == "__main__":
    print(f"开始启动 MCP 公共服务, 端口是 {common_server_port}")
    app.run(transport="streamable-http")
```

**5 个核心设计点**：

| # | 设计点 | 作用 |
|---|--------|------|
| 1 | 参数对齐 | 包装器签名与原 Docker 镜像接口**完全一致** |
| 2 | 元数据注入 | 原版工具描述文档注入此处，确保 LLM 识别功能边界 |
| 3 | 动态容器 | `docker run -i --rm`：每次请求创建临时容器 |
| 4 | 自动化生命周期 | `--rm`：任务完毕自动销毁，保证推理环境纯净 |
| 5 | Streamable-HTTP | 远程 Agent 可通过 HTTP 调本地容器 |

### 3.3.4 构建 DeepResearch 完整系统

**异构工具的统一编排**：
- Sequential Thinking → MCP 工具
- SearXNG → 本地标准工具
- **通过 `langchain_mcp_adapters` 库**实现协议抽象

**目录结构**：

```
DeepResearch/
├── agent.py         # Agent 逻辑（LangGraph）
├── app.py           # Streamlit 前端
├── llm.py           # LLM 客户端
├── webtools.py      # 工具函数（SearXNG）
├── prompts.py       # 系统提示词
└── .env             # API Key
```

**系统提示词（核心驱动）**：

```text
你是任务执行专家，擅长根据用户需求，调用多个工具完成当前任务。

# 任务执行工作流
1. 理解任务：使用 sequentialthinking 工具深入理解当前任务。
2. 搜索和验证：使用 widesearch_for_toolstr 工具对每一步骤进行搜索和验证。
3. 迭代与终止：
   - 根据工具返回结果，使用 sequentialthinking 工具思考下一步动作。
   - 如果已收集到足够信息或完成当前任务，终止迭代。
   - 任务迭代应严格控制在当前任务范围内，不要超出。
4. 输出报告：仅当收集到足够信息后再完成报告的编写输出。

## 思考规则
1. 严格遵循 思考→调用其他工具→思考 的工具调用序列进行深度思考。
2. 对于较简单的任务，请在完成所有必要操作后直接给出回答。
3. 不得连续 3 次调用思考工具。

## 写作结果要求
- 写作时机：仅在收集到足够信息以后才开始写作。
- 内容要求：进行深度分析，提供详细且有价值的内容。
- 格式要求：使用 Markdown 语法加粗关键信息并尽可能添加表格。

现在的时间是 {current_date}
```

### 关键代码：联网搜索工具（LangChain 包装）

**用途**：用 `SearxSearchWrapper` 替换原始 HTTP 请求，简化开发。

```python
from langchain_community.utilities import SearxSearchWrapper
from langchain_core.tools import tool

@tool
async def widesearch_for_toolstr(query: str):
    """
    使用 searx 搜索工具进行网络搜索。
    参数:
        query (str): 搜索查询字符串。
    返回:
        str: 搜索结果的 Markdown 格式化字符串。
    """
    engines = ["baidu", "sogou", "quark"]
    search = SearxSearchWrapper(searx_host="http://localhost:18080/")
    search_ret = search.results(
        query,
        num_results=10,
        time_range="year",
        engines=engines,
    )

    strtemplate = """
    标题:{}
    简介:{}
    链接:{}
    """

    ret = ""
    for data in search_ret:
        title = data.get("title", "无标题")
        snippet = data.get("snippet", "无简介")
        link = data.get("link", "无链接")
        ret += strtemplate.format(title, snippet, link)
    return ret
```

### 关键代码：DeepResearch Agent 主逻辑

**用途**：整合 Sequential Thinking MCP + SearXNG 工具，构建 LangGraph Agent。

```python
from langchain_mcp_adapters import MultiServerMCPClient
from langgraph.graph import StateGraph, MessagesState, START, END
from langchain_core.messages import HumanMessage
from typing import Literal

mcp_tools = {
    "think": {
        "url": "http://localhost:38001/mcp",
        "transport": "streamable_http",
    },
}

class DeepResearchAgent:
    async def _build_agent(self):
        mcp_client = MultiServerMCPClient(mcp_tools)
        tools = await mcp_client.get_tools()
        tools = tools + [widesearch_for_toolstr]
        tools_by_name = {tool.name: tool for tool in tools}
        llm_with_tools = llm.bind_tools(tools)

        async def llm_call(state: MessagesState):
            response = await llm_with_tools.ainvoke(state["messages"])
            return {"messages": [response]}

        async def tool_node(state: MessagesState):
            from langgraph.prebuilt import ToolNode
            tool_node_instance = ToolNode(tools)
            return tool_node_instance.invoke(state)

        def should_continue(state) -> Literal["environment", END]:
            last_message = state["messages"][-1]
            if last_message.tool_calls:
                return "environment"
            return END

        agent_builder = StateGraph(MessagesState)
        agent_builder.add_node("llm_call", llm_call)
        agent_builder.add_node("environment", tool_node)
        agent_builder.add_edge(START, "llm_call")
        agent_builder.add_conditional_edges("llm_call", should_continue)
        agent_builder.add_edge("environment", "llm_call")

        return agent_builder.compile()

    async def run(self, question):
        agent = await self._build_agent()
        messages = [HumanMessage(content=question)]
        ret = await agent.ainvoke({"messages": messages})
        return ret["messages"][-1].content
```

**3 行核心机制**：

```python
mcp_client = MultiServerMCPClient(mcp_tools)        # 1. 连接多个 MCP Server
tools = await mcp_client.get_tools()                  # 2. MCP 工具转 LangChain
tools = tools + [widesearch_for_toolstr]              # 3. 合并本地工具
```

### 关键代码：Streamlit 实时研究界面

**用途**：把思考过程和搜索结果实时推送到前端。

```python
import streamlit as st

st.title("DeepResearch 深度研究系统")

if "messages" not in st.session_state:
    st.session_state.messages = []

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

if prompt := st.chat_input("请输入你的研究问题"):
    st.session_state.messages.append({"role": "user", "content": prompt})

    with st.chat_message("assistant"):
        placeholder = st.empty()
        full_response = ""

        async for chunk in agent.stream_run_with_history(prompt):
            if chunk["type"] == "thought":
                placeholder.markdown(f"**思考 {chunk['step']}**：{chunk['content']}")
            elif chunk["type"] == "raw_data":
                with st.expander(f"搜索结果 {chunk['index']}"):
                    st.text(chunk["content"])
            elif chunk["type"] == "final":
                placeholder.markdown(chunk["content"])
                full_response = chunk["content"]

    st.session_state.messages.append({"role": "assistant", "content": full_response})
```

**透明化推理的价值**：
- 实时呈现 Sequential Thinking 的思考步数
- 实时呈现联网搜索的工具调用过程
- 显著缓解用户等待长文本生成时的焦虑感

---

## 横向对比：三种范式的工程实现

| 维度 | RAG | DeepSearch | DeepResearch |
|------|-----|-----------|--------------|
| **数据源** | 私有向量库 | 全网（单次） | 全网（多轮） |
| **检索方式** | 相似度匹配 | 关键词搜索 | 思考 + 搜索 + 反思 |
| **核心组件** | Embedding + 向量库 | 搜索 API | MCP Sequential Thinking + 搜索 API |
| **思考能力** | 无 | 单轮反馈 | 多轮推理 + 自我纠错 |
| **工程难度** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **适用场景** | 企业知识库 | 实时查询 | 深度调研 |

---

## 工程踩坑清单

| 坑 | 表现 | 解法 |
|----|------|------|
| **tool_call_id 缺失** | 工具返回结果无法关联到原始请求 | 每次 tool 消息必须带 `tool_call_id` |
| **数据未序列化** | 工具返回 dict 导致 API 协议错误 | `json.dumps(content, ensure_ascii=False)` |
| **MCP stdIO 远程访问失败** | 容器内 MCP Server 只能本地调 | 自建 Streamable-HTTP Wrapper 包装 |
| **Sequential Thinking 容器残留** | 频繁调用导致容器堆积 | `docker run --rm` 自动销毁 |
| **流式输出阻塞** | Agent 思考过程用户看不到 | 用 `stream_run_with_history()` 异步生成器 |
| **系统提示词泄露** | 用户诱导重复提示词 | 提示词加 # 隐私保护 段 |
| **国内搜索引擎配置** | SearXNG 默认只有 Google | 在 settings.yml 勾选 360search / baidu / quark / sogou |
| **Docker 权限不足** | 容器无法写配置 | `chmod 777 data`（生产用 `chown 991:991`） |

---

## 全章知识地图

```
第3章 DeepResearch
│
├── 3.1 演进逻辑
│   ├── RAG（被动检索 / 静态知识）
│   ├── WAG / DeepSearch（动态搜索 / 单轮）
│   └── DeepResearch（自主研究 / 多轮思考）
│
├── 3.2 实战：DeepSearch 引擎
│   ├── 博查（Bocha）商业 API
│   │   ├── Web Search API（自定义 DeepResearch）
│   │   ├── AI Search API（即插即用）
│   │   └── Agent Search API（成品研究）
│   └── SearXNG 开源聚合
│       ├── Docker 部署（cap-drop 安全加固）
│       └── JSON 格式输出配置
│
└── 3.3 实战：DeepResearch 系统
    ├── Sequential Thinking（MCP）
    │   ├── 9 大特性 + 8 参数
    │   ├── 3 大场景（初始化 / 扩展 / 纠错）
    │   └── 私有化 Wrapper 架构
    └── 完整系统集成
        ├── MultiServerMCPClient（异构编排）
        ├── LangGraph StateGraph（工作流）
        └── Streamlit 前端（透明化推理）
```

---

## 贯穿主线

> **DeepResearch 的本质 = DeepSearch（联网能力）+ Sequential Thinking（元认知引导）**
>
> 让 LLM 从"被动查一次"升级为"主动规划-反思-再规划"的**类人研究员**。

---

## 学习路径建议

| 阶段 | 必学 | 推荐时长 |
|------|------|----------|
| 入门 | RAG / WAG / DeepSearch 概念差异 | 1-2 天 |
| 进阶 | 博查 API 实战 + OpenAI SDK Function Calling | 3-5 天 |
| 高级 | SearXNG 私有化部署 + LangChain SearxSearchWrapper | 1 周 |
| 实战 | Sequential Thinking 原理 + MCP 协议 | 1 周 |
| 专家 | DeepResearch 完整系统（LangGraph + Streamlit） | 2-3 周 |

---

## 生产化 3 维度增强

> 原型 → 生产：3 维度升级路径

1. **感知深度**：集成 Crawl4AI，将搜索摘要升级为全文深度解析
2. **持久化增强**：增加 Read/Write 工具，支持存量研究资料 + 自动生成 PDF/Markdown
3. **代码编写能力**：参考 CodeAct 模式，让系统具备编写 + 执行代码能力
