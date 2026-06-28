# 第二章 上下文的"元驱动"：意图识别、规划等模块的工程化实战

> **本书**：《Harness工程：从上下文管理到Agent系统构建》（邢云阳，人民邮电出版社，2026）
> **本章一句话定位**：把 Agent 必备的五种能力（识别意图→规划计划→反思纠错→执行行动→人机协作）从理论变成可复制粘贴的代码，统一用 LangGraph 工作流串起来。

---

## 速查表（一页纸地图）

| 模式 | 对应理论模块 | 核心比喻 | 主要 LLM 数 | 典型场景 |
|------|------------|----------|-------------|----------|
| 意图识别 | 感知模块 | 医院分诊台 | 1~2 | 所有 Agent 入口 |
| 计划模式 | 规划模块 | 项目经理 | 2 | 长任务、多步骤 |
| 反思模式 | 反思模块 | 作家改稿 | 2 | 编程、研究、写作 |
| CodeAct | 执行模块 | 万能工匠 | 1 | 临时性、多样化 |
| 人机协作 | 安全保障 | 自动驾驶接管 | 1+人工 | 删库、审核、追问 |

**章节结构**：2.1 意图识别 → 2.2 计划模式（简单+复杂）→ 2.3 反思模式 → 2.4 CodeAct → 2.5 人机协作（强制+自主）

---

## 0. 全章比方：米其林主厨的一天

想象你是一位米其林餐厅主厨，每天要服务 100 桌客人：

- 客人说"随便来点" → 你得先**听懂**他到底想吃啥（意图识别）
- 听完之后你要**列菜单**：前菜→汤→主菜→甜点（计划模式）
- 端菜时发现"牛排五分熟但客人要全熟" → 要**回头补救**（反思模式）
- 客人突然问"能现场给我做个生日蛋糕吗" → 厨房里**现搭工具**现做（CodeAct）
- 遇到"我要把今天点的菜全部退掉" → 得**叫经理来确认**（人机协作）

本章就是教你把这 5 步都做成"自动化的流水线"。

---

## 2.1 意图识别：让 AI 听懂你真正想要啥

### 🔖 术语卡
> **意图识别 (Intent Recognition)**：从用户一句话中推断其真实诉求的技术。注意区分"字面意思"和"潜在意图"。

### 类比：医院分诊台

医院挂号处不会让心脏病人去儿科——分诊护士就是"意图识别器"。

- 输入："我胸口疼" → 分诊到 → 心内科
- 输入："我家孩子发烧" → 分诊到 → 儿科

分诊错了，后面再好的医生也治错病。Agent 系统同理：

- 输入："帮我写个爬虫" → 路由到 → 编程工具
- 输入："贵州茅台怎么样" → 路由到 → 财经 OR 礼品 OR 收藏？（**歧义**）

### 痛点
用户提问高度自由甚至随心所欲；语义模糊问题大量存在；不同 LLM 各有所长（豆包多模态、GLM-5 代码、Qwen-Max 通用）——都需要在入口处精准分发。

### 两条工程路径

#### 路径 A：Arch-Router（轻量级分诊护士）

- 是个 **1.5B 参数**的小模型，普通 CPU 就能跑
- 部署方式：Ollama + GGUF 格式
- 工作方式：给它一张"分诊表"（routes，比如"编程、旅游、财经"）+ 客人描述（conversation），它输出 `{"route":"编程"}`
- 像训练有素的护士，看一眼就知道挂哪个科
- 提示词模板分两部分：TASK_INSTRUCTION（角色+输入结构）+ FORMAT_PROMPT（输出规则+兜底标签 `other`）

**Ollama 部署命令**：

```bash
modelscope download --model katanemo/Arch-Router-1.5B.gguf --local_dir /root/model/arch
pip install modelscope
curl -fsSL https://ollama.com/install.sh | sh
ollama create archrouter -f arch.mf
ollama run archrouter:latest
```

**Ollama 模型配置**（`arch.mf`）：

