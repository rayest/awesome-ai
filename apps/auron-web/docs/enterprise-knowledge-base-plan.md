# Auron 企业知识库建设方案

> 文档状态：Decision Record v1.0  
> 创建日期：2026-07-24  
> 适用范围：Auron 企业文档、业务知识检索与 AI Agent 上下文  
> 关联文档：[AI Native 开发计划](./ai-native-development-plan.md)、[AI Native PRD](./ai-native-prd.md)、[CRM 数据模型](./crm-schema.md)

---

## 1. 需要记住的结论

### 1.1 产品结论

Auron 应支持企业上传或同步自己的文档，并形成租户隔离、权限可控、版本可追溯的企业知识库。

知识库不只是“上传附件”，需要形成完整生命周期：

```text
上传 / 同步
  → 安全检查
  → OCR / 文档解析
  → 章节与表格识别
  → Chunk 切分
  → 元数据与权限
  → 全文 / 向量索引
  → 人工审核
  → 发布生效
  → Agent 检索与引用
  → 更新、失效或归档
```

### 1.2 技术结论

企业知识库不一定需要独立向量数据库。

- 文档管理、权限、版本和精确搜索可以只使用 PostgreSQL；
- 自然语言问答、同义表达和相似案例检索适合加入向量能力；
- 向量能力可以使用 PostgreSQL / PolarDB 的 pgvector，不需要立刻部署专用向量数据库；
- 企业场景推荐“结构化查询 + 关键词检索 + 向量检索”的混合方案；
- 模型不能直接访问数据库或向量存储，只能调用受控的知识检索工具。

### 1.3 Auron 当前推荐方案

Phase 0–1：

```text
阿里云 OSS
  + PolarDB PostgreSQL
  + PostgreSQL 全文检索
  + pgvector
  + 自建 Knowledge Service
```

暂不直接使用：

- DashVector 作为唯一知识存储；
- 自建 Milvus 集群；
- FAISS / Chroma 本地文件作为生产存储；
- 只使用向量搜索、不做关键词和权限过滤；
- 把企业文档微调进模型。

### 1.4 后续升级路径

当真实压测证明 PostgreSQL 向量检索成为瓶颈后，再通过适配器迁移至：

- DashVector；
- PolarSearch；
- Milvus；
- OpenSearch / Elasticsearch Vector Search。

文档、权限、版本和审核状态继续以 PostgreSQL 为事实源。

---

## 2. 建设目标

企业知识库需要支持：

- 企业上传 PDF、Word、Excel、Markdown 和图片；
- 扫描文档 OCR；
- 飞书、Notion、Google Drive 等外部数据源同步；
- 按企业、角色、部门、客户和文档设置权限；
- 文档版本、生效时间、过期和归档；
- 标题、正文、编号和标签的精确搜索；
- 自然语言语义搜索；
- 客户专属知识过滤；
- 搜索结果引用页码、章节和原文；
- Agent 使用企业知识完成报价、异常、工艺和 CRM 任务；
- 管理员查看知识被引用和反馈的情况；
- 文档更新或删除后及时更新索引。

---

## 3. 业务知识范围

建议预设以下知识空间：

| 知识空间 | 典型内容 | 主要使用者 |
|---|---|---|
| 公司制度 | 审批、报价、权限、操作制度 | 全员 / 管理层 |
| 报价规则 | 毛利、税率、价格有效期、特殊审批 | 报价员、老板 |
| 工艺标准 | 机型、织造、染色、尺寸和质量规范 | 工艺师、报价员 |
| 物料与供应商 | 规格、报价单、交期说明、供应商资料 | 报价员、采购 |
| 客户专属知识 | 包装、质量、沟通和报价特殊要求 | 相关业务员 |
| 产品资料 | 款式说明、Tech Pack、图片和样品资料 | 业务员、工艺师 |
| 历史案例 | 报价、异常和工艺处理案例 | 业务团队 |
| 培训资料 | 操作手册、业务培训和常见问题 | 全员 |

---

