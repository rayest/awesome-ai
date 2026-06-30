# Awesome AI

一个用于学习后继续实战的 Agent 工程练习项目。项目采用前后端分离：

- `backend/`：FastAPI，演示 Function Calling 与 GitHub MCP 接入边界
- `frontend/`：Vite + React，提供两个实验台

当前阶段先实现两条主线：

1. **Function Calling**：后端注册确定性工具，模拟模型选择工具后的执行过程。
2. **GitHub MCP**：生成计划模式下的 GitHub 开发任务计划，并提供 GitHub MCP 配置预览。

## 快速启动

需要分别启动后端和前端两个进程：

1. 后端固定启动在 `http://localhost:18082`。
2. 前端固定启动在 `http://localhost:18083`。
3. 前端默认请求 `http://localhost:18082`，不需要额外配置即可连接本地后端。

## 运行后端

```bash
cd awesome-ai/awesome-agent-practice/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 18082
```

启动后可访问 `http://localhost:18082/api/health` 检查后端是否正常。

没有 `OPENAI_API_KEY` 或 `GITHUB_TOKEN` 时，后端会使用 mock runner，仍可完整体验流程。配置 `OPENAI_API_KEY` 后，页面的 Function Calling 会默认通过 OpenAI API 兼容格式调用 DeepSeek。

## 运行前端

```bash
cd awesome-ai/awesome-agent-practice/frontend
npm install
npm run dev
```

默认访问 `http://localhost:18083`，前端会请求 `http://localhost:18082`。

## 环境变量

后端 `.env` 支持：

```bash
OPENAI_API_KEY=
DEEPSEEK_API_KEY=
OPENAI_MODEL=deepseek-v4-flash
OPENAI_BASE_URL=https://api.deepseek.com
GITHUB_TOKEN=
GITHUB_MCP_URL=https://api.githubcopilot.com/mcp/
GITHUB_MCP_TOOLSETS=repos,issues,pull_requests,actions
GITHUB_MCP_READONLY=true
FRONTEND_ORIGINS=http://localhost:18083,http://127.0.0.1:18083
```

## API

- `GET /api/health`
- `GET /api/github-mcp/config`
- `POST /api/function-calling/run`
- `POST /api/github-mcp/plan`
- `GET /api/practice-theory/{function|github}`

所有接口返回统一 JSON 顶层结构：

```json
{
  "code": 0,
  "message": "success",
  "response": {}
}
```

## 学习路线

1. 先看 `backend/app/tools/function_tools.py`：理解 API 如何被封装成 Agent tool。
2. 再看 `backend/app/services/function_calling.py`：理解模型选工具前后的协议边界。
3. 再看 `backend/app/services/github_mcp.py`：理解计划模式如何限制写操作。
4. 最后把 mock runner 切到真实 OpenAI API 兼容调用，并观察 DeepSeek Function Calling 的业务返回。