```yaml
FROM /root/model/arch/Arch-Router-1.5B.gguf

TEMPLATE """{{ if .System }}<|im_start|>system
{{ .System }}<|im_end|>{{ end }}<|im_start|>user
{{ .Prompt }}<|im_end|>
<|im_start|>assistant
"""

PARAMETER stop "<|im_start|>"
PARAMETER stop "<|im_end|>"
```

**提示词模板（Part 1：TASK_INSTRUCTION）**：

```python
TASK_INSTRUCTION = """
You are a helpful assistant designed to find the best suited route.
You are provided with route description within <routes></routes> XML tags:
<routes>
{routes}
</routes>
<conversation>
{conversation}
</conversation>
"""
```

**提示词模板（Part 2：FORMAT_PROMPT）**：

```python
FORMAT_PROMPT = """
Your task is to decide which route is best suited for handling the user's
latest input. Provide your answer in JSON format, wrapped in ```json ... ```.

Schema:
```json
{{
  "route": "string"
}}
```

The route must be one of the routes provided in the <routes> tag.
If no route is suited, answer with "other".
"""
```

**LangChain 调用示例**：

```python
from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate
import json

llm = Ollama(model="archrouter:latest")

routes = ["编程", "旅游", "财经", "其他"]
routes_xml = "\n".join([f"<route>{r}</route>" for r in routes])

conversation = """
<message role="user">如何用 Go 编写 K8s Pod 查询？</message>
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", TASK_INSTRUCTION.format(routes=routes_xml)),
    ("user", FORMAT_PROMPT + "\n\n" + conversation)
])

response = llm.invoke(prompt.format_prompt().to_string())
result = json.loads(response.split("```json")[1].split("```")[0].strip())
print(result)
# {"route": "编程"}
```

#### 路径 B：小模型 + 大模型双保险（实战首选）

| 模型 | 角色 | 比喻 |
|------|------|------|
| 小模型（Qwen2.5-1.5B） | 第一道分诊 | 经验丰富的护士，反应快、成本低 |
| 大模型（Qwen3-Max） | 二级会诊 | 主任医师，处理疑难杂症 |

**两者结果一致** → 信任小模型，直接进业务（节省成本）
**两者结果不一致** → 触发兜底策略：

- 礼貌拒绝："抱歉我没理解清楚"
- 转人工
- 反问澄清："您是想了解天气还是交通？"
- 记录日志用于后续训练（**数据飞轮**）

### 小模型微调实战要点

**样本配比**（决定准确率上限）：

| 样本类型 | 数量/类 | 作用 |
|----------|---------|------|
| 正样本 | 30~200 条 | 主营业务强相关 |
| 负样本 | 5000~20000 条 | 识别非业务请求、训练边界感 |
| 长尾意图样本 | 20~100 条 | 增强对罕见但合理闲聊的鲁棒性 |

**微调参数推荐**：

| 参数 | 全量微调 | LoRA 微调 |
|------|----------|-----------|
| learning_rate | 5e-6 / 5e-5 | 3e-4 |
| global_batch_size | 256 | 256 |
| num_train_epochs | 3 | 5 |
| lora_dim | 0 | 64 |

**LoRA 微调脚本（swift 框架）**：

```python
from swift import LoRA, Trainer
from swift.dataset import IntentDataset

model_path = "Qwen2.5-1.5B-Instruct"
dataset = IntentDataset.from_jsonl("intent_train.jsonl")

lora_config = LoRA(
    r=64,
    lora_alpha=128,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

trainer = Trainer(
    model=model_path,
    args={
        "learning_rate": 3e-4,
        "global_batch_size": 256,
        "num_train_epochs": 5,
        "output_dir": "./output/intent-router",
        "gradient_accumulation_steps": 8,
        "warmup_ratio": 0.1,
    },
    train_dataset=dataset,
    peft_config=lora_config,
)

trainer.train()
trainer.save_model("./output/intent-router-lora")
```

**推理时合并主模型 + 大模型兜底**：