## 4. 数据优先级

Agent 使用信息时遵循：

```text
实时业务数据
  > 当前有效且已审核的企业知识
  > 当前客户适用的特殊规则
  > 历史案例
  > 模型自身知识
```

需要注意：

- 客户特殊规则在适用客户内可覆盖公司通用规则；
- 旧版本不得覆盖当前有效版本；
- 历史案例只能作为参考，不能自动成为制度；
- 模型自身知识不得作为企业价格、规则或合同事实。

---

## 5. 知识库不是模型训练

| 技术 | 解决的问题 |
|---|---|
| RAG 知识检索 | 最新企业文档、引用、权限和版本 |
| Fine-tuning | 输出风格、格式和稳定分类行为 |
| Prompt | 当前任务指令和边界 |
| 业务 API / SQL | 实时客户、报价和工艺事实 |
| 确定性 Service | 金额、税额、成本和毛利计算 |
| Agent | 在多个工具之间完成业务目标 |

制度更新时只需要更新知识索引，不需要重新训练模型。

---

## 6. 总体架构

```text
┌──────────────────────────────────────────────┐
│ Auron Web                                    │
│ 知识中心 / 文档预览 / 检索测试 / AI 引用      │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│ Knowledge API                               │
│ 上传、权限、版本、搜索、引用、反馈            │
└──────────────┬────────────────┬─────────────┘
               │                │
┌──────────────▼───────┐ ┌──────▼──────────────┐
│ Ingestion Worker     │ │ Retrieval Service    │
│ OCR / Parser / Chunk │ │ Filter / Hybrid /    │
│ Embedding / Index    │ │ Rerank / Citation    │
└──────────────┬───────┘ └──────┬──────────────┘
               │                │
┌──────────────▼────────────────▼──────────────┐
│ PolarDB PostgreSQL                           │
│ 文档、版本、权限、Chunk、全文索引、pgvector   │
└──────────────────────┬───────────────────────┘
                       │
┌──────────────────────▼───────────────────────┐
│ OSS                                          │
│ 原文件、解析产物、缩略图                      │
└──────────────────────────────────────────────┘

Agent 只能调用：
search_enterprise_knowledge
get_knowledge_passage
get_effective_policy
```

---

## 7. 文档摄入流程

### 7.1 上传

上传时生成：

- `document_id`
- 文件哈希；
- 文件类型；
- 文件大小；
- OSS 地址；
- 租户；
- 上传用户；
- 默认权限；
- 处理任务。

### 7.2 安全检查

- 文件类型白名单；
- 文件大小限制；
- 病毒和恶意文件检查；
- 压缩包炸弹检查；
- 加密文件识别；
- 宏和可执行内容处理；
- 隐私和敏感信息标记。

### 7.3 解析

| 类型 | 处理方式 |
|---|---|
| PDF | 正文、标题、页码、表格和图片 |
| 扫描 PDF | OCR 后恢复页码与段落 |
| Word | 标题层级、列表、段落和表格 |
| Excel | Sheet、表头、单元格、合并区域和单位 |
| 图片 | OCR 或多模态理解 |
| Markdown | 标题、列表、表格和代码块 |
| 网页 | 提取正文，移除导航和广告 |

### 7.4 Chunk 切分

优先按语义结构：

1. 标题和章节；
2. 独立条款；
3. 完整表格；
4. 段落；
5. 固定长度作为最后兜底。

避免：

- 在一句话中间切断；
- 把表头和数据行拆开；
- 把适用条件与规则正文拆开；
- 一个 Chunk 混入多个客户的内容；
- 丢失页码和章节路径。

### 7.5 索引

每个 Chunk 建立：

- 全文索引；
- Embedding；
- 文档和版本关联；
- 权限元数据；
- 生效时间；
- 客户或产品关联；
- 引用定位信息。

---

## 8. 检索流程

