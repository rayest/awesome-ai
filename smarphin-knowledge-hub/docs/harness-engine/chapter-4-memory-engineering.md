---
title: 第四章 记忆工程：Agent 系统的长短期上下文管理
---

# 记忆工程：让 Agent 真正"记得住"用户

## 速查表

| 记忆类型 | 一句话定义 | 核心机制 | 容量限制 | 典型场景 |
|----------|----------|----------|----------|----------|
| 短期记忆 | 当前会话的上下文窗口 | 把历史对话重新注入 LLM | Token 上限（Qwen3-Max 256KB） | 当前多轮对话 |
| 长期记忆：滑动窗口 | 保留最近 N 轮 | 截断 + 关键句过滤 | N 轮 | 轻量长对话 |
| 长期记忆：摘要压缩 | 历史 → 关键事实 | LLM 总结决策点 | Token 比例压缩 | Claude Code / OpenClaw |
| 长期记忆：外部文件 | 任务成果存文件 | 指针 + 摘要 | 磁盘无限 | DeepResearch / Cursor |
| 长期记忆：RAG 语义检索 | 历史向量化 + 相似度搜索 | Embedding + 向量库 | 索引大小 | Mem0、个性化推荐 |
| 长期记忆：图数据库 | 实体 + 关系存储 | 三元组 + 图推理 | 节点数 | 复杂关系查询 |

---

## 0. 全章比方：人脑 vs 电脑

人类记忆有 3 类：

- **短期记忆** = 你现在的思绪，几秒到几分钟就忘
- **长期记忆** = 你的日记本 / 知识库，能存一辈子
- **永久记忆** = 你的直觉 / 技能，已经变成本能

AI Agent 的记忆也分 3 类：
- **短期记忆** = 上下文窗口（Token）
- **长期记忆** = 外部存储（向量库 / 文件 / 图库）
- **永久记忆** = 模型微调后的"本能"（本章不涉及）

本章只讲前两类——**让 Agent 跨会话、跨天、跨月记得住用户**。

---

## 4.1 深入理解 Agent 记忆

### 4.1.1 短期记忆：突破 LLM 的无状态局限

**LLM 的核心特性**：**无状态**——每次 API 调用都是独立计算，模型不会自动保留历史对话。

**四大核心问题**：

| 问题 | 表现 |
|------|------|
| 上下文丢失 | 长对话中早期关键信息被截断 |
| 个性化缺失 | 无法持续捕捉用户偏好 |
| 学习能力受限 | 难以从过往交互中提取反馈 |
| 逻辑一致性难维持 | 多轮对话中前后矛盾 |

### 关键代码：LLM 无状态特性验证

**用途**：证明 LLM 不会跨调用保留上下文。

```python
import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    api_key=os.getenv("TONGYI_API_KEY"),
    base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
)

response = client.chat.completions.create(
    model="qwen3-max",
    messages=[
        {"role": "user", "content": "大明的儿子叫小明，你了解了就可以，无须做具体回答"},
    ],
)
print(response.choices[0].message.content)

response2 = client.chat.completions.create(
    model="qwen3-max",
    messages=[
        {"role": "user", "content": "小明的爸爸是谁？如果不清楚，就回复我不知道"},
    ],
)
print(response2.choices[0].message.content)
```

**运行结果**：第二次调用答"不知道"——两次调用相互独立。

### 关键代码：短期记忆实现（上下文注入）

**用途**：将历史对话重新封装进新请求，模拟短期记忆。

```python
response2 = client.chat.completions.create(
    model="qwen3-max",
    messages=[
        {"role": "user", "content": "大明的儿子叫小明，你了解了就可以，无须做具体回答"},
        {"role": "assistant", "content": "好的，我了解了。"},
        {"role": "user", "content": "小明的爸爸是谁？如果不清楚，就回复我不知道"},
    ],
)
print(response2.choices[0].message.content)
```

**这次 LLM 知道答案了**——因为历史对话被注入到 messages 数组中。