```python
from langchain_openai import ChatOpenAI
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

base_model = AutoModelForCausalLM.from_pretrained("Qwen2.5-1.5B-Instruct")
lora_model = PeftModel.from_pretrained(base_model, "./output/intent-router-lora")
tokenizer = AutoTokenizer.from_pretrained("Qwen2.5-1.5B-Instruct")

def local_intent_router(user_query: str) -> str:
    prompt = TASK_INSTRUCTION + FORMAT_PROMPT
    inputs = tokenizer(prompt + user_query, return_tensors="pt")
    outputs = lora_model.generate(**inputs, max_new_tokens=64)
    result = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return parse_route(result)

llm_fallback = ChatOpenAI(model="qwen3-max", temperature=0)

def hybrid_intent_recognition(user_query: str, routes: list[str]) -> str:
    local_result = local_intent_router(user_query)

    fallback_prompt = f"""
    你是意图识别专家。从以下类别中选择最匹配用户问题的标签：
    类别：{routes}
    用户问题：{user_query}
    仅输出标签名，不要其他内容。
    """
    fallback_result = llm_fallback.invoke([("user", fallback_prompt)]).content.strip()

    if local_result == fallback_result:
        return local_result

    return "__conflict__"

def handle_conflict(user_query: str):
    return {
        "action": "clarify",
        "message": "抱歉，我没理解清楚。能否换个说法？",
        "raw_query": user_query,
    }
```

**意图识别准确率 ≥ 98.5%** 才能满足企业级上线标准。

> 💡 **真实价值**：每提升 1%，百万 DAU 系统每天少走错几十万次流程，节省大量算力与人工成本。

---

## 2.2 计划模式：让 AI 像项目经理一样拆任务

### 类比：装修房子

你说"帮我装修这间房"——老练的项目经理会怎么干？

1. **先出方案**：量房 → 出设计图 → 列施工清单（计划模块）
2. **再按方案施工**：水电 → 瓦工 → 木工 → 油漆 → 软装（执行模块）

而不是直接拎着锤子上场。

### 2.2.1 简单计划模式（潮汕旅游攻略为例）

```
用户提问 → [计划模块 LLM] → 大纲 → [执行模块 LLM + 工具] → 最终攻略
                   ↓                          ↓
            生成结构化计划              按计划逐步调用工具
```

**四件套节点**：
- `plan_node`：LLM 调用，生成大纲
- `execute_node`：LLM + 工具调用能力，按大纲执行
- `tool_node`：实际执行工具调用，回传 ToolMessage
- 循环控制节点：判断 `Final Answer` 终止

**完整代码实现**（LangGraph）：

```python
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

llm_planner = ChatOpenAI(model="qwen-max", temperature=0)
llm_executor = ChatOpenAI(model="qwen-turbo", temperature=0)

class State(TypedDict):
    messages: Annotated[list, add_messages]

@tool
def get_attraction(city: str) -> str:
    """根据城市名查询热门景点。"""
    return f"{city} 热门景点：牌坊街、广济桥、..."

@tool
def get_food(city: str) -> str:
    """根据城市名查询必吃美食。"""
    return f"{city} 必吃：牛肉火锅、肠粉、..."

tools = [get_attraction, get_food]
llm_executor_with_tools = llm_executor.bind_tools(tools)

def plan_node(state: State):
    plan_prompt = """
    你是一位旅游攻略规划师。
    可用资料目录：[{file_names}]
    任务：基于以上资料目录，生成完整的攻略大纲（不超出资料范围）。
    输出格式：每行一个章节标题，最后一行写"Final Answer"。
    """
    file_names = ["attractions.md", "foods.md", "transport.md"]
    messages = [("user", plan_prompt.format(file_names=file_names))]
    response = llm_planner.invoke(messages)
    return {"messages": [response]}

def execute_node(state: State):
    return {"messages": [llm_executor_with_tools.invoke(state["messages"])]}

def tool_node(state: State):
    from langgraph.prebuilt import ToolNode
    tool_node_instance = ToolNode(tools)
    return tool_node_instance.invoke(state)

def should_continue(state: State) -> str:
    last_message = state["messages"][-1]
    content = getattr(last_message, "content", "")
    if "Final Answer" in content:
        return "end"
    if getattr(last_message, "tool_calls", None):
        return "tools"
    return "execute"

graph = StateGraph(State)
graph.add_node("plan", plan_node)
graph.add_node("execute", execute_node)
graph.add_node("tools", tool_node)

graph.add_edge(START, "plan")
graph.add_edge("plan", "execute")
graph.add_conditional_edges("execute", should_continue, {
    "tools": "tools", "execute": "execute", "end": END
})
graph.add_edge("tools", "execute")

app = graph.compile()

result = app.invoke({
    "messages": [("user", "帮我写一份 3 天潮汕旅游攻略")]
})
print(result["messages"][-1].content)
```