```text
用户问题
  → 识别租户、角色、当前客户和业务对象
  → 查询改写
  → 权限 / 版本 / 生效时间过滤
  → PostgreSQL 结构化查询
  → 全文关键词检索
  → pgvector 语义检索
  → 合并与去重
  → Rerank
  → 返回可引用片段
  → Agent 结合业务数据生成答案或计划
```

### 8.1 为什么需要混合检索

关键词检索擅长：

- 客户名；
- 款号；
- 物料编号；
- 制度编号；
- 日期；
- 精确术语。

向量检索擅长：

- 同义词；
- 自然语言问题；
- 模糊表达；
- 相似工艺；
- 相似历史案例。

示例：

| 用户问题 | 主要方式 |
|---|---|
| `Q-0317-A` 报价说明 | 精确搜索 |
| 2026 报价制度第 3.2 条 | 关键词 |
| 利润太低应该怎么办 | 向量 |
| 乾盛最低毛利是多少 | 客户过滤 + 关键词 + 向量 |
| 找相似的天丝高领打底衫案例 | 结构化过滤 + 向量 |

---

## 9. 权限模型

权限过滤必须在检索发生之前完成。

### 9.1 权限维度

- `tenant_id`
- 用户；
- 角色；
- 部门；
- 知识空间；
- 文档；
- 客户；
- 产品；
- 保密等级；
- 生效和失效时间。

### 9.2 规则

- 租户之间完全隔离；
- 当前用户只能召回自己可查看的 Chunk；
- 客户专属知识只能用于对应客户；
- 文档权限变更后索引权限同步更新；
- 已失效、删除或归档内容默认不参与检索；
- 普通用户看不到系统提示词和原始工具参数；
- AI 日志不保存不必要的文档全文。

---

## 10. 版本和生命周期

### 10.1 文档状态

```text
draft
pending_review
effective
expired
archived
rejected
```

### 10.2 版本规则

- 新版本创建独立 `document_version`；
- 每个版本独立解析和索引；
- 同一文档默认只有一个当前有效版本；
- 发布新版本时，旧版本标记为过期；
- 旧版本可审计，但默认不参与搜索；
- 删除文档时同时删除或禁用所有向量；
- 版本切换支持回滚。

---

## 11. 推荐数据模型

### 11.1 `knowledge_space`

- `id`
- `tenant_id`
- `name`
- `description`
- `category`
- `default_permission`
- `created_by`
- `created_at`

### 11.2 `knowledge_document`

- `id`
- `tenant_id`
- `space_id`
- `title`
- `category`
- `owner_id`
- `customer_id`
- `product_id`
- `security_level`
- `current_version_id`
- `status`
- `created_at`
- `updated_at`

### 11.3 `knowledge_document_version`

- `id`
- `document_id`
- `version`
- `file_hash`
- `object_key`
- `mime_type`
- `size`
- `status`
- `effective_from`
- `effective_to`
- `uploaded_by`
- `reviewed_by`
- `created_at`

### 11.4 `knowledge_permission`

- `id`
- `tenant_id`
- `document_id`
- `principal_type`
- `principal_id`
- `permission`
- `created_at`

`principal_type`：

- `user`
- `role`
- `department`
- `tenant`

### 11.5 `knowledge_chunk`

- `id`
- `tenant_id`
- `document_id`
- `version_id`
- `sequence`
- `content`
- `content_hash`
- `heading_path`
- `page_number`
- `table_context`
- `customer_id`
- `product_id`
- `status`
- `embedding`
- `embedding_model`
- `embedding_version`
- `created_at`

### 11.6 `knowledge_index_job`

- `id`
- `document_id`
- `version_id`
- `job_type`
- `status`
- `progress_stage`
- `retry_count`
- `error_code`
- `error_message`
- `started_at`
- `completed_at`

### 11.7 `knowledge_search_log`

- `id`
- `tenant_id`
- `user_id`
- `query`
- `filters`
- `result_chunk_ids`
- `clicked_chunk_ids`
- `latency_ms`
- `created_at`

敏感原始查询是否长期保存需要单独制定数据保留策略。

### 11.8 `knowledge_feedback`