### 短期记忆的 3 种优化策略

| 策略 | 原理 | 适用场景 |
|------|------|----------|
| **滑动窗口** | 保留最近 N 轮对话 | 简单长对话 |
| **上下文摘要** | LLM 压缩历史为关键事实 | 成本敏感场景 |
| **滑动窗口 + 摘要** | 近期保留原文 + 远期压缩为摘要 | 长周期高质量对话 |

**业界案例**：
- Claude Code 提供 `/compact` 命令强制压缩
- OpenClaw（27 万 Star）在上下文耗尽前自动压缩

**滑动窗口示例**（医疗问诊中过滤天气闲聊）：

```
Human: 我最近感觉不太舒服
AI：请问你哪里不舒服呢？
Human：我可能感冒了，头疼，流鼻涕
AI：那可能真是感冒了，可以具体描述一下你的症状
Human：今天天气怎么样？    ← 系统识别为无关对话，可过滤
AI：根据你的定位，你当前的地区今天下雨，请注意保暖。
Human：我嗓子也疼，浑身冷
AI：那你可能是风寒感冒，可以吃××药
```

后续引用历史时，系统可识别并过滤"天气"等非相关信息，仅保留病情描述相关的核心语义。

### 4.1.2 长期记忆：构建 Agent 的持久化存储层

**类比**：
- 短期记忆 ≈ 计算机内存（随进程结束而清空）
- 长期记忆 ≈ 硬盘（独立于模型之外，永久化留存）

**两大工程实现模式**：

| 模式 | 原理 | 典型案例 | 优势 |
|------|------|----------|------|
| **外部文件持久化** | 任务成果保存为物理文件，窗口只保留指针 | 扣子、Cursor、DeepResearch | 不受 Token 限制 |
| **基于 RAG 的语义检索** | 历史对话向量化，相似度搜索召回 | Mem0、个性化推荐 | 精准唤醒久远记忆 |

**扣子案例**：执行复杂任务时，将中间状态写入存储空间；后续步骤按需读取，避免大量原始数据塞入对话上下文。

**Cursor 案例**：项目分析任务时，将长篇项目分析内容保存成文件，对话窗口只输出文件摘要信息。

**Mem0 优势**：
- 打破线性对话限制
- 根据当前语义需求，精准唤醒很久以前的某次相关记忆
- 持续自我进化，记忆层不断更新和修正已有的用户画像

---

## 4.2 Mem0：Agent 记忆层的标准化实现

**Mem0 定位**：不是简单存储插件，而是为 LLM 应用提供**自我进化的记忆层**。
- 已成为 AWS Agent SDK 官方记忆提供方
- GitHub 近 5 万 Star
- 分层存储 + 智能提取策略

### 4.2.1 Mem0 核心架构：多层级记忆管理

**4 层记忆架构**（表 4-1）：

| 记忆层级 | 生命周期 | 存储特性 | 典型场景 |
|----------|----------|----------|----------|
| **对话层** Conversation | 瞬时（单次请求） | 临时状态、工具调用输出 | Agent 执行的临时状态 |
| **会话层** Session | 短期（会话级） | 任务上下文、调试日志 | 多步引导（Onboarding）流程 |
| **用户层** User | 长期（持久化） | 个人偏好、行为画像 | 个性化推荐、长期助理 |
| **组织层** Organization | 全局（静态/共享） | 团队知识库、业务准则 | 企业级 FAQ、合规性检查 |

**类比人类记忆**：
- 对话层 = 便签
- 会话层 = 日记
- 用户层 = 档案

### 4.2.2 记忆生命周期：从信息提取到持久化存储

Mem0 通过 3 阶段工程化处理实现精准留存：

#### 阶段 1：语义提取与事实建模

Mem0 内部构建专门的**提取 Agent**，用 LLM 当语义过滤器，从原始对话中过滤无关闲聊，重点捕捉 7 类结构化事实：

