# CLAUDE.md

AI 知识社区管理 FastAPI 服务。

- 本服务唯一负责数据库迁移、管理写接口、采集、AI 草稿、OSS、任务和审计。
- 保持 router / service / repository / model / schema / provider 分层。
- 发布、撤回、归档、重试和生成必须记录操作者及关键前后状态。
- AI 只能写入草稿，任何 Provider 均不得绕过人工审核发布。
- 外部调用记录清晰中文日志，但不得记录密钥、完整正文或隐私数据。
