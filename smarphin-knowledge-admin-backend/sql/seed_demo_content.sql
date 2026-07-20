-- 知序 Knowledge Hub 演示数据
-- 适用数据库：MySQL 5.7+/8.0+
-- 可重复执行：所有主数据均按唯一 slug 更新，不会产生重复记录。

SET NAMES utf8mb4;
START TRANSACTION;

-- 1. 文章分类
INSERT INTO knowledge_categories (slug, name, description, created_at, updated_at)
VALUES
  ('ai-foundations', 'AI 基础', '模型、提示词与生成式 AI 的基础知识。', NOW(), NOW()),
  ('agent-engineering', 'Agent 工程', '智能体架构、工具调用、记忆与评测实践。', NOW(), NOW()),
  ('product-practice', '产品实践', 'AI 产品设计、工作流和团队落地方法。', NOW(), NOW()),
  ('newsletter', '热点追踪', '近期 AI 行业变化与编辑解读。', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  description = VALUES(description),
  updated_at = NOW();

SET @category_foundations = (SELECT id FROM knowledge_categories WHERE slug = 'ai-foundations');
SET @category_agent = (SELECT id FROM knowledge_categories WHERE slug = 'agent-engineering');
SET @category_product = (SELECT id FROM knowledge_categories WHERE slug = 'product-practice');
SET @category_newsletter = (SELECT id FROM knowledge_categories WHERE slug = 'newsletter');

-- 2. 已发布文章；客户端首页按 published_at 倒序展示。
INSERT INTO knowledge_articles (
  slug, title, summary, content_markdown, content_text, cover_url,
  category_id, status, featured, published_at, scheduled_at,
  reading_minutes, source_name, source_url, source_verified,
  created_by, updated_by, is_deleted, created_at, updated_at
)
VALUES
  (
    'building-reliable-ai-agents',
    '构建可靠 AI Agent：从演示到生产的五个关键环节',
    '一个 Agent 能完成演示并不等于能够稳定上线。生产系统需要围绕状态、工具、权限、评测和可观测性建立闭环。',
    '# 构建可靠 AI Agent\n\nAgent 的核心不是让模型无限自主，而是让它在清晰边界内完成任务。\n\n## 五个关键环节\n\n1. **状态管理**：明确任务当前阶段和可恢复点。\n2. **工具契约**：为输入、输出和失败定义稳定结构。\n3. **权限边界**：高风险操作必须经过确认。\n4. **自动评测**：用真实任务集持续检查质量。\n5. **可观测性**：记录请求 ID、耗时、工具调用与失败原因。\n\n## 推荐实践\n\n先把流程做成可解释的状态机，再逐步增加模型自主性。',
    '构建可靠 AI Agent。生产系统需要状态管理、工具契约、权限边界、自动评测和可观测性。',
    NULL, @category_agent, 'published', 1, DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL,
    8, '知序编辑部', NULL, 1, NULL, NULL, 0, NOW(), NOW()
  ),
  (
    'context-engineering-introduction',
    '上下文工程入门：比提示词更重要的系统能力',
    '上下文工程关注模型在每一步究竟看到了什么，以及信息如何被选择、压缩、排序和验证。',
    '# 上下文工程入门\n\n提示词只是上下文的一部分。一个可靠系统还需要处理历史消息、检索结果、工具反馈和业务规则。\n\n## 上下文的四层结构\n\n- 系统规则：定义角色与边界。\n- 当前任务：描述本次需要完成的目标。\n- 外部知识：通过数据库或检索系统按需提供。\n- 执行反馈：记录工具结果和错误信息。\n\n> 好的上下文不是越长越好，而是让当前决策所需的信息恰好出现。',
    '上下文工程包括系统规则、当前任务、外部知识和执行反馈。好的上下文需要准确选择、压缩和排序。',
    NULL, @category_foundations, 'published', 1, DATE_SUB(NOW(), INTERVAL 2 HOUR), NULL,
    6, '知序编辑部', NULL, 1, NULL, NULL, 0, NOW(), NOW()
  ),
  (
    'ai-product-evaluation-loop',
    'AI 产品评测闭环：如何判断一次改版真的更好',
    '把用户任务转成稳定测试集，并同时观察正确率、耗时、成本和人工接管率。',
    '# AI 产品评测闭环\n\nAI 功能不能只依赖主观体验判断。团队需要建立可重复运行的评测闭环。\n\n## 最小评测集\n\n| 维度 | 示例指标 |\n| --- | --- |\n| 质量 | 任务完成率、事实错误率 |\n| 效率 | 首次响应耗时、总耗时 |\n| 成本 | 单任务 Token 与工具成本 |\n| 安全 | 越权率、敏感信息泄漏率 |\n\n每次提示词、模型或工作流变化后，都应重新运行同一批样本。',
    'AI 产品需要可重复评测，关注质量、效率、成本和安全，并在每次系统变更后运行回归测试。',
    NULL, @category_product, 'published', 0, DATE_SUB(NOW(), INTERVAL 1 DAY), NULL,
    7, '知序编辑部', NULL, 1, NULL, NULL, 0, NOW(), NOW()
  ),
  (
    'mcp-tool-design-guide',
    'MCP 工具设计指南：让模型更容易正确调用',
    '工具名称、参数说明、返回结构和错误语义会直接影响模型调用成功率。',
    '# MCP 工具设计指南\n\n一个好工具应当只做一件清晰的事，并提供可验证的结果。\n\n## 设计检查项\n\n- 名称使用清晰动词。\n- 参数说明业务含义和边界。\n- 返回稳定的结构化数据。\n- 区分可重试错误和业务拒绝。\n- 删除、发送、支付等操作需要确认。\n\n工具越容易被人理解，也越容易被模型正确使用。',
    'MCP 工具需要清晰命名、稳定参数和返回结构，并区分错误类型以及高风险操作。',
    NULL, @category_agent, 'published', 0, DATE_SUB(NOW(), INTERVAL 2 DAY), NULL,
    5, '知序编辑部', NULL, 1, NULL, NULL, 0, NOW(), NOW()
  ),
  (
    'weekly-ai-signal-001',
    '本周 AI 信号：竞争正在从模型能力转向交付系统',
    '模型能力仍在进步，但决定真实效果的因素越来越集中在数据、上下文、工具和评测系统。',
    '# 本周 AI 信号\n\n本周值得持续观察的变化，是团队开始把重点从单次模型效果转移到完整交付系统。\n\n## 为什么重要\n\n- 同一个模型在不同上下文系统中的表现差异很大。\n- 工具调用和权限设计决定了 Agent 能否进入生产环境。\n- 持续评测正在成为 AI 产品迭代的基础设施。\n\n这意味着团队需要同时建设产品流程、工程系统和内容治理。',
    '本周 AI 信号：竞争重点正从单次模型能力转向数据、上下文、工具和评测组成的交付系统。',
    NULL, @category_newsletter, 'published', 0, DATE_SUB(NOW(), INTERVAL 3 HOUR), NULL,
    4, '知序编辑部', NULL, 1, NULL, NULL, 0, NOW(), NOW()
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title), summary = VALUES(summary),
  content_markdown = VALUES(content_markdown), content_text = VALUES(content_text),
  category_id = VALUES(category_id), status = 'published', featured = VALUES(featured),
  published_at = VALUES(published_at), reading_minutes = VALUES(reading_minutes),
  source_name = VALUES(source_name), source_verified = VALUES(source_verified),
  is_deleted = 0, updated_at = NOW();

-- 3. 专题及文章阅读顺序
INSERT INTO knowledge_topics (
  slug, title, summary, audience, goals, status, published_at, created_at, updated_at
)
VALUES (
  'production-agent-starter',
  '生产级 Agent 入门路径',
  '从上下文、工具设计到评测闭环，建立一套能够持续迭代的 Agent 工程方法。',
  '准备把 AI Agent 从原型推进到真实业务的产品经理和工程师',
  '理解上下文工程的基本结构\n设计边界清晰的 MCP 工具\n建立可重复运行的质量评测',
  'published', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NOW()
)
ON DUPLICATE KEY UPDATE
  title = VALUES(title), summary = VALUES(summary), audience = VALUES(audience),
  goals = VALUES(goals), status = 'published', published_at = VALUES(published_at), updated_at = NOW();

SET @topic_agent = (SELECT id FROM knowledge_topics WHERE slug = 'production-agent-starter');
DELETE FROM knowledge_topic_articles WHERE topic_id = @topic_agent;
INSERT INTO knowledge_topic_articles (topic_id, article_id, position)
SELECT @topic_agent, id, 1 FROM knowledge_articles WHERE slug = 'context-engineering-introduction'
UNION ALL
SELECT @topic_agent, id, 2 FROM knowledge_articles WHERE slug = 'mcp-tool-design-guide'
UNION ALL
SELECT @topic_agent, id, 3 FROM knowledge_articles WHERE slug = 'building-reliable-ai-agents'
UNION ALL
SELECT @topic_agent, id, 4 FROM knowledge_articles WHERE slug = 'ai-product-evaluation-loop';

-- 4. 可直接在资源库查看和复制的内容
INSERT INTO knowledge_resources (
  slug, title, summary, resource_type, platform, difficulty, file_format,
  content, instructions, variables, version, requires_api_key, featured,
  status, published_at, verified_at, created_by, updated_by, is_deleted, created_at, updated_at
)
VALUES
  (
    'agent-system-prompt-template', '可靠 Agent System Prompt 模板',
    '包含角色、目标、边界、工具策略和失败处理的通用 System Prompt。',
    'prompt_rules', '通用', '入门', 'Markdown',
    '# 角色\n你是 {{ROLE}}。\n\n# 目标\n完成 {{GOAL}}，并给出可验证结果。\n\n# 边界\n- 不泄露敏感信息\n- 高风险操作前请求确认\n- 工具失败时说明原因，不伪造结果',
    '复制后替换变量，并根据业务补充具体工具说明和验收标准。',
    '{{ROLE}}：角色；{{GOAL}}：任务目标', '1.0.0', 0, 1,
    'published', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NULL, NULL, 0, NOW(), NOW()
  ),
  (
    'mcp-tool-review-checklist', 'MCP 工具评审清单',
    '上线前检查工具命名、参数、权限、错误处理和幂等性的清单。',
    'agent_protocol', 'MCP', '进阶', 'Markdown',
    '## 工具评审\n\n- [ ] 工具名称表达唯一动作\n- [ ] 必填参数有业务说明\n- [ ] 返回值结构稳定\n- [ ] 写操作具备幂等策略\n- [ ] 高风险操作要求确认\n- [ ] 错误信息支持定位和重试',
    '在工具评审或发布检查中逐项确认，并把未通过项记录到任务系统。',
    '无需修改变量', '1.1.0', 0, 1,
    'published', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), NULL, NULL, 0, NOW(), NOW()
  ),
  (
    'ai-feature-evaluation-sheet', 'AI 功能评测用例模板',
    '用于整理真实任务、期望结果、评分规则和回归结果。',
    'code_evaluation', '通用', '进阶', 'CSV',
    'case_id,input,expected,quality_score,latency_ms,cost,notes\n001,示例输入,示例期望结果,,,,',
    '至少收集 20 条真实用户任务；每次修改模型、提示词或工作流后运行同一数据集。',
    'input：真实任务；expected：最低验收标准', '1.0.0', 0, 0,
    'published', DATE_SUB(NOW(), INTERVAL 3 DAY), NOW(), NULL, NULL, 0, NOW(), NOW()
  )