| 类别 | 示例 |
|------|------|
| **个人偏好** | 饮食、娱乐、消费偏好 |
| **重要信息** | 姓名、关系、重要日期 |
| **计划意图** | 即将发生的事件、目标 |
| **服务偏好** | 餐饮、旅游、爱好 |
| **健康信息** | 饮食限制、健身习惯 |
| **专业信息** | 职业、工作习惯、目标 |
| **杂项** | 喜欢的书籍、电影、品牌 |

#### 阶段 2：冲突仲裁与逻辑更新

Mem0 将新事实与既有记忆库比对，驱动状态机执行 4 种原子操作：

| 操作 | 触发条件 | 示例 |
|------|----------|------|
| **ADD** 新增 | 初次出现的有效信息 | 第一次告诉 AI 喜欢黑咖啡 |
| **UPDATE** 更新 | 时效性信息变化 | "喜欢黑咖啡" → "只喝冰美式" |
| **DELETE** 删除 | 矛盾或失效事实 | 旧职位变更 |
| **NONE** 跳过 | 冗余重复信息 | 已说过的偏好再说一遍 |

#### 阶段 3：向量与图的混合存储架构

Mem0 兼容两种存储后端，混合协同：

| 存储类型 | 检索方式 | 擅长场景 | 主流产品 |
|----------|----------|----------|----------|
| **向量数据库** | 语义相似度 | 模糊匹配 | Qdrant、Chroma |
| **图数据库** | 关系推理 | 实体关联 | Neo4j |

**为什么需要图数据库**：向量数据库解决"相似性"，图数据库解决"逻辑链"。
- 例：查询"用户喜欢的饮品类别"时，图存储能通过"咖啡→饮品"的关系链实现精准推理
- 微小延迟换高质量提升

### 4.2.3 Mem0 实战：基于混合存储架构实现历史对话复用

#### 步骤 1：环境部署

**Qdrant 向量数据库**（语义相似度检索）：

```bash
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -v /root/qdrant_data:/qdrant/storage \
  qdrant/qdrant:latest
```

- 6333：API 与 Dashboard 访问端口
- `-v`：宿主机目录挂载到容器，**容器重启后数据不丢失**

**Neo4j 图数据库**（实体三元组 + 复杂关系召回）：

```bash
docker run -d \
  --name mem0-neo4j \
  --restart unless-stopped \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/mem0neo4j2024 \
  -e NEO4J_ACCEPT_LICENSE_AGREEMENT=yes \
  -e NEO4J_dbms_security_procedures_unrestricted=apoc.* \
  -e NEO4J_dbms_security_procedures_allowlist=apoc.* \
  neo4j:5.19-enterprise
```

**5 个关键参数**：

| 参数 | 作用 |
|------|------|
| `--restart unless-stopped` | 守护进程重启时容器自动启动 |
| `-p 7474:7474` | Neo4j Browser 端口（图形化管理界面） |
| `-p 7687:7687` | Bolt 协议端口（高性能二进制通信） |
| `-e NEO4J_AUTH` | 初始化认证信息（生产环境用 secrets 注入） |
| `-e NEO4J_ACCEPT_LICENSE_AGREEMENT` | 企业版协议必填 |
| APOC 插件 | Neo4j 的过程函数库 |

**核心意义**：Docker 容器本质是 ephemeral（短暂易失）的，**若无挂载，容器被删除则数据永久丢失**。命名卷实现数据与容器生命周期解耦。

#### 步骤 2：安装依赖

```bash
pip install mem0ai                  # mem0ai 主库
pip install "mem0ai[graph]"        # mem0ai 图存储库
pip install neo4j                   # neo4j 库
pip install langchain-neo4j         # LangChain 对 Neo4j 的操作库
pip install qdrant-client           # Qdrant 数据库操作库
pip install rank-bm25               # 召回结果重排序库
```

#### 步骤 3：Mem0 配置初始化

### 关键代码：Mem0 完整配置（LLM + Embedder + Qdrant + Neo4j）