**关键工程技巧**：

| 技巧 | 为什么 | 比喻 |
|------|--------|------|
| 异构模型 | 规划要智商、执行要速度 | 设计师用高级的，施工队用熟练的 |
| 工具描述 = 目录名 | LLM 据此匹配调用 | 工具说明书必须跟目录一致，不然 LLM 找不到 |
| `Final Answer` 终止符 | 让工作流知道何时收工 | 项目经理喊"收工" |

### 2.2.2 复杂计划模式（通用计划执行）

#### 类比：从"工人听指挥"到"工人看甘特图"

简单模式里 LLM 不知道"自己做到哪一步了"——只能看到原始计划；复杂模式让 LLM **看得到历史**。

#### 三个关键升级

| 升级点 | 简单模式 | 复杂模式 | 比喻 |
|--------|----------|----------|------|
| **历史回看** | 无 | `{past_steps}` 占位符注入"已完成步骤+结果" | 工人能看到前面工序留下的笔记 |
| **终止判定** | 文本匹配 `Final Answer` | Pydantic 结构化输出 `Action(Union[Response, Plan])` | 用对讲机明确"完成"还是"继续" |
| **执行器** | 手写工具节点 | `create_react_agent` 预构建组件 | 自己砌墙 vs 用装配式建筑 |

#### 核心机制：动态缩短计划

每轮推理后，LLM **只返回剩余待办步骤**：

```
轮次1：plan = [A, B, C, D]
轮次2：LLM 完成 A → 返回 plan = [B, C, D]
轮次3：LLM 完成 B → 返回 plan = [C, D]
轮次4：LLM 完成 C → 返回 plan = []  → 输出 Response 终止
```

> 💡 **关键洞察**：随着轮次推进，LLM 看到的上下文干扰**越来越少**——这是工程上保证准确率的核心设计。

#### 数据模型（Pydantic 结构化输出）

```python
class Plan(BaseModel):
    steps: List[str]

class Response(BaseModel):
    response: str

class Action(BaseModel):
    actions: Union[Response, Plan]
```

绑定方式：`llm.with_structured_output(Action)` → LLM 只能输出合法 JSON。

#### 高斯求和示例（极简但经典）

```
人类预设计划 = [
  "计算 1 加 100 的和",          → 工具调用 add(1,100)=101
  "用第一步得到的和乘以 100",    → 工具调用 multiply(101,100)=10100
  "用第二步得到的乘积除以 2",    → LLM 直接推理 5050
  "输出最终答案"                  → 终止
]
```

验证了"分解步骤 → 逐步执行 → 累积历史 → 动态更新计划 → 终止"的完整闭环。

---

## 2.3 反思模式：让 AI 像作家一样反复打磨

### 🔖 术语卡
> **反思模式 (Reflection / Reflexion)**：源自 2023 年论文 *Reflexion: Language Agents with Verbal Reinforcement Learning*。引入"生成器 + 评判器"双 LLM 协作机制，通过自我批评迭代逼近最优解。

### 类比：写作修改 / 代码 Review

你写完一篇文章会怎么做？
1. 自己读一遍（自我反思）
2. 给朋友看一遍（他人审视）
3. 根据反馈修改
4. 再读、再改……直到满意