ON DUPLICATE KEY UPDATE
  title = VALUES(title), summary = VALUES(summary), resource_type = VALUES(resource_type),
  platform = VALUES(platform), difficulty = VALUES(difficulty), file_format = VALUES(file_format),
  content = VALUES(content), instructions = VALUES(instructions), variables = VALUES(variables),
  version = VALUES(version), requires_api_key = VALUES(requires_api_key), featured = VALUES(featured),
  status = 'published', published_at = VALUES(published_at), verified_at = VALUES(verified_at),
  is_deleted = 0, updated_at = NOW();

-- 5. 模型和工具目录
INSERT INTO knowledge_catalog_profiles (
  slug, name, profile_type, provider, summary, pricing, availability, context_window,
  capabilities, best_for, limitations, latest_change, website_url,
  api_available, open_source, status, published_at, verified_at,
  created_by, updated_by, is_deleted, created_at, updated_at
)
VALUES
  (
    'demo-general-model', '示例通用模型', 'model', '示例厂商',
    '用于展示模型目录字段的演示数据，不代表真实产品参数。',
    '按量计费（演示）', 'Web / API', '128K（演示）',
    '文本生成\n结构化输出\n工具调用', '内容整理、知识问答和通用自动化',
    '关键事实仍需人工核验', '演示数据：补充了工具调用能力说明', NULL,
    1, 0, 'published', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NULL, NULL, 0, NOW(), NOW()
  ),
  (
    'demo-open-model', '示例开源模型', 'model', '开源社区',
    '用于展示可私有部署模型的演示条目。',
    '模型权重免费，部署产生计算成本', '自部署', '32K（演示）',
    '文本生成\n本地部署\n领域微调', '数据敏感或需要深度定制的业务',
    '部署和运维成本较高', '演示数据：更新了部署建议', NULL,
    1, 1, 'published', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), NULL, NULL, 0, NOW(), NOW()
  ),
  (
    'demo-agent-workbench', '示例 Agent 工作台', 'tool', '示例团队',
    '用于展示 Agent 调试、运行记录和评测管理的工具条目。',
    '提供免费版与团队版（演示）', 'Web / macOS / Windows', '不适用',
    '工作流编排\n工具调试\n运行日志', '需要快速验证 Agent 工作流的产品和研发团队',
    '复杂生产流程仍需自行扩展', '演示数据：增加运行日志能力', NULL,
    1, 0, 'published', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NULL, NULL, 0, NOW(), NOW()
  ),
  (
    'demo-mcp-inspector', '示例 MCP 检查器', 'tool', '开源社区',
    '用于调试 MCP Server 工具、资源和提示词的演示条目。',
    '免费（演示）', '本地运行', '不适用',
    '工具调用测试\n返回结构检查\n错误定位', '开发和调试 MCP Server',
    '只用于开发调试，不代替生产监控', '演示数据：补充错误定位说明', NULL,
    0, 1, 'published', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW(), NULL, NULL, 0, NOW(), NOW()
  )