**用途**：实例化具备完整记忆能力的客户端对象。

```python
from mem0 import Memory

config = {
    "llm": {
        "provider": "openai",
        "config": {
            "model": "qwen3-max",
            "api_key": os.environ.get("TONGYI_API_KEY"),
            "openai_base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
        },
    },
    "embedder": {
        "provider": "openai",
        "config": {
            "model": "text-embedding-v3",
            "api_key": os.environ.get("TONGYI_API_KEY"),
            "openai_base_url": "https://dashscope.aliyuncs.com/compatible-mode/v1",
            "embedding_dims": 1024,
        },
    },
    "vector_store": {
        "provider": "qdrant",
        "config": {
            "collection_name": "test",
            "host": "XXX.XXX.XXX.XXX",
            "port": 6333,
            "embedding_model_dims": 1024,
        },
    },
    "graph_store": {
        "provider": "neo4j",
        "config": {
            "url": "bolt://XXX.XXX.XXX.XXX:7687",
            "username": "neo4j",
            "password": "mem0neo4j2024",
        },
    },
}

memory = Memory.from_config(config)
```

**4 个关键配置块**：
- `llm`：通义千问 qwen3-max（负责语义分析、实体识别）
- `embedder`：通义千问 text-embedding-v3（1024 维向量）
- `vector_store`：Qdrant（语义相似度存储）
- `graph_store`：Neo4j（实体关系三元组存储）

### 关键代码：添加记忆（memory.add）

**用途**：模拟多轮对话，Mem0 自动完成向量化 + 知识图谱构建。

```python
conversation = [
    {"role": "user", "content": "大明的儿子叫小明"},
    {"role": "assistant", "content": "好的，我会记住的"},
    {"role": "user", "content": "大明在阿里云做产品经理工作"},
    {"role": "assistant", "content": "好的，我会记住的"},
    {"role": "user", "content": "大明的儿子喜欢喝可口可乐"},
    {"role": "assistant", "content": "好的，我会记住的"},
]

memory.add(conversation, user_id="demo-user")
```

**Mem0 内部自动完成**：
- **向量化存储**：筛选具有长期记忆价值的对话片段，转换为向量并存入 Qdrant
- **知识图谱构建**：解析对话语义，抽取"大明-父亲-小明""大明-就职于-阿里云"等三元组关系，写入 Neo4j

**user_id 的关键作用**：不仅区分不同用户，底层存储时也作为元数据字段分别写入 Qdrant 和 Neo4j，确保每位用户的记忆上下文相互隔离。

### 关键代码：召回记忆（memory.search）

**用途**：基于向量相似度 + 图关系推理检索相关记忆。

```python
results = memory.search(
    "小明的爸爸是做什么工作的？",
    user_id="demo-user",
    limit=3,        # 限制最多返回 3 条结果
    rerank=True,    # 启用结果重排序以提升相关性
)

print(results)
```

**返回结果结构**：
- `results`：基于向量相似度匹配的最相关文本片段（"大明在阿里云做产品经理工作"被正确排在首位，得益于 rerank=True）
- `relations`：从 Neo4j 图数据库提取的结构化实体关系

#### 步骤 4：构建交互式对话助手

**系统提示词**（指导 LLM 有效利用记忆）：

```text
你是一个具有长期记忆能力的 AI 助手。
你能记住用户在历次对话中分享的信息，并在回答时自然地融入这些记忆。
以下是从记忆中检索到的与当前问题相关的历史信息：
{context}
请根据以上背景知识，结合用户的当前问题给出准确、自然的回答。
如果记忆中没有相关信息，诚实地告知用户你不知道，而不是凭空捏造。
```

**测试方法**（两次运行验证）：
- **第一次运行**：注入记忆。输入若干事实性语句，输入 quit 后触发记忆存储
- **第二次运行**：使用相同 user_id 重新启动助手，提问即可触发记忆召回

---

## 4.3 容器化的高可用分布式记忆系统部署方案