反思模式就是把这套流程自动化：用**两个 LLM 互相配合**。

### 架构

```
[生成器 LLM] → 初稿 → [反思器 LLM] → 反馈
       ↑                              ↓
       └─────────── 改进后再生成 ←─────┘
```

### 运维场景示例：自动生成 Docker 命令

- 用户："用 docker 创建 nginx 容器，端口映射 8080:80"
- 生成器：`docker run -d -p 8080:80 nginx`
- 反思器：检查后发现"应该加 `--name my-nginx` 便于管理"
- 生成器：修订为 `docker run -d -p 8080:80 --name my-nginx nginx`
- 反思器再审 → 通过 → 输出

### 反思的四维审查（被低估的"安全"维度）

反思器不仅挑"好不好"，还挑"安不安全"。运维命令生成的反思器明确包含：

| 维度 | 检查项 | 反例 |
|------|--------|------|
| **安全性** | 是否有破坏性操作风险 | `rm -rf /`、`dd if=/dev/zero` |
| **规范性** | 是否符合最佳实践 | 应该加 `--name` 却没有 |
| **效率性** | 是否存在更优解 | 应该用 `docker compose` 却用裸 `docker run` |
| **任务对齐** | 是否真正解决用户问题 | 用户要查日志却生成了重启命令 |

> ⚠️ **生产铁律**：反思模式不是"可选项"，而是**高风险场景的必选项**（运维、金融、医疗）。

### 关键工程细节

- 3 节点工作流：生成节点 → 反思节点 → 条件分支节点
- `iterations` 计数器必须设上限（比如 3 次），否则可能死循环
- 终止判定：反思输出包含"无建议/无须优化"或 stop_sign 关键词则结束
- 安全关键词触发立即终止（如识别到 `rm -rf`）

**反思模式完整实现**：

```python
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI

llm_generator = ChatOpenAI(model="qwen-max", temperature=0)
llm_reflector = ChatOpenAI(model="qwen-max", temperature=0)

MAX_ITERATIONS = 3
STOP_SIGNS = ["rm -rf", "dd if=/dev/zero", "mkfs"]

class AgentState(TypedDict):
    user_query: str
    best_command: str
    reflection: str
    iterations: int
    messages: Annotated[list, add_messages]

def generate_node(state: AgentState):
    prompt = f"""
    用户需求：{state["user_query"]}
    历史反思建议：{state.get("reflection", "无")}
    请基于以上信息生成最佳的 shell / docker / 代码命令。
    只输出命令本身，不要解释。
    """
    response = llm_generator.invoke([("user", prompt)])
    return {
        "best_command": response.content,
        "messages": [response],
        "iterations": state.get("iterations", 0) + 1,
    }

def reflect_node(state: AgentState):
    prompt = f"""
    待审查命令：{state["best_command"]}
    原始需求：{state["user_query"]}

    请从以下 4 维度审查：
    1. 安全性：是否存在破坏性操作风险
    2. 规范性：是否符合最佳实践
    3. 效率性：是否存在更优解
    4. 任务对齐：是否真正解决用户问题

    输出格式：
    - 若命令无须优化，输出"无建议"
    - 若命令存在风险，输出"STOP: <风险描述>"
    - 否则输出具体修改建议
    """
    response = llm_reflector.invoke([("user", prompt)])
    return {"reflection": response.content, "messages": [response]}

def check_reflection(state: AgentState) -> str:
    reflection = state["reflection"]

    for sign in STOP_SIGNS:
        if sign in reflection:
            return "stop"

    if "无建议" in reflection or "无须优化" in reflection:
        return "end"

    if state["iterations"] >= MAX_ITERATIONS:
        return "end"

    return "regenerate"

graph = StateGraph(AgentState)
graph.add_node("generate", generate_node)
graph.add_node("reflect", reflect_node)

graph.add_edge(START, "generate")
graph.add_edge("generate", "reflect")
graph.add_conditional_edges("reflect", check_reflection, {
    "regenerate": "generate", "end": END, "stop": END
})

app = graph.compile()

result = app.invoke({
    "user_query": "用 docker 创建 nginx 容器，端口映射 8080:80",
    "best_command": "",
    "reflection": "",
    "iterations": 0,
    "messages": [],
})
print("Final command:", result["best_command"])
```

