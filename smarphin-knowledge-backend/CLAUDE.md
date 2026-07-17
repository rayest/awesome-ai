# CLAUDE.md

AI 知识社区公共 FastAPI 服务。

- 只暴露已发布内容、搜索、RSS 和匿名投稿接口，不承担迁移和管理写操作。
- 保持 router / service / repository / model / schema 分层。
- JSON 响应统一为 `code`、`message`、`response`；请求 ID 放响应头。
- 公共数据库账号只允许读取公开内容和写入投稿。
- 相关测试优先；无测试时至少执行 Python compile/import 检查。