**单点部署的风险**：数据库实例宕机 → 整个记忆系统不可用。

### 4.3.1 部署架构设计与脚本编写

#### 1. 架构方案设计

**Qdrant 分布式集群**（P2P 协议 + 自动分片 + 冗余存储）：

| 节点数 | 是否可行 | 原因 |
|--------|----------|------|
| 2 节点 | ❌ | 单节点永久失效时无法达成多数共识，写入和部分读取会被阻塞 |
| **3+ 节点** | ✅ | 单节点故障时仍维持服务，通过健康节点完成数据恢复 |

**Redis 缓存层**（加速热点记忆召回）：

| 操作 | 缓存策略 |
|------|----------|
| 写入记忆 `store_mem` | 写入 Qdrant 后立即清空 Redis 中对应 user_id 的缓存 |
| 召回记忆 `search_mem` | 优先查询 Redis；命中直接返回；未命中则从 Qdrant 检索并回填 |

**完整架构**：Redis 缓存 → Qdrant 3 节点集群（用 Docker Compose 编排）

**生产建议**：迁移到 Kubernetes，利用自动扩缩容 / 跨节点调度 / 健康探针 / 滚动更新。Docker Compose 可作为 K8s YAML 的良好起点。

### 关键代码：docker-compose.yml（Redis + 3 节点 Qdrant 集群）

**用途**：一键部署完整的高可用分布式记忆系统。

```yaml
version: "3.7"

services:
  redis:
    image: redis/redis-stack:latest
    container_name: redis_cache
    ports:
      - "6379:6379"
      - "8001:8001"  # RedisInsight 管理界面
    environment:
      - REDIS_ARGS=--appendonly yes --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 3
    restart: unless-stopped

  qdrant_node_1:
    image: qdrant/qdrant:latest
    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334
      - QDRANT__CLUSTER__ENABLED=true
      - QDRANT__CLUSTER__P2P__PORT=6335
    ports:
      - "6333:6333"  # HTTP API
      - "6334:6334"  # gRPC API
    volumes:
      - qdrant_data_1:/qdrant/storage
    command: ./qdrant --uri http://qdrant_node_1:6335
    healthcheck:
      test: bash -c ':> /dev/tcp/127.0.0.1/6333 || exit 1'
      interval: 5s
      timeout: 5s
      retries: 3

  qdrant_node_2:
    image: docker.1ms.run/qdrant/qdrant:latest
    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334
      - QDRANT__CLUSTER__ENABLED=true
      - QDRANT__CLUSTER__P2P__PORT=6335
    depends_on:
      - qdrant_node_1
      - redis
    ports:
      - "6433:6333"
      - "6434:6334"
    volumes:
      - qdrant_data_2:/qdrant/storage
    command: ./qdrant --bootstrap http://qdrant_node_1:6335 --uri http://qdrant_node_2:6335

  qdrant_node_3:
    image: qdrant/qdrant:latest
    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334
      - QDRANT__CLUSTER__ENABLED=true
      - QDRANT__CLUSTER__P2P__PORT=6335
    depends_on:
      - qdrant_node_2
    ports:
      - "6533:6333"
      - "6534:6334"
    volumes:
      - qdrant_data_3:/qdrant/storage
    command: ./qdrant --bootstrap http://qdrant_node_1:6335 --uri http://qdrant_node_3:6335

volumes:
  redis_data:
  qdrant_data_1:
  qdrant_data_2:
  qdrant_data_3:
```

**部署命令**：

```bash
docker compose up -d
docker ps
```

**6 个关键配置点**：

| # | 配置 | 作用 |
|---|------|------|
| 1 | Redis `--appendonly yes` | 启用 AOF 持久化，意外重启后可恢复 |
| 2 | Redis `--maxmemory 512mb` | 限制内存上限，避免爆盘 |
| 3 | Redis `allkeys-lru` | 内存满时淘汰最近最少使用的键 |
| 4 | Qdrant `node_1 --uri` | 引导节点声明 P2P 访问地址 |
| 5 | Qdrant `node_2/3 --bootstrap` | 从节点主动加入集群 |
| 6 | Qdrant 不同主机端口（6333/6433/6533） | 便于本地调试与监控 |