---

## 2.4 CodeAct 模式：让 AI 像万能工匠一样现场造工具

### 🔖 术语卡
> **CodeAct 模式**：不再将"工具"视为静态的预注册函数，而是把整个编程语言视为"通用工具空间"，让 LLM 在推理中生成可执行代码片段并由沙箱运行。

### 类比：瑞士军刀 vs 固定工具箱

| 模式 | 比喻 | 局限 |
|------|------|------|
| Function Calling | 工厂的固定工具箱 | 工具必须预先注册，遇到没注册的就抓瞎 |
| **CodeAct** | **瑞士军刀 + 车床 + 3D 打印机** | **现场造工具，啥都能干** |

### 真实痛点场景

用户问"算过去 7 天某股票的平均收盘价"：

- **Function Calling 路线**：你得提前注册 `get_stock_price(symbol, days)` 工具——但如果用户问的是 MACD、布林带呢？没注册就完蛋
- **CodeAct 路线**：LLM 直接生成一段 Python 代码（调用 yfinance + 计算），当场跑——**没有它不会的工具，只有它算不出来的算式**

### 图表生成助手示例

```
用户："用这组数据 [10.1, 9.8, 10.7, ...] 画折线图并分析趋势"
       ↓
LLM 生成代码（包含 matplotlib 调用）
       ↓
execute_python 工具 → 隔离环境 exec() → 生成图片 + 返回 trend 分析
       ↓
LLM 把图片路径 + 趋势文字组合 → 返回给用户
```

### 工作流三节点

1. `llm_call_node`：让 LLM 写代码（5 步指令：分析→写→执行→纠错→答）
2. `process_node`：实际执行代码（沙箱隔离，安全！）
3. `enter_process`：判断有结果 → 结束；没结果 → 回节点 1 重试

### 核心实现技巧

- 提示词要求结果存入 `result` 变量（标准化输出）
- 通过字符串匹配提取 ```python ... ``` 块作为可执行代码
- 工具调用：包装为 `{"tool": "execute_python", "tool_input": code}`

**CodeAct 完整实现**（含沙箱执行）：

```python
import re
import json
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

llm = ChatOpenAI(model="qwen-coder", temperature=0)

@tool
def execute_python(code: str) -> str:
    """在受限沙箱中执行 Python 代码，将结果存入 result 变量。"""
    local_vars = {}
    try:
        exec(code, {"__builtins__": __builtins__}, local_vars)
        result = local_vars.get("result", "执行成功，无返回值")
        return str(result)
    except Exception as e:
        return f"执行错误：{type(e).__name__}: {e}"

def _create_agent_action(code: str):
    return {
        "tool": "execute_python",
        "tool_input": code,
    }

def llm_call_node(state: dict):
    prompt = """
    你是数据分析助手。请用 Python 代码解决用户问题。
    步骤：
    1. 分析问题
    2. 写出 Python 代码（必须用 ```python ... ``` 包裹）
    3. 代码中必须将最终结果存入 result 变量
    4. 只输出代码块，不要其他解释
    """
    messages = state["messages"] + [("user", prompt)]
    response = llm.invoke(messages)
    return {"messages": [response]}

def process_node(state: dict):
    last_message = state["messages"][-1]
    content = getattr(last_message, "content", "")

    match = re.search(r"```python\n(.*?)```", content, re.DOTALL)
    if not match:
        return {
            "output": "未找到可执行代码",
            "messages": [],
        }

    code = match.group(1).strip()
    result = execute_python.invoke(code)
    return {
        "output": result,
        "messages": [("user", f"执行结果：{result}")],
    }

def enter_process(state: dict) -> str:
    if state.get("output"):
        return "end"
    return "llm"

class State(TypedDict):
    messages: Annotated[list, add_messages]
    output: str

graph = StateGraph(State)
graph.add_node("llm", llm_call_node)
graph.add_node("process", process_node)

graph.add_edge(START, "llm")
graph.add_edge("llm", "process")
graph.add_conditional_edges("process", enter_process, {
    "end": END, "llm": "llm"
})

app = graph.compile()

result = app.invoke({
    "messages": [("user", "用 [10.1, 9.8, 10.7, 10.5, 10.9, 10.3, 10.6] 画折线图，保存到 /tmp/line.png")],
    "output": "",
})
print(result["output"])
```

