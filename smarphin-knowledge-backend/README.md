# Smarphin Knowledge Public API

公共只读与投稿服务。生产环境使用 MySQL 的 `knowledge_public_app` 账号；本地未配置时默认使用 SQLite 方便启动。

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8101
```