- `id`
- `search_log_id`
- `chunk_id`
- `user_id`
- `action`
- `reason`
- `created_at`

---

## 12. 检索返回结构

```json
{
  "chunk_id": "chunk_003",
  "document_id": "doc_123",
  "title": "2026 报价管理制度",
  "version": "2.1",
  "status": "effective",
  "section": "3.2 毛利要求",
  "heading_path": ["报价制度", "毛利要求"],
  "page": 6,
  "content": "常规报价含税毛利率不得低于 18%……",
  "score": 0.91,
  "source_url": "/knowledge/doc_123?version=2.1&page=6",
  "effective_from": "2026-01-01",
  "evidence_type": "enterprise_policy"
}
```

---

## 13. Knowledge Service 接口

### 13.1 产品 API

```text
POST   /api/knowledge/documents
GET    /api/knowledge/documents
GET    /api/knowledge/documents/{id}
POST   /api/knowledge/documents/{id}/versions
POST   /api/knowledge/documents/{id}/review
POST   /api/knowledge/documents/{id}/publish
POST   /api/knowledge/documents/{id}/expire
POST   /api/knowledge/documents/{id}/archive
PUT    /api/knowledge/documents/{id}/permissions

GET    /api/knowledge/index-jobs/{id}
POST   /api/knowledge/search
POST   /api/knowledge/search/{search_id}/feedback
```

### 13.2 Agent 工具

```text
search_enterprise_knowledge
get_knowledge_passage
get_effective_policy
list_customer_knowledge
get_document_version
report_knowledge_issue
```

模型不得直接使用向量数据库 SDK。

---

## 14. 存储适配器

为避免供应商锁定，业务层只依赖统一接口：

```ts
type KnowledgeFilter = {
  tenantId: string;
  userId: string;
  roles: string[];
  customerId?: string;
  productId?: string;
  categories?: string[];
  effectiveAt: string;
};

type KnowledgeSearchResult = {
  chunkId: string;
  documentId: string;
  content: string;
  score: number;
  page?: number;
  headingPath: string[];
  sourceUrl: string;
};

interface KnowledgeStore {
  upsertChunks(chunks: KnowledgeChunk[]): Promise<void>;
  deleteDocument(documentId: string): Promise<void>;

  search(params: {
    query: string;
    embedding?: number[];
    filters: KnowledgeFilter;
    topK: number;
  }): Promise<KnowledgeSearchResult[]>;
}
```

适配器：

```text
PgVectorKnowledgeStore
DashVectorKnowledgeStore
MilvusKnowledgeStore
OpenSearchKnowledgeStore
```

---

## 15. 阿里云与本地方案

### 15.1 PolarDB PostgreSQL + pgvector

当前推荐。

优点：

- 向量、元数据、权限和版本统一；
- 支持 SQL、事务和 JOIN；
- 与开源 pgvector 接口接近；
- 容易从本地 PostgreSQL 迁移；
- 可以做全文和向量混合检索；
- 不需要额外维护向量集群。

### 15.2 DashVector

适合：

- 向量规模和查询压力显著增长；
- 检索服务需要独立扩缩容；
- 多模态和分组向量检索；
- 团队希望使用全托管专用服务。

注意：

- PostgreSQL 仍保存文档和权限事实；
- 需要 Outbox + Worker 保证同步；
- 不能在一个请求中无补偿地双写；
- 查询必须传递租户和权限过滤字段；
- 需要处理供应商 SDK 和成本绑定。

### 15.3 本地 PostgreSQL + pgvector

适合：

- PoC；
- 开发环境；
- 小规模私有化；
- 数据不能出企业内网。

生产需要额外建设：

- 主从或高可用；
- 备份与恢复；
- 扩容；
- 索引调优；
- 监控；
- 数据加密；
- 版本升级。

### 15.4 Milvus

适合：

- 大规模私有化；
- 独立检索平台；
- 有专职数据基础设施团队。

当前阶段不建议，因为运维复杂度超过 Phase 1 需要。

---

## 16. 框架选择