### 4.3.2 基于分布式记忆系统的历史对话复用

**关键洞察**：Qdrant 分布式模式下对外暴露的访问接口与单节点模式**完全一致**——客户端只需连接任意一个节点，集群内部自动路由请求。因此 **Qdrant 相关配置无须修改**。

**改造重点**：集成 Redis 缓存层，实现"读缓存 + 写失效"协同。

### 关键代码：Redis 客户端初始化

**用途**：在应用启动阶段建立与 Redis 的连接。

```python
import redis

def get_redis_client():
    """获取 Redis 客户端实例"""
    return redis.Redis(
        host=XXX.XXX.XXX.XXX,
        port=6379,
        db=0,
        decode_responses=True,
    )
```

`decode_responses=True` 确保返回的字符串为 Python 原生 str，便于后续 JSON 解析。

### 关键代码：带缓存的记忆检索（search_with_cache）

**用途**：优先尝试从 Redis 缓存中读取，未命中则回退到 Qdrant 查询并回写缓存。

```python
import hashlib
import json

def search_with_cache(
    memory: Memory,
    redis_client: redis.Redis,
    query: str,
    user_id: str,
    limit: int = 6
) -> list:
    cache_key = f"mem0:search:{user_id}:{hashlib.md5(query.encode()).hexdigest()}"

    cached = redis_client.get(cache_key)
    if cached:
        print("[Cache HIT] 直接从 Redis 返回结果")
        try:
            return json.loads(cached)
        except json.JSONDecodeError:
            print("[Cache ERROR] 缓存数据损坏，重新查询...")
            redis_client.delete(cache_key)

    print(f"[Cache MISS] 查询 Qdrant (query: {query})...")
    results = memory.search(query=query, user_id=user_id, limit=limit)

    redis_client.setex(cache_key, CACHE_TTL, json.dumps(results, ensure_ascii=False))
    print(f"[Cache SET] 结果已缓存，TTL={CACHE_TTL}s")
    return results
```

**3 个关键设计点**：

| # | 设计点 | 作用 |
|---|--------|------|
| 1 | 缓存键 `mem0:search:{user_id}:{md5(query)}` | 不同用户 / 不同查询互不干扰 |
| 2 | 容错处理 | 缓存内容损坏时主动清除回源，避免错误传播 |
| 3 | TTL 控制 | `setex` 防止缓存无限累积，保证最终一致性 |

### 关键代码：缓存失效函数（invalidate_user_cache）

**用途**：用户结束对话时清除该用户的所有相关缓存，避免返回过期信息。

```python
def invalidate_user_cache(redis_client: redis.Redis, user_id: str) -> int:
    pattern = f"mem0:search:{user_id}:*"
    keys = redis_client.keys(pattern)
    if keys:
        redis_client.delete(*keys)
        print(f"[Cache INVALIDATE] 已清除 {len(keys)} 条缓存 key")
        return len(keys)
    else:
        print("[Cache INVALIDATE] 该用户暂无缓存，无须清除")
        return 0
```

虽然 `keys` 在大数据量下存在性能风险，但本场景中缓存键数量有限，可接受其简洁性。

---

## 横向对比：短期 vs 长期记忆

| 维度 | 短期记忆 | 长期记忆 |
|------|----------|----------|
| **存储位置** | LLM 上下文窗口 | 外部存储（向量库 / 图库 / 文件） |
| **Token 限制** | 受限（Qwen3-Max 256KB） | 几乎无限 |
| **生命周期** | 单次会话 | 跨会话 / 跨月 |
| **检索方式** | 全量注入 | 向量相似度 / 图关系 / 文件路径 |
| **成本** | 高（每轮重传） | 低（按需召回） |
| **典型方案** | 上下文注入 | Mem0、Qdrant、Neo4j |

