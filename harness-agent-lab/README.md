# Harness Agent Lab

一个把 `assets/abstract/Harness工程/` 中的 Agent 工程知识落成可运行代码的实战项目。

## 覆盖模式

- Intent Recognition：意图识别和上下文注入
- Function Calling / ReAct：推理-行动-观察闭环
- Plan-Act：结构化计划和逐步执行
- Reflection：生成-评估-修正
- CodeAct：代码即工具，受限 Python 执行
- HITL：缺信息或高风险时中断等待人工输入
- DeepResearch：计划、搜索、反思、报告
- Memory：短期摘要 + 长期记忆召回
- Skills：L1 标签、L2 文档、按需加载
- Manager + SubAgent：任务路由与子智能体隔离
- Compact / TaskManager：上下文压缩与任务状态管理

## 启动

### Backend

```bash
cd harness-agent-lab/backend
python3.13 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd harness-agent-lab/frontend
npm install
npm run dev
```

打开 `http://localhost:3000`。

## DeepSeek 配置

后端通过 OpenAI-compatible 接口接 DeepSeek：

```bash
DEEPSEEK_API_KEY=...
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
```

如果你账号中有 `deepseek-flash` 或其他 flash 模型名，可以直接把 `DEEPSEEK_MODEL` 改成对应模型。没有 API key 时，后端会使用 mock runner，仍然能展示完整模式流程。

当前 macOS 默认 `python3` 可能是 3.14；如果依赖安装卡在源码编译，优先使用 Homebrew 的 `python3.13`。