### 推荐原则

- 核心权限和业务逻辑由 Auron 自己实现；
- 向量数据库使用官方 SDK / SQL；
- RAG 框架只用于文档处理、Retriever 或工作流；
- 不让业务代码直接依赖框架内部数据类型；
- 通过 `KnowledgeStore` 和 Agent 工具隔离框架变化。

### 可选框架

| 框架 | 适合用途 |
|---|---|
| LlamaIndex | Loader、Chunk、Retriever、Citation |
| LangChain | Agent 工具、检索编排、Query 改写 |
| Dify | 快速验证知识库和工作流 |
| Milvus SDK | Milvus 直接访问 |
| DashVector SDK | DashVector 直接访问 |
| PostgreSQL Driver | pgvector 和全文检索 |

---

## 17. 分阶段建设

### Phase KB-0：基础文档中心

- OSS 上传；
- 文档元数据；
- 知识空间；
- 权限；
- 版本；
- 解析任务；
- 文档预览；
- 关键词搜索；
- 审核与发布。

这一阶段可以不使用向量。

### Phase KB-1：RAG 检索

- Embedding；
- pgvector；
- 混合检索；
- Rerank；
- 引用；
- 检索测试；
- 搜索反馈；
- Agent 工具。

优先接入：

- 报价规则；
- 客户专属要求；
- 工艺标准。

### Phase KB-2：外部同步和多模态

- 飞书 / Notion / Google Drive；
- 定时增量同步；
- Excel 表格增强；
- 图片和扫描件理解；
- 文档变更检测；
- 知识冲突检测。

### Phase KB-3：知识治理

- 过期提醒；
- 知识缺口发现；
- 重复内容识别；
- 低质量文档识别；
- 无引用知识识别；
- 自动整理建议；
- 知识责任人看板。

---

## 18. MVP 验收标准

- 不同租户无法检索彼此文档；
- 文档权限在检索前生效；
- 已失效版本默认不会被召回；
- 删除文档后索引同步失效；
- 每个结果包含文档、版本、章节和页码；
- 用户可以打开原文验证；
- 编号、客户名和物料编码能被精确搜索；
- 自然语言同义问题可以召回正确规则；
- 客户专属知识不会用于其他客户；
- Agent 回答中的企业事实均有引用；
- 无证据时明确说明不知道；
- 知识库故障不影响原有手工业务流程。

---

## 19. 质量指标

- Recall@K；
- Precision@K；
- MRR / NDCG；
- 引用正确率；
- 权限泄露率；
- 旧版本误召回率；
- 无依据回答率；
- 搜索结果点击率；
- 用户相关 / 不相关反馈；
- P50 / P95 检索延迟；
- 单文档解析成功率；
- 索引同步延迟；
- 单租户存储和检索成本。

---

## 20. 需要后续确认

1. 生产环境最终使用 PolarDB PostgreSQL 还是其他 PostgreSQL；
2. Embedding 模型和向量维度；
3. 文档能否发送给外部模型服务；
4. OSS Bucket 与数据保留区域；
5. 单文件大小和支持格式；
6. OCR 和表格解析方案；
7. 知识审核人和发布流程；
8. 客户专属知识的权限规则；
9. 文档保留和彻底删除策略；
10. 是否需要私有化部署；
11. 首期可用于检索评测的问题集；
12. 何时以什么指标决定迁移 DashVector。

---

## 21. 参考资料

- [阿里云 PolarDB PostgreSQL 向量检索方案](https://help.aliyun.com/zh/polardb/polardb-for-postgresql/polardb-for-postgresql-vector-search-overview)
- [阿里云 PolarDB PostgreSQL 混合检索](https://help.aliyun.com/zh/polardb/polardb-for-postgresql/vector-hybrid-retrieval)
- [阿里云 DashVector](https://help.aliyun.com/zh/product/2510217.html)
- [pgvector](https://github.com/pgvector/pgvector)
- [Milvus Integrations](https://milvus.io/docs/integrations_overview.md)