### 安全沙箱（不能忽略的"地雷"）

#### 现实风险

```python
exec(user_code)  # 用户输入的代码直接执行？
```

如果 LLM 生成（或被诱导生成）了：
```python
import os
os.system("rm -rf /")
```
你的服务器就完了。

#### 三级防护（按强度递增）

| 级别 | 方案 | 适用场景 | 比喻 |
|------|------|----------|------|
| **L1 本地 exec** | 直接 `exec()` | 教学/Demo | 把刀放在桌上 |
| **L2 受限解释器** | RestrictedPython / 沙箱库 | 受信任内部工具 | 给刀装个保护套 |
| **L3 容器化沙箱** | Docker / gVisor / Firecracker | 生产环境 | 把刀锁进保险柜，用时再取 |

> 🎯 **书中原话**：工业级系统**必须**采用容器化沙箱或受限解释器。本章用 L1 仅为了演示。

---

## 2.5 人机协作：实现 Human-in-the-loop 模式

### 类比：自动驾驶的"接管机制"

- L2 自动驾驶：可以自己开，但遇到复杂路况必须让人类接管
- L4 自动驾驶：基本不用接管，但仍有紧急按钮

Agent 当前阶段 ≈ **L2/L3**——自动化很强，但**关键决策必须留给人**。

### 两种触发形式

| 形式 | 触发方式 | 比喻 | 案例 |
|------|----------|------|------|
| **强制介入** | 流程到固定节点必停 | 高速公路 ETC 必刷 | 大纲审核、删库命令确认 |
| **自主介入** | LLM 觉得需要人时主动叫 | 司机看到路况复杂主动喊"接管！" | 信息缺失追问、模糊意图澄清 |

### LangGraph 中断机制 4 件套

| 要素 | 作用 | 比喻 |
|------|------|------|
| `interrupt()` | 喊"暂停！" | 按下暂停键 |
| `memory` | 记下当前进度 | 录像机 |
| `checkpointer` | 存档点 | 游戏存档 |
| `thread_id` | 会话编号 | 哪一局游戏 |

### 2.5.2 强制人类介入（报告大纲审核为例）

在原计划模式工作流中插入 `human_node`：

```python
async def human_node(state):
    content = interrupt(state["plan"])  # 关键：中断
    if content == "确认":
        return state  # 接受原计划
    else:
        state["plan"] = content  # 用户修改计划
        return state
```

恢复流程：
```python
ret = await agent.ainvoke(Command(resume=get_user_input), config=thread_config)
```

### 2.5.3 自主触发人类介入（商品咨询为例）

**巧妙设计**：注册一个**空壳工具**

```python
@tool
async def ask_user(question: str):
    """询问用户进一步的需求"""
    pass  # 啥也不干
```

LLM 觉得信息不够时，会像调用 `get_weather` 一样调用 `ask_user("您想买几个？")`——系统捕获这个调用，弹出对话框问用户。**LLM 不知道问的是人还是 API，照常推理**。

---

## 横向对比：五大模式选择决策树