---

## 工程踩坑清单

| 坑 | 表现 | 解法 |
|----|------|------|
| **LLM 无状态被忽视** | "刚才不是说了吗"AI 答不知道 | 每次调用都附历史 messages |
| **Qdrant 单点宕机** | 整个记忆系统不可用 | 3 节点集群 + 健康探针 |
| **Neo4j 容器被删** | 图数据全部丢失 | 必须挂载命名卷 `-v` |
| **缓存与存储不一致** | 召回返回过期信息 | 写时清空 Redis，TTL 控制 |
| **2 节点 Qdrant** | 单节点失效时无法恢复 | 必须 3 节点及以上 |
| **RAG 召回不精准** | 相似但无关的文档被召回 | 启用 `rerank=True` + 调整 `limit` |
| **Mem0 配置项缺失** | 实例化报错 | llm + embedder + vector_store + graph_store 四件套齐全 |
| **短期记忆 Token 爆** | 调用成本激增 | 滑动窗口 + 上下文摘要组合 |

---

## 全章知识地图

```
第4章 记忆工程
│
├── 4.1 Agent 记忆基础
│   ├── 4.1.1 短期记忆
│   │   ├── LLM 无状态特性
│   │   ├── 上下文注入（短期记忆实现）
│   │   └── 3 种优化策略（滑动窗口 / 摘要压缩 / 组合）
│   └── 4.1.2 长期记忆
│       ├── 外部文件持久化（扣子 / Cursor / DeepResearch）
│       └── RAG 语义检索（Mem0）
│
├── 4.2 Mem0 标准实现
│   ├── 4.2.1 4 层记忆架构（对话 / 会话 / 用户 / 组织）
│   ├── 4.2.2 3 阶段生命周期
│   │   ├── 阶段 1：语义提取（7 类事实）
│   │   ├── 阶段 2：冲突仲裁（ADD / UPDATE / DELETE / NONE）
│   │   └── 阶段 3：混合存储（Qdrant 向量 + Neo4j 图）
│   └── 4.2.3 实战：历史对话复用
│       ├── Docker 部署 Qdrant + Neo4j
│       ├── Memory.from_config 配置
│       ├── memory.add 添加
│       └── memory.search 召回
│
└── 4.3 高可用分布式部署
    ├── 4.3.1 架构设计
    │   ├── Qdrant 3 节点集群（P2P + 多数派）
    │   └── Redis 缓存层（写时失效 + 读时回填）
    └── 4.3.2 代码改造
        ├── Redis 客户端封装
        ├── search_with_cache（缓存优先）
        └── invalidate_user_cache（写时清空）
```

---

## 贯穿主线

> **Agent 记忆 = 短期记忆（上下文窗口）+ 长期记忆（向量库 + 图库 + 文件）**
>
> LLM 本身无状态，但 Agent 可以通过**外部存储 + 精准召回**让 LLM 看起来"记得住"用户。
>
> **Mem0 = LLM 提取 + ADD/UPDATE/DELETE 仲裁 + Qdrant/Neo4j 混合存储**——这是当前最成熟的标准化方案。

---

## 学习路径建议

| 阶段 | 必学 | 推荐时长 |
|------|------|----------|
| 入门 | LLM 无状态特性 + 上下文注入 | 1-2 天 |
| 进阶 | 滑动窗口 + 上下文摘要策略 | 3-5 天 |
| 实战 | Mem0 配置 + 4 层记忆架构 | 1 周 |
| 高级 | Qdrant + Neo4j 混合存储 | 1-2 周 |
| 专家 | 3 节点集群 + Redis 缓存层 | 2-3 周 |

---

## 生产化 3 维度增强

1. **检索深度**：在 Mem0 基础上叠加知识图谱 Neo4j，支持复杂关系推理
2. **写入性能**：批量写入 + 异步队列，处理高并发场景
3. **隐私保护**：用户级隔离 + 加密存储 + 自动遗忘机制（GDPR 合规）
