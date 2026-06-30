# Awesome Agent Practice

一个用于学习后继续实战的 Agent 工程练习项目。项目采用前后端分离：

- `backend/`：FastAPI，演示 Function Calling 与 GitHub MCP 接入边界
- `frontend/`：Vite + React，提供两个实验台

当前阶段先实现两条主线：

1. **Function Calling**：后端注册确定性工具，模拟模型选择工具后的执行过程。
2. **GitHub MCP**：生成计划模式下的 GitHub 开发任务计划，并提供 GitHub MCP 配置预览。

## 快速启动

需要分别启动后端和前端两个进程：

1. 后端启动在 `http://localhost:8010`。
2. 前端启动在 `http://localhost:5173`。
3. 前端默认请求 `http://localhost:8010`，不需要额外配置即可连接本地后端。

## 运行后端

```bash
cd awesome-ai/awesome-agent-practice/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8010
```

启动后可访问 `http://localhost:8010/api/health` 检查后端是否正常。

没有 `OPENAI_API_KEY` 或 `GITHUB_TOKEN` 时，后端会使用 mock runner，仍可完整体验流程。

## 运行前端

```bash
cd awesome-ai/awesome-agent-practice/frontend
npm install
npm run dev
```

默认访问 `http://localhost:5173`，前端会请求 `http://localhost:8010`。

## 环境变量

后端 `.env` 支持：

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
GITHUB_TOKEN=
GITHUB_MCP_URL=https://api.githubcopilot.com/mcp/
GITHUB_MCP_TOOLSETS=repos,issues,pull_requests,actions
GITHUB_MCP_READONLY=true
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## API

- `GET /api/health`
- `GET /api/github-mcp/config`
- `POST /api/function-calling/run`
- `POST /api/github-mcp/plan`

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
4. 最后把 mock runner 替换为真实 OpenAI Agents SDK Runner，并把 GitHub MCP Server 挂到 agent。
