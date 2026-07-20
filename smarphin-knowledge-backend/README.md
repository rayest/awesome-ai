# Smarphin Knowledge Public API

公共只读与投稿服务。生产环境使用 MySQL 的 `knowledge_public_app` 账号；本地未配置时默认使用 SQLite 方便启动。

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 19093
```

默认健康检查地址为 `http://localhost:19093/health`。端口通过 `.env` 的 `APP_PORT=19093` 固定配置。
