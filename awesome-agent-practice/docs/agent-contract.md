# Agent Contract

## Function Calling

当前 demo 用规则模拟模型选择工具，保留真实工程边界：

1. 工具在 `backend/app/tools/function_tools.py` 注册。
2. `FunctionCallingService` 根据输入选择工具并生成参数。
3. 业务函数执行后返回结构化结果。
4. 前端展示 tool call 的名称、参数、返回值。

后端 API 统一返回 `code`、`message`、`response` 三个顶层字段，业务结果放在 `response` 中。

真实模型路径使用 OpenAI API 兼容格式，可通过 `OPENAI_BASE_URL` 指向 DeepSeek 等兼容服务。

## GitHub MCP

默认配置：

```json
{
  "type": "http",
  "url": "https://api.githubcopilot.com/mcp/",
  "headers": {
    "Authorization": "Bearer ${GITHUB_TOKEN}",
    "X-MCP-Toolsets": "repos,issues,pull_requests,actions",
    "X-MCP-Readonly": "true"
  }
}
```

计划模式分三档：

| mode | 行为 |
|------|------|
| `read_only` | 只读取 GitHub 证据并生成计划 |
| `propose` | 生成 Issue / PR 评论草稿，不提交 |
| `execute` | 二次确认后才允许写 GitHub |