```
用户需求是什么？
   │
   ├─ 只是要"听懂用户说什么"        → 2.1 意图识别
   │
   ├─ 任务可拆解成明确步骤          → 2.2 计划模式
   │     └─ 步骤固定                 → 简单模式（人类预设计划）
   │     └─ 步骤动态                 → 复杂模式（LLM 动态更新计划）
   │
   ├─ 输出质量不稳定 / 容错率低     → 2.3 反思模式（叠在执行链路上）
   │
   ├─ 工具无法预定义 / 入参多变化   → 2.4 CodeAct 模式
   │
   └─ 涉及高风险或信息缺失           → 2.5 Human-in-the-loop
         └─ 风险点位固定             → 强制介入
         └─ 风险点位动态             → 自主介入
```

> 💡 **实战经验**：这五种模式**不是互斥的**，而是可以**叠加**。
> - DeepResearch = 计划模式 + 反思模式 + 联网搜索工具
> - Claude Code = CodeAct + 人机协作 + 反思模式

---

## LangGraph 工程踩坑清单

| 坑 | 表现 | 解法 |
|----|------|------|
| **interrupt 必须 async** | 同步模式下 `interrupt()` 直接报错 | 所有节点 `async def`，调用 `await ainvoke` |
| **递归死循环** | 工作流跑几个小时不停 | 设置 `config={"recursion_limit": 50}` |
| **同 thread_id 串扰** | 不同用户的会话状态互相覆盖 | 每个用户/会话分配独立 `thread_id` |
| **checkpointer 内存泄漏** | MemorySaver 在生产环境爆内存 | 生产用 PostgresSaver / RedisSaver 替代 |
| **结构化输出 + Few-shot 冲突** | LLM 不输出预期 schema | 提示词里**只放规则**，不放示例 |
| **工具描述 ≠ 计划目录** | LLM 调不到工具 | docstring 与提示词中的目录名**一字不差** |
| **中文输入乱码** | `input()` 拿到乱码 | `sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')` |

---

## 全章知识地图

```
第1章（理论）              第2章（实战）
   ↓                         ↓
感知模块 ─────────────→ 2.1 意图识别（分诊台）
规划模块 ─────────────→ 2.2 计划模式（项目经理）
执行模块 ─────────────→ 2.4 CodeAct 模式（万能工匠）
反思模块 ─────────────→ 2.3 反思模式（作家改稿）
人机协作 ─────────────→ 2.5 Human-in-the-loop（自动驾驶接管）
                         ↓
                   统一底座：LangGraph 工作流
                         ↓
                   第3章 DeepResearch：五者合体
```

## 贯穿全章的哲学主线

> **Agent 的本质 = 状态机 + LLM**
>
> 每一个工作流节点都是一次"读取状态 → 调用 LLM → 更新状态"的过程。
> LangGraph 把这件事工程化了。

理解了这个，所有模式（计划/反思/CodeAct/人机协作）就只是**状态机的不同边和节点组合方式**：

- **计划模式**：在 LLM 节点前后加了"大纲生成"节点
- **反思模式**：在 LLM 节点后加了"评判"节点 + 条件分支边
- **CodeAct 模式**：把工具节点替换为"代码生成+沙箱执行"
- **人机协作**：在任意节点处插入"interrupt + checkpointer + resume"三件套

---

## 学习路径建议

```
1. 先吃透 2.2.1（简单计划模式）→ 掌握 LangGraph 基本节点/边/状态
2. 再学 2.3（反思模式）       → 理解"条件分支"和"循环"的力量
3. 然后 2.5.2（强制人类介入）→ 掌握 interrupt + checkpointer 套路
4. 进阶 2.2.2（复杂计划模式） → Pydantic + with_structured_output
5. 拓展 2.4（CodeAct 模式）   → 理解"动态工具"的边界
6. 收尾 2.5.3（自主人类介入）→ 体会"空壳工具"的巧妙
7. 最后 2.1（意图识别）       → 把整套系统加上"分诊台"
```

> 🎯 **核心收获**：这五种能力不是孤立技术点，而是一个 Agent 系统的"五脏六腑"——少了哪一项，复杂任务都做不好。第 3 章 DeepResearch 就是把这五个能力融合到极致，让 Agent 能"自己研究 30 分钟"而不只是聊两句话。