ON DUPLICATE KEY UPDATE
  name = VALUES(name), profile_type = VALUES(profile_type), provider = VALUES(provider),
  summary = VALUES(summary), pricing = VALUES(pricing), availability = VALUES(availability),
  context_window = VALUES(context_window), capabilities = VALUES(capabilities),
  best_for = VALUES(best_for), limitations = VALUES(limitations), latest_change = VALUES(latest_change),
  website_url = VALUES(website_url), api_available = VALUES(api_available), open_source = VALUES(open_source),
  status = 'published', published_at = VALUES(published_at), verified_at = VALUES(verified_at),
  is_deleted = 0, updated_at = NOW();

-- 6. 播客演示条目；音频使用公开测试音频，仅用于验证播放器。
INSERT INTO knowledge_podcasts (
  slug, title, summary, show_notes, chapters, cover_url, audio_url,
  duration_seconds, status, published_at, created_at, updated_at
)
VALUES (
  'demo-agent-engineering-podcast',
  '演示播客：从 Agent 原型到生产系统',
  '用几分钟了解 Agent 上线前需要补齐的工程环节。',
  '## 本期内容\n\n这是用于验证播客列表、详情页和播放器的初始化数据。\n\n正式使用时，请在管理后台替换为真实节目和音频地址。',
  JSON_ARRAY(
    JSON_OBJECT('time', '00:00', 'title', '为什么原型不等于生产系统'),
    JSON_OBJECT('time', '00:03', 'title', '状态、权限与评测闭环')
  ),
  NULL,
  'https://mdn.github.io/shared-assets/audio/t-rex-roar.mp3',
  7, 'published', DATE_SUB(NOW(), INTERVAL 1 DAY), NOW(), NOW()
)
ON DUPLICATE KEY UPDATE
  title = VALUES(title), summary = VALUES(summary), show_notes = VALUES(show_notes),
  chapters = VALUES(chapters), audio_url = VALUES(audio_url), duration_seconds = VALUES(duration_seconds),
  status = 'published', published_at = VALUES(published_at), updated_at = NOW();

COMMIT;

-- 执行结果汇总
SELECT 'categories' AS data_type, COUNT(*) AS published_count FROM knowledge_categories
UNION ALL
SELECT 'articles', COUNT(*) FROM knowledge_articles WHERE status = 'published' AND is_deleted = 0
UNION ALL
SELECT 'topics', COUNT(*) FROM knowledge_topics WHERE status = 'published'
UNION ALL
SELECT 'resources', COUNT(*) FROM knowledge_resources WHERE status = 'published' AND is_deleted = 0
UNION ALL
SELECT 'catalog_profiles', COUNT(*) FROM knowledge_catalog_profiles WHERE status = 'published' AND is_deleted = 0
UNION ALL
SELECT 'podcasts', COUNT(*) FROM knowledge_podcasts WHERE status = 'published';